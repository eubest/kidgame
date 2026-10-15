window.onerror = function (msg, url, lineNo, columnNo, error) {
  if (window.ReactNativeWebView) {

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        type: 'webview-error',
        data: {
          msg, url, lineNo, columnNo, error: {
            message: error?.message,
            data: JSON.stringify(error || {}),
          },
        }
      }),
    );
  }
  return false;
}
