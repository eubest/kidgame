import CountAndSelect from './CountAndSelect';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

window.addEventListener('touchstart', () => {}, { passive: true }); // фиксает странный баг, при котором не отлавливаются тапы по экрану на iOS

let countAndSelect: CountAndSelect | null = null;

const messageHandler = ({ data: stringData }) => {
  // data для type: 'config' — число шаров.
  let parsedData: { type: string; data: { ballCount: number } };
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
    if (countAndSelect) {
      countAndSelect.destroy();
      countAndSelect = null;
    }
  }
  if (type === 'config') {
    if (countAndSelect) {
      countAndSelect.destroy();
      countAndSelect = null;
    }
    ctx.imageSmoothingEnabled = false;
    canvas.width = innerWidth * window.devicePixelRatio;
    canvas.height = innerHeight * window.devicePixelRatio;
    countAndSelect = new CountAndSelect(canvas, ctx, data.ballCount);
    countAndSelect.subscribe('number', ({ number }) => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'number',
          number,
        }),
      );
    });
    countAndSelect.start();
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
  countAndSelect = new CountAndSelect(canvas, ctx, 9);
  countAndSelect.start();
}
