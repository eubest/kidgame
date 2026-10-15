import FindTheNumber from './FindTheNumber';
import type { FindTheNumberConfig } from './FindTheNumber';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let findTheNumber: FindTheNumber | null = null;

const messageHandler = ({ data: stringData }) => {
  let parsedData: { type: string; data: FindTheNumberConfig };
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
    if (findTheNumber) {
      findTheNumber.destroy();
      findTheNumber = null;
    }
  }
  if (type === 'config') {
    if (findTheNumber) {
      findTheNumber.destroy();
      findTheNumber = null;
    }
    ctx.imageSmoothingEnabled = false;
    canvas.width = innerWidth * window.devicePixelRatio;
    canvas.height = innerHeight * window.devicePixelRatio;
    findTheNumber = new FindTheNumber(canvas, ctx, data);
    findTheNumber.start();
    findTheNumber.subscribe('consume', () => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'consume',
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
  findTheNumber = new FindTheNumber(canvas, ctx, { number: 7 });
  findTheNumber.start();
  findTheNumber.subscribe('consume', () => {
    console.log('consume');
  });
}
