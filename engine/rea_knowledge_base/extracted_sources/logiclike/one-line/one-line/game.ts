import OneLine from './OneLine';

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let oneLine: OneLine | null = null;

const svg = `<svg width="591" height="591" viewBox="0 0 591 591" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M139.557 384.248C156.375 351.815 221.413 283.962 347.022 272.015" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M452.76 48L492.603 255.27" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M492.715 255.271C523.05 384.249 385.409 449.869 296.471 380.628" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M216.98 544L296.471 380.628" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M216.98 544L139.557 384.248" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M347.023 272.015L296.471 380.628" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M347.023 272.015L393.761 174.263" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M393.76 174.263C418.595 176.073 474.604 194.809 492.714 255.27" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M347.023 272.015L492.715 255.271" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M347.023 272.015C298.127 264.276 293.092 196.172 250 178.5" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M139.557 384.248C40.6367 304.229 130.013 129.296 250 178.5" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M139.557 384.248C166.592 402.2 237.272 425.883 296.47 380.628" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M453.111 48L394 174.263" stroke="#763737" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const insertSvgIntoDOM = (svg: string) => {
  const node = document.createElement('div');
  node.innerHTML = svg;
  const svgNode = node.children[0];
  svgNode.setAttribute('id', 'svg');
  document.body.appendChild(svgNode);
};

const messageHandler = ({ data: stringData }) => {
  // data для type: 'config' — разметка svg строкой (см. insertSvgIntoDOM).
  let parsedData: { type: string; data: string };
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

  if (type === 'reset') {
    oneLine?.reset();
  }
  if (type === 'destroy') {
    oneLine?.stop();
    oneLine = null;
    const svg = document.getElementsByTagName('svg')[0];
    if (svg) {
      svg.remove();
    }
  }
  if (type === 'config') {
    // Иначе rAF-цикл и слушатели прошлого уровня продолжают рисовать на общем canvas.
    oneLine?.stop();
    insertSvgIntoDOM(data);
    ctx.imageSmoothingEnabled = false;
    canvas.width = innerWidth * window.devicePixelRatio;
    canvas.height = innerHeight * window.devicePixelRatio;
    oneLine = new OneLine(canvas, ctx);
    oneLine.start();

    oneLine.subscribe('success', () => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'success',
        }),
      );
    });

    oneLine.subscribe('fail', () => {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'fail',
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
  insertSvgIntoDOM(svg);
  oneLine = new OneLine(canvas, ctx);
  oneLine.start();
  oneLine.subscribe('success', () => {
    console.log('success');
  });
  oneLine.subscribe('fail', () => {
    console.log('fail');
  });
}
