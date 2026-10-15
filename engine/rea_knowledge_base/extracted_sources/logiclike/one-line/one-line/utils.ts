import Point from "./Point";

export const getScale = (gameWidth: number, gameHeight: number) => {
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

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  const xDist = x2 - x1
  const yDist = y2 - y1

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

export const findNearestPoint = (points: Array<Point>, target: {x: number, y: number}) => {
  const distances = points.map(point => distance(point.x, point.y, target.x, target.y));
  let min = distances[0];
  let minIndex = 0;
  for (let i = 1; i < distances.length; i++) {
    if (distances[i] < min) {
      min = distances[i];
      minIndex = i;
    }
  }
  return points[minIndex];
}
