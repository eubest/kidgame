import '../onErrorHandler.js';
import Player from './vimeo-player';
const messageHandler = ({ data: stringData }) => {
  let parsedData = {};
  try {
    parsedData = JSON.parse(stringData);
    if (!(typeof parsedData === 'object' && parsedData.hasOwnProperty('type'))) {
      throw new Error('post message is not valid');
    }
  } catch {
    // ignore
    return;
  }

  const { type, data } = parsedData;
  if (type === 'config') {
    const options = {
      id: data.id,
      loop: false,
      autoplay: true,
    };

    const player = new Player('player', options);

    player.on('play', function () {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'onPlay',
        }),
      );
    });

    player.on('pause', function () {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'onPause',
        }),
      );
    });

    player.on('ended', function () {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'onEnd',
        }),
      );
    });
  }
};

document.addEventListener('message', messageHandler); // for Android
window.addEventListener('message', messageHandler); // for iOS

if (window.ReactNativeWebView) {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'webview-load',
    }),
  );
} else {
  const options = {
    id: 759457312,
    loop: false,
    autoplay: true,
  };

  const player = new Player('player', options);
}
