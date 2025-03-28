import {timeLog} from './Utils.js';

export class Point {
  x;
  y;
  
  constructor(x, y) {
    //timeLog(`Point(${x},${y});`);
    this.x = x;
    this.y = y;
  }

  toString = () => {
    return `[${this.x},${this.y}]`;
  }
}

export class Line {
  start;
  end;

  constructor(start, end) {
    //timeLog(`Line(): ${start.toString()}->${end.toString()};`);
    this.start = start;
    this.end = end;
  }
}

export class Vector extends Point {
  constructor(x = 0, y = 0) {
    //timeLog(`Vector();`);
    super(x, y);
  }

  add = (vector) => {
    this.x += vector.x;
    this.y += vector.y;
    return this;
  }
}

export class Geometry {
  static getLineLength = (pointStart, pointEnd = {x:0, y:0}) => {
		let lengthX = pointEnd.x - pointStart.x;
		let lengthY = pointEnd.y - pointStart.y;
		return Math.sqrt(lengthX * lengthX + lengthY * lengthY);
	}

	static getLineWithVector = (pointStart, vector, {scale}) => {
		let pointEnd = {x: pointStart.x + (vector.x * scale), y: pointStart.y + (vector.y * scale)}
		//let lineNormalLength = getLineLength(pointStart, pointEnd);
    let line = new Line(pointStart, pointEnd);
		return line;
	}

	static getVectorNormalUnit = (pointStart, pointEnd) => {
		const dx = pointEnd.x - pointStart.x;
		const dy = pointEnd.y - pointStart.y;
		const length = Math.sqrt(dx * dx + dy * dy);
    let vector = new Vector(dy / length, -dx / length);
		return vector;
	}

	static getVectorDirectionUnit = (pointStart, pointEnd) => {
    const dx = pointEnd.x - pointStart.x;
    const dy = pointEnd.y - pointStart.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    let vector = new Vector(dx / length, dy / length);
    return vector; 
  }

	static scaleVector = (vector, scale) => {
    let newVector = new Vector(vector.x * scale, vector.y * scale);
		return newVector;
	}

	static getLineMiddlePoint = (pointStart, pointEnd) => {
    let point = new Point((pointStart.x + pointEnd.x) / 2, (pointStart.y + pointEnd.y) / 2);
		return point;
	}

  static invertVector = (vector) => {
    let newVector = new Vector(-vector.x, -vector.y);
    return newVector;
  }
}