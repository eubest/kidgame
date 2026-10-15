import type { CountInOrderAssets } from './types';
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

// Partial: при неизвестном type возвращается {} (см. return в конце) —
// тогда ассетов не будет, как и было до типизации.
export const getAssets = (type: string): Partial<CountInOrderAssets> => {
  switch (type) {
    case 'bee':
      return {
        ...require('./config/bee/config.json'),
        sequenceImage: require('./config/bee/sequence-image.svg'),
        animal: require('./config/bee/animal.svg'),
        trophy: require('./config/bee/trophy.svg'),
        wrongSequence: require('./config/bee/wrong-sequence.svg'),
        finishSequence: require('./config/bee/finish-sequence.svg'),
      }
      break;
    case 'frog':
      return {
        ...require('./config/frog/config.json'),
        sequenceImage: require('./config/frog/sequence-image.svg'),
        animal: require('./config/frog/animal.svg'),
        trophy: require('./config/frog/trophy.svg'),
        wrongSequence: require('./config/frog/wrong-sequence.svg'),
        finishSequence: require('./config/frog/finish-sequence.svg'),
      }
      break;
    case 'rabbit':
      return {
        ...require('./config/rabbit/config.json'),
        sequenceImage: require('./config/rabbit/sequence-image.svg'),
        animal: require('./config/rabbit/animal.svg'),
        trophy: require('./config/rabbit/trophy.svg'),
        wrongSequence: require('./config/rabbit/wrong-sequence.svg'),
        finishSequence: require('./config/rabbit/finish-sequence.svg'),
      }
      break;
    case 'squirrel':
      return {
        ...require('./config/squirrel/config.json'),
        sequenceImage: require('./config/squirrel/sequence-image.svg'),
        animal: require('./config/squirrel/animal.svg'),
        trophy: require('./config/squirrel/trophy.svg'),
        wrongSequence: require('./config/squirrel/wrong-sequence.svg'),
        finishSequence: require('./config/squirrel/finish-sequence.svg'),
      }
      break;
  }
  return {};
}
