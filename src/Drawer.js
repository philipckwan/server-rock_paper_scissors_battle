import {timeLog} from './Utils.js';
import {Point, Line, Vector, Geometry} from "./Geometry.js";
const hexDigits = "0123456789ABCDEF";

export class Drawer {
  static ctx;

  constructor(ctx = undefined) {
    if (ctx) {
      Drawer.ctx = ctx;
      timeLog(`Drawer(ctx):[${Drawer.ctx}];`);
    } else {
      timeLog(`Drawer(); no ctx;`)
    }
  }

  generateRandomHexColor = () => {
    let color = "#";
    for (var i = 0; i < 6; i++) {
      var randomIndex = Math.floor(Math.random() * hexDigits.length);
      color += hexDigits[randomIndex];
    }
    return color;
  }

  drawLine = (line, {color = this.generateRandomHexColor(), lineWidth = 1} = {}) => { //color = generateRandomHexColor(), lineWidth = 1) => {
    Drawer.ctx.beginPath();
    Drawer.ctx.lineWidth = lineWidth;
    Drawer.ctx.moveTo(line.start.x, line.start.y);
    Drawer.ctx.lineTo(line.end.x, line.end.y);
    Drawer.ctx.strokeStyle = color;
    Drawer.ctx.stroke();
  }

  drawLineWithVector = (pointStart, vector, {scale = 1, color = this.generateRandomHexColor()} = {}) => {
    let pointEnd = {x: pointStart.x + (vector.x * scale), y: pointStart.y + (vector.y * scale)}
    //let lineNormalLength = getLineLength(pointStart, pointEnd);
    let line = new Line(pointStart, pointEnd);
    this.drawLine(line, {color});
  }

  drawArrow = (pointStart, vector, {scale = 1, arrowLength = 10, lineWidth = 1, color = this.generateRandomHexColor()} = {}) => {
    let pointEnd = {x: pointStart.x + (vector.x * scale), y: pointStart.y + (vector.y * scale)};
    let angle = Math.atan2(vector.y, vector.x); // Angle of the main line
    Drawer.ctx.beginPath();
    Drawer.ctx.lineWidth = lineWidth;
    Drawer.ctx.strokeStyle = color;
    Drawer.ctx.moveTo(pointStart.x, pointStart.y);
    Drawer.ctx.lineTo(pointEnd.x, pointEnd.y);
    
    //timeLog(`drawArrow: arrowLength:[${arrowLength}]`);
    //ctx.beginPath();
    Drawer.ctx.moveTo(pointEnd.x, pointEnd.y);
    Drawer.ctx.lineTo(pointEnd.x - arrowLength * Math.cos(angle - Math.PI / 4), pointEnd.y - arrowLength * Math.sin(angle - Math.PI / 4));
    Drawer.ctx.moveTo(pointEnd.x, pointEnd.y);
    Drawer.ctx.lineTo(pointEnd.x - arrowLength * Math.cos(angle + Math.PI / 4), pointEnd.y - arrowLength * Math.sin(angle + Math.PI / 4));
    //ctx.stroke();

    Drawer.ctx.stroke();
    //drawLine(ctx, pointStart, pointEnd, generateRandomHexColor());
  }

  drawSquare = (pointTopLeft, sideLength, {color = this.generateRandomHexColor(), lineWidth = 1} = {}) => {
    Drawer.ctx.beginPath();
    Drawer.ctx.lineWidth = lineWidth;
    Drawer.ctx.strokeStyle = color;
    Drawer.ctx.rect(pointTopLeft.x, pointTopLeft.y, sideLength, sideLength);
    Drawer.ctx.stroke();
    Drawer.ctx.closePath();
  }

  drawBall = (pointCenter, radius, {color = this.generateRandomHexColor()} = {}) => {
    Drawer.ctx.fillStyle = color;
    Drawer.ctx.beginPath();
    Drawer.ctx.arc(pointCenter.x, pointCenter.y, radius, 0, Math.PI * 2);
    Drawer.ctx.fill();
    Drawer.ctx.closePath();
  }

  drawImage = (image, point, offsetX = 0, offsetY = 0) => {
    Drawer.ctx.drawImage(image, point.x + offsetX, point.y + offsetY);
  }
}