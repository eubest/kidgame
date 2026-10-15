// Persistent puzzle shell. Hosts puzzle iframes, animates directional
// transitions, owns continuous background music, relays the active puzzle's
// lifecycle events to the native host, and forwards pause/resume.
(function () {
  var stage = document.getElementById('stage');
  var active = null; // { frame, url }
  var SOURCE = 'puzzle-bridge';
  var BG_VOLUME = 0.25; // background music sits under the puzzle's own sounds
  var lastInsets = { top: 0, right: 0, bottom: 0, left: 0 };

  // Append the current safe-area insets to a puzzle URL as ?saTop=…&saLeft=…
  // The SDK reads these synchronously on start (see sdk/safe-area.ts).
  function withInsetsQuery(url, insets) {
    var sep = url.indexOf('?') === -1 ? '?' : '&';
    return url + sep +
      'saTop=' + insets.top +
      '&saRight=' + insets.right +
      '&saBottom=' + insets.bottom +
      '&saLeft=' + insets.left;
  }

  function relayInsets(insets) {
    if (active && active.frame && active.frame.contentWindow) {
      active.frame.contentWindow.postMessage({ type: 'SAFE_AREA', insets: insets }, '*');
    }
  }

  function postToHost(payload) {
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(payload));
      }
    } catch (_e) {}
  }

  // --- Background music ---------------------------------------------------
  // A plain <audio src="bg.mp3"> is an HTMLMediaElement with a real timeline,
  // so iOS registers it with the Now Playing center and shows lock/home-screen
  // playback controls. Instead we decode the file and play it through WebAudio,
  // routing the output (on iOS) through a hidden <audio srcObject=MediaStream>
  // sink: that element holds the audio session in .playback (so the music
  // ignores the hardware silent switch) but exposes NO timeline, so iOS never
  // surfaces playback controls. Ported from logic-problems' audio-core.
  var audioCtx = null;
  var sinkNode = null; // MediaStreamAudioDestinationNode (iOS) or null
  var sinkEl = null; // hidden <audio> holding the .playback session (iOS)
  var bgGain = null;
  var bgState = 'idle'; // idle | loading | playing
  // The music should sound only when ALL hold: the parent hasn't disabled
  // music in settings (LOAD_PUZZLE's `music` flag), the host hasn't paused us
  // (overlay / explicit GAME_PAUSE) AND the page is visible (app foreground).
  // The overlay case keeps the page visible, so it needs `hostPaused`; app
  // backgrounding / device lock we must detect IN the WebView via document
  // visibility — a GAME_PAUSE postMessage from RN is NOT reliably processed
  // once iOS suspends WebView JS on backgrounding (and WebAudio renders on its
  // own thread, so it keeps sounding until something in-page suspends it).
  var hostPaused = false;
  var musicEnabled = true;

  function isHidden() {
    if (typeof document === 'undefined') return false;
    if (typeof document.hidden === 'boolean') return document.hidden;
    if (typeof document.webkitHidden === 'boolean') return document.webkitHidden;
    return false;
  }
  function shouldPlay() {
    return musicEnabled && !hostPaused && !isHidden();
  }

  // iOS-only lever: WebKit keeps the session in .playback only while an
  // HTMLMediaElement is playing — pure WebAudio runs in an ambient session the
  // silent switch mutes. On Android a playing <audio> steals audio focus from
  // the host app, so the sink is gated to iOS (incl. desktop-UA iPads, which
  // report MacIntel + a multi-touch screen, unlike any real Mac).
  function needsMediaSink() {
    if (typeof navigator === 'undefined') return false;
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return true;
    return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  }

  function ensureAudioCtx() {
    if (audioCtx) return audioCtx;
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    audioCtx = new Ctor();
    // iOS flips to 'interrupted' (call/Siri) or 'suspended' (backgrounding) and
    // may not recover on its own; nudge both the context and the sink back.
    if (audioCtx.addEventListener) {
      audioCtx.addEventListener('statechange', function () {
        // Recover from transient interruptions (call/Siri) — but ONLY while we
        // should actually be sounding. On app background/lock iOS suspends the
        // context on purpose (document is hidden by then), and resuming here is
        // exactly what kept bg.mp3 audible on the lock screen.
        if (
          bgState === 'playing' &&
          shouldPlay() &&
          (audioCtx.state === 'interrupted' || audioCtx.state === 'suspended')
        ) {
          resumeAudio();
        }
      });
    }
    if (needsMediaSink() && typeof audioCtx.createMediaStreamDestination === 'function') {
      sinkNode = audioCtx.createMediaStreamDestination();
      // Inaudible DC keep-alive (0 Hz) so WebKit never idles the stream track.
      if (typeof audioCtx.createConstantSource === 'function') {
        var dc = audioCtx.createConstantSource();
        dc.offset.value = 1e-4;
        dc.connect(sinkNode);
        dc.start();
      }
      var el = new Audio();
      el.volume = 1; // iOS treats muted/0-volume media as "not playing"; level lives in bgGain
      el.playsInline = true;
      el.srcObject = sinkNode.stream;
      (document.body || document.documentElement).appendChild(el);
      sinkEl = el;
      el.play().catch(function () {});
    }
    return audioCtx;
  }

  function resumeAudio() {
    if (!audioCtx) return;
    if (audioCtx.resume) audioCtx.resume().catch(function () {});
    if (sinkEl) sinkEl.play().catch(function () {});
  }

  function suspendAudio() {
    // Park the graph AND the iOS media sink: the sink holds the .playback audio
    // session that would otherwise keep bg.mp3 audible on the lock screen. The
    // looping source resumes from where it left off on the next play.
    if (audioCtx && audioCtx.suspend) audioCtx.suspend().catch(function () {});
    if (sinkEl) {
      try {
        sinkEl.pause();
      } catch (_e) {}
    }
  }

  // Single entry point: bring the audio in line with shouldPlay(). Called from
  // every input that can change it — host pause/resume and page visibility.
  function syncMusic() {
    if (shouldPlay()) startMusic();
    else suspendAudio();
  }

  function startMusic() {
    var c = ensureAudioCtx();
    if (!c) return;
    if (!shouldPlay()) return; // paused or backgrounded — don't start/resume
    resumeAudio();
    if (bgState !== 'idle') return; // already loading or playing — just resumed
    bgState = 'loading';
    fetch('bg.mp3')
      .then(function (r) {
        return r.arrayBuffer();
      })
      .then(function (arr) {
        return c.decodeAudioData(arr);
      })
      .then(function (buf) {
        bgGain = c.createGain();
        bgGain.gain.value = BG_VOLUME;
        bgGain.connect(sinkNode || c.destination);
        var src = c.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        src.connect(bgGain);
        src.start(0);
        bgState = 'playing';
        if (!shouldPlay()) suspendAudio(); // went hidden/paused during the async load
      })
      .catch(function () {
        bgState = 'idle'; // let a later resume retry
      });
  }

  function makeFrame() {
    var frame = document.createElement('iframe');
    // Incoming frames render full-screen behind the current one; the outgoing
    // frame fades out on top to reveal it.
    frame.className = 'frame';
    frame.setAttribute('allow', 'autoplay; fullscreen');
    // No src yet — loadPuzzle navigates AFTER the iframe is connected (see
    // there for why), so this returns a detached, not-yet-navigating element.
    return frame;
  }

  function whenLoaded(frame, cb) {
    var done = false;
    function finish(reason) {
      if (done) return;
      done = true;
      window.removeEventListener('message', onMsg);
      clearTimeout(timer);
      console.log('[shell] whenLoaded finished via ' + reason);
      cb();
    }
    function onMsg(ev) {
      if (ev.source !== frame.contentWindow) return;
      var d = ev.data;
      if (d && d.source === SOURCE && d.type === 'loaded') finish('message');
    }
    window.addEventListener('message', onMsg);
    var timer = setTimeout(function () {
      finish('timeout');
    }, 8000);
  }

  function loadPuzzle(url) {
    // syncMusic, not startMusic: besides starting on the first load, this also
    // parks an already-playing track when a load arrives with music disabled.
    syncMusic();
    console.log('[shell] loadPuzzle ' + url);
    var incoming = makeFrame();
    // Diagnostic: the iframe's own load event tells us whether navigation
    // actually happened (vs. a blank frame that never ran the puzzle).
    incoming.addEventListener('load', function () {
      console.log('[shell] iframe load event for ' + url);
    });

    whenLoaded(incoming, function () {
      // Relay 'loaded' to the host now: at this moment `active` is still the
      // outgoing frame (or null on the first load), so the general relay
      // listener below would drop the incoming frame's 'loaded' and the RN
      // training loader would hang until its fallback timeout. Carry the same
      // {source, type} envelope the general relay forwards, so the host sees
      // one consistent shape for every puzzle event.
      postToHost({ source: SOURCE, type: 'loaded' });
      var outgoing = active;
      // Promote to active immediately so the incoming frame's later events
      // (ready, correct, …) relay; the still-visible outgoing frame's events
      // are ignored from here on.
      active = { frame: incoming, url: url };
      // Re-send the latest insets to the freshly loaded iframe so a rotation
      // between loads is reflected even though the start value rode the URL.
      relayInsets(lastInsets);
      // A GAME_PAUSE that arrived during the load went to the outgoing frame only.
      if (hostPaused) incoming.contentWindow.postMessage({ type: 'GAME_PAUSE' }, '*');
      if (!outgoing || !outgoing.frame) return; // first puzzle: nothing to reveal

      // Reveal by fading the OUTGOING frame out — the incoming sits fully
      // painted behind it, so the uncovered area is never blank.
      var out = outgoing.frame;
      var removed = false;
      function remove() {
        if (removed) return;
        removed = true;
        if (out.parentNode) out.parentNode.removeChild(out);
      }
      out.addEventListener('transitionend', remove, { once: true });
      requestAnimationFrame(function () {
        out.classList.add('fade-out');
      });
      setTimeout(remove, 500); // fallback if transitionend never fires
    });

    // Insert UNDER the current frame (as first child) so the outgoing stays on
    // top and reveals the incoming as it fades away. The 'loaded' listener
    // above is already live, so a fast/cached puzzle can't post before we
    // subscribe.
    stage.insertBefore(incoming, stage.firstChild);
    // Navigate only now that the iframe is CONNECTED. Setting src on a
    // detached iframe and relying on insertion to navigate is unreliable on a
    // cold WebKit (the very first open): the navigation can be silently
    // skipped, leaving a blank frame that never runs the puzzle and so never
    // posts 'loaded' (the 8s whenLoaded timeout then fires → white screen).
    // A connected iframe navigates reliably.
    incoming.src = withInsetsQuery(url, lastInsets);
  }

  // Relay the ACTIVE puzzle's lifecycle events to the native host, forwarding
  // the {source, type} envelope VERBATIM. The host therefore sees the exact
  // same message a puzzle would post when running standalone (no shell in the
  // path) — the shell is a transparent pipe, not a re-wrapper. Events from the
  // outgoing iframe (during a transition) are ignored.
  window.addEventListener('message', function (ev) {
    var d = ev.data;
    if (!d || d.source !== SOURCE || !d.type) return;
    if (!active || ev.source !== active.frame.contentWindow) return;
    postToHost(d);
  });

  // Host -> shell control. react-native-webview delivers the native
  // postMessage as a 'message' event dispatched on `window` (iOS) but on
  // `document` (Android) — so register the handler on BOTH. `ev.data` is the
  // JSON string we posted from RN. (The puzzle-event relay above stays on
  // `window` only: those come from a normal iframe->parent postMessage.)
  function onHostControl(ev) {
    var d = ev.data;
    if (typeof d === 'string') {
      try {
        d = JSON.parse(d);
      } catch (_e) {
        return;
      }
    }
    if (!d || !d.type) return;
    if (d.type === 'LOAD_PUZZLE' && typeof d.url === 'string') {
      // Only an explicit false disables — a host that doesn't send the flag
      // keeps the historical always-on behavior.
      musicEnabled = d.music !== false;
      if (d.insets) lastInsets = d.insets;
      loadPuzzle(d.url);
    } else if (d.type === 'SAFE_AREA' && d.insets) {
      lastInsets = d.insets;
      relayInsets(d.insets);
    } else if (d.type === 'GAME_PAUSE') {
      hostPaused = true;
      syncMusic();
      if (active && active.frame.contentWindow) active.frame.contentWindow.postMessage({ type: 'GAME_PAUSE' }, '*');
    } else if (d.type === 'GAME_RESUME') {
      hostPaused = false;
      syncMusic();
      if (active && active.frame.contentWindow) active.frame.contentWindow.postMessage({ type: 'GAME_RESUME' }, '*');
    }
  }
  window.addEventListener('message', onHostControl);
  document.addEventListener('message', onHostControl);

  // App background / device lock reaches the WebView as a visibility change
  // (document.hidden = true), fired DURING the transition while our JS can still
  // run — unlike the GAME_PAUSE postMessage above, which iOS may not deliver
  // before it suspends WebView JS. Sync on every change so the music parks on
  // background and resumes on foreground without depending on the host. Listen
  // unprefixed + webkit-prefixed for older WebKit.
  document.addEventListener('visibilitychange', syncMusic);
  document.addEventListener('webkitvisibilitychange', syncMusic);
  // Belt-and-suspenders: some engines fire pagehide without a visibilitychange.
  window.addEventListener('pagehide', suspendAudio);

  postToHost({ type: 'SHELL_READY' });
})();
