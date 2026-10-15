import SequenceObject from "./SequenceObject";
import AnimalBase from "./AnimalBase";

class Animal extends AnimalBase {
  nextSequenceObject?: SequenceObject;
  currentSequenceObject: SequenceObject;

  constructor(sequenceObject: SequenceObject, image: HTMLCanvasElement, wrongSequence: HTMLCanvasElement, characterFinishSequence: HTMLCanvasElement, scale: number, offset: {x: number, y: number}) {
    super(image, wrongSequence, characterFinishSequence, scale, offset)
    this.x = sequenceObject.x + this.offset.x;
    this.y = sequenceObject.y - image.height + this.offset.y;
    this.currentSequenceObject = sequenceObject;
  }
}

export default Animal;
