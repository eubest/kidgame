type Point = {
  x: number;
  y: number;
};

// Часть конфига, которую присылает RN сообщением type: 'config'.
export type CountInOrderInput = {
  type: string;
  sequence: Array<{ number: number; x: number; y: number }>;
  offset: { top: number; left: number; right: number; bottom: number };
  isIntro?: boolean;
};

// Поля из config/<type>/config.json и svg-ассеты — их дописывает getAssets()
// в configure(), уже после присваивания this.config, поэтому в CountInOrderInput
// их нет, а в полном конфиге есть.
export type CountInOrderAssets = {
  sequenceImageWidth: number;
  sequenceImageHeight: number;
  trophyWidth: number;
  trophyHeight: number;
  trophyOffset: Point;
  animalWidth: number;
  animalHeight: number;
  animalOffset: Point;
  digitOffset: Point;
  dashLineOffset: Point;
  wrongImageSequenceFrames: number;
  finishImageSequenceFrames: number;
  previewScale: number;
  angle: number;
  previewOffset: Point;
  // svg инлайнится babel-plugin-inline-import как строка
  sequenceImage: string;
  animal: string;
  trophy: string;
  wrongSequence: string;
  finishSequence: string;
};

// Ассеты частичные: getAssets() возвращает {} для неизвестного type, поэтому
// гарантировать их наличие нельзя — так было и до типизации.
export type CountInOrderConfig = CountInOrderInput & Partial<CountInOrderAssets>;
