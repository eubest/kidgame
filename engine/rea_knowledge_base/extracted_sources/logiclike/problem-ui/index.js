import '../onErrorHandler.js';
import { ProblemUI } from '@logiclike/problem-ui';
import '@logiclike/problem-ui/dist/style.css';
import problem from './problem.json';

const SAFE_OFFSET = 10; // also edit in index.css

let problemUI = null;
let problemData = null;
let add = () => {};
let del = () => {};
let chooseFunction = () => {};
let cancelFunction = () => {};
let closeTheory = () => {};

const sendState = () => {
  if (problemUI) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'state',
        data: {
          state: problemUI.state,
          isFilled: problemUI.isFilled(),
        },
      }),
    );
  }
};

const getScale = () => {
  if (!problemData) {
    return 1;
  }
  const width = Math.min(document.documentElement.clientWidth, document.body.clientWidth) - SAFE_OFFSET;
  const height = Math.min(document.documentElement.clientHeight, document.body.clientHeight) - SAFE_OFFSET;
  return Math.min(width / problemData.width, height / problemData.height);
};

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
  if (type === 'destroy') {
    document.getElementById('problem').innerHTML = '';
    problemUI = null;
    problemData = null;
  }
  if (type === 'variant:select') {
    chooseFunction(data.index);
  }
  if (type === 'input:add') {
    add(data.char);
  }
  if (type === 'input:del') {
    del();
  }
  if (type === 'theory:close') {
    closeTheory();
  }
  if (type === 'problem') {
    const problem = data.graphic.content;
    const state = data.state || {};
    const texts = data.texts || {};

    const el = document.getElementById('problem');
    if (el.innerHTML) {
      el.innerHTML = '';
      problemUI = null;
    }

    problemData = problem;
    problemUI = new ProblemUI({
      el: document.getElementById('problem'),
      problem,
      scale: data.scale || getScale(),
      state,
      texts,
      fastClick: data.fastClick,
    });

    problemUI?.render();
    sendState();

    problemUI?.addGraphicEventListener('theory', (data) => {
      closeTheory = data.params.watchCb;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'theory-open',
          data: {
            id: data.params.theoryId,
          },
        }),
      );
    });
    problemUI?.addGraphicEventListener('itemChanged', () => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'item-changed',
        }),
      );
      sendState();
    });
    problemUI?.addGraphicEventListener('inputClicked', (data) => {
      add = data.params.add;
      del = data.params.del;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'input-clicked',
          data: {
            id: data.target.id,
          },
        }),
      );
    });
    problemUI?.addGraphicEventListener('variants', (data) => {
      cancelFunction();
      chooseFunction = data.params.chooseFunction;
      cancelFunction = data.params.cancelFunction;
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'variants',
          data: {
            id: data.target.id,
            params: {
              variants: data.params.variants,
              canBeEmpty: data.params.canBeEmpty,
            },
          },
        }),
      );
    });
  }
};

let isDragNotified = false;
const notifyDragStart = () => {
  if (isDragNotified || !window.ReactNativeWebView) return;
  isDragNotified = true;
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'drag-start' }));
};
const notifyDragEnd = () => {
  if (!isDragNotified || !window.ReactNativeWebView) return;
  isDragNotified = false;
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'drag-end' }));
};

const onDraggablePressIn = (e) => {
  const target = e.target;
  if (target && typeof target.closest === 'function' && target.closest('.draggable')) {
    notifyDragStart();
  }
};

const onDraggablePressOut = (e) => {
  // For multi-touch: only end when all fingers are lifted.
  if (e.type === 'touchend' && e.touches && e.touches.length > 0) return;
  notifyDragEnd();
};

document.addEventListener('touchstart', onDraggablePressIn);
document.addEventListener('mousedown', onDraggablePressIn);
document.addEventListener('touchend', onDraggablePressOut);
document.addEventListener('touchcancel', onDraggablePressOut);
document.addEventListener('mouseup', onDraggablePressOut);

window.addEventListener('resize', () => {
  if (problemUI && problemData) {
    problemUI.scale = getScale();
  }
});
document.addEventListener('message', messageHandler); // for Android
window.addEventListener('message', messageHandler); // for iOS

if (window.ReactNativeWebView) {
  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'webview-load',
    }),
  );
}
