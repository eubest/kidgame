/**
 * Типы окружения, в котором работают html-бандлы игр: они грузятся внутрь
 * react-native-webview и общаются с приложением через мост, которого нет в DOM-типах.
 */

interface ReactNativeWebViewBridge {
  postMessage(message: string): void;
}

interface Window {
  /**
   * Мост в приложение, его внедряет react-native-webview. Отсутствует, если страницу
   * открыли в обычном браузере, — отсюда проверки `if (window.ReactNativeWebView)`.
   */
  ReactNativeWebView?: ReactNativeWebViewBridge;
}

interface Document {
  /**
   * На Android react-native-webview доставляет `postMessage` из приложения событием
   * `message` на `document` (на iOS — на `window`), а в стандартных типах такого
   * события у документа нет.
   */
  addEventListener(
    type: 'message',
    listener: (event: MessageEvent) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
}
