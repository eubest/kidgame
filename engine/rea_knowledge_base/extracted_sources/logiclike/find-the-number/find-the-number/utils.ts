export const createImage = (imagePath: string, width: number, height: number) : HTMLCanvasElement => {
  const canvasImage = document.createElement('canvas');
  canvasImage.width = width;
  canvasImage.height = height;
  const canvasImageCtx = canvasImage.getContext('2d');
  canvasImageCtx.imageSmoothingEnabled = false;
  const image = new Image(width, height);
  image.src = imagePath.endsWith('.svg') || imagePath.endsWith('.png') || imagePath.startsWith('data:image')
    ? imagePath
    : `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(imagePath)}`;
  image.onload = () => {
    canvasImageCtx.drawImage(image, 0, 0, width, height)
  }
  return canvasImage;
}

export const getScale = (gameWidth, gameHeight) => {
  const width = window.innerWidth && document.documentElement.clientWidth ?
    Math.min(window.innerWidth, document.documentElement.clientWidth) :
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  const height = window.innerHeight && document.documentElement.clientHeight ?
    Math.min(window.innerHeight, document.documentElement.clientHeight) :
    window.innerHeight ||
    document.documentElement.clientHeight ||
    document.body.clientHeight;
  return Math.min(width / gameWidth, height / gameHeight);
}
