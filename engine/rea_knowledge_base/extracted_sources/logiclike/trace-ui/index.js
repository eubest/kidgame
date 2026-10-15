import '../onErrorHandler.js';
import Trace from './trace';

let trace = null;

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
  if (type === 'text') {
    trace = new Trace(document.getElementById('trace'), data, (eventName, data) => {
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: eventName, data }));
    });
  }
  if (type === 'clear' && trace) {
    trace.clear();
  }
};

window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'load' }));

if (!window.ReactNativeWebView) {
  trace = new Trace(document.getElementById('trace'), {
    name: 'N-pl',
    placeholderBrush: { color: '#F0BF5F', dashed: false, size: 38 },
    type: 'capitalLetters',
    userBrush: { color: '#FF6363', dashed: false, size: 38 },
  });
}

document.addEventListener('message', messageHandler); // for Android
window.addEventListener('message', messageHandler); // for iOS
