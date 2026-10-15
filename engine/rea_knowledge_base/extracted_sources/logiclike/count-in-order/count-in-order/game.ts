import CountInOrder from './CountInOrder';
import type { CountInOrderInput } from './types';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let countInOrder: CountInOrder | null = null;

const messageHandler = ({ data: stringData }) => {
  let parsedData: { type: string; data: CountInOrderInput };
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
    if (countInOrder) {
      countInOrder.destroy();
      countInOrder = null;
    }
  }
  if (type === 'config') {
    if (countInOrder) {
      countInOrder.destroy();
      countInOrder = null;
    }
    ctx.imageSmoothingEnabled = false;
    canvas.width = innerWidth * window.devicePixelRatio;
    canvas.height = innerHeight * window.devicePixelRatio;
    countInOrder = new CountInOrder(canvas, ctx, data);
    countInOrder.subscribe('finish', () => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'finish',
        }),
      );
    });
    countInOrder.subscribe('wrong', () => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'wrong',
        }),
      );
    });
    countInOrder.subscribe('number', ({ number }) => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'number',
          number,
        }),
      );
    });
    countInOrder.subscribe('introFinished', ({ number }) => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'introFinished',
        }),
      );
    });
    countInOrder.start();
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
  let data = {
    type: 'bee',
    isIntro: true,
    offset: { top: 18, left: 38, right: 94, bottom: 0 },
    sequence: [
      { number: 2, x: 78, y: 73 },
      { number: 3, x: 156, y: 0 },
      { number: 4, x: 157, y: 162 },
      { number: 5, x: 272, y: 162 },
      { number: 6, x: 273, y: 0 },
      { number: 7, x: 350, y: 73 },
      { number: 8, x: 428, y: 147 },
      { number: 1, x: 0, y: 17 },
    ],
  };
  countInOrder = new CountInOrder(canvas, ctx, data);
  countInOrder.subscribe('finish', () => {
    console.log('finish');
  });
  countInOrder.subscribe('wrong', () => {
    console.log('wrong');
  });
  countInOrder.subscribe('number', ({ number }) => {
    console.log(number);
  });
  countInOrder.start();
}
