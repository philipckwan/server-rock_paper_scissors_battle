import {timeLog} from './Utils.js';
import {Point, Line, Vector, Geometry} from "./Geometry.js";
import {Constants} from "./Constants.js";

const SVG_SIZE = 20;

//const MAX_VELOCITY = 3;
const MAX_VELOCITY_CHASING = 3;
const MAX_VELOCITY_WANDERING = 2;
//const MAX_WANDERING_COUNTER = 30;
const MAX_ACCERATE = 2;

const DISTANCE_AWAY_FROM_CENTER = 150;
const DISTANCE_AWAY_FROM_CENTER_VARIANCE = 80;
const DISTANCE_FROM_PEER = 20;
const DISTANCE_TO_CHASE = 120;
const DISTANCE_TO_EVADE = 90;

/**
 * This RPSContext should be able to run on both client side (as javascript), or server side (as nodejs).
 * Thus, classes like "Image" should not be instantiated here
 */
export class RPSContext {
  pieces = [];
  canvasWidth;
  canvasHeight;
  centerPoint;
  numPieces;

  // static {
  //   timeLog(`RPSContext.static;`);
  // }

  constructor(numPieces, canvasWidth, canvasHeight) {
    timeLog(`RPSContext();`);
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.numPieces = numPieces;
    //this.canvas = canvas;  
    let widthMid = this.canvasWidth / 2;
    let heightMid = this.canvasHeight / 2;
    this.centerPoint = new Point(widthMid, heightMid);
    this.init();
  }

  init = () => {
    this.pieces = [];
    for (let i = 0; i < this.numPieces; i++) {
      let type = this.randomType();
      let aPiece = new RPSPiece(new Point(Math.floor(Math.random() * this.canvasWidth), Math.floor(Math.random() * this.canvasHeight)), type);
      this.pieces.push(aPiece);
    }
  }

  // drawOne = (idxPiece) => {
  //   let aPiece = this.pieces[idxPiece];
  //   drw.drawImage(RPSContext.svgMap.get(aPiece.type), aPiece.pos, -15, -15); 
  // }

  // drawAll = () => {
  //   for (let i = 0; i < this.pieces.length; i++) {
  //     this.drawOne(i);
  //   }
  // }

  randomType = () => {
    switch(Math.floor(Math.random() * 3)) {
      case 0:
        return Constants.TYPE.ROCK;
      case 1:
        return Constants.TYPE.PAPER;
      default:
        return Constants.TYPE.SCISSORS;
    }
  }

  getChaserType = (aPiece) => {
    if (aPiece.type === Constants.TYPE.ROCK) return Constants.TYPE.PAPER;
    else if (aPiece.type === Constants.TYPE.PAPER) return Constants.TYPE.SCISSORS;
    else return Constants.TYPE.ROCK;
  }

  isChasible = (aPiece, bPiece) => {
    /**
     * Chase definition
     * chaser - the one who chases
     * chasee - the one who being chased
     * e.g. if rock is chaser, then scissors is chasee
     */
    let isChasibleType = false;
    if (aPiece.type === Constants.TYPE.ROCK)
      isChasibleType = bPiece.type === Constants.TYPE.SCISSORS;
    else if (aPiece.type === Constants.TYPE.PAPER)
      isChasibleType = bPiece.type === Constants.TYPE.ROCK;
    else
      isChasibleType = bPiece.type === Constants.TYPE.PAPER;
    if (isChasibleType) {
      // now check if the chasee is within distance
      if (this.distanceBetween(aPiece, bPiece) < DISTANCE_TO_CHASE) {
        return true;
      }
    }
    return false;
  }

  isEvadable = (aPiece, bPiece) => {
    /** 
     * Evade definition
     * evader - the one who evades
     * evadee - the one who is being evaded (from)
     * e.g. if rock is evader, then paper is evadee
     */
    let isEvadableType = false;
    if (aPiece.type === Constants.TYPE.ROCK)
      isEvadableType = bPiece.type === Constants.TYPE.PAPER;
    else if (aPiece.type === Constants.TYPE.PAPER)
      isEvadableType = bPiece.type === Constants.TYPE.SCISSORS;
    else 
      isEvadableType = bPiece.type === Constants.TYPE.ROCK;
    if (isEvadableType) {
      if (this.distanceBetween(aPiece, bPiece) < DISTANCE_TO_EVADE) {
        return true;
      }
    }
    return false;
  }

  isPeer = (aPiece, bPiece) => {
    return aPiece.type === bPiece.type;
  }

  distanceBetween = (aPiece, bPiece) => {
    return Geometry.getLineLength(aPiece.pos, bPiece.pos);
  }

  isCaptured = (fromPiece, toPiece) => {
    return this.distanceBetween(fromPiece, toPiece) <= SVG_SIZE;
  }

  updateOne = (aPiece) => {
    //let aPiece = this.pieces[idxPiece];
    
    // update obj position with velocity
    aPiece.move();

    // update acceleration
    // first find closest chasee and evadee
    let closestChasee = null;
    let closestEvadee = null;
    let closestPeer = null;
    let netVector = new Vector();
    for (let i = 0; i < this.pieces.length; i++) {
      if (this.pieces[i] === aPiece) continue;

      let bPiece = this.pieces[i];
      if (this.isChasible(aPiece, bPiece)) {
        // need to find the closest one
        if (closestChasee === null || this.distanceBetween(aPiece, bPiece) < this.distanceBetween(aPiece, closestChasee)) {
          closestChasee = bPiece;
        } 
      } else if (this.isEvadable(aPiece, bPiece)) {
        if (closestEvadee === null || this.distanceBetween(aPiece, bPiece) < this.distanceBetween(aPiece, closestEvadee)) {
          closestEvadee = bPiece;
        } 
      } else if (this.isPeer(aPiece, bPiece)) {
        if (closestPeer === null || this.distanceBetween(aPiece, bPiece) < this.distanceBetween(aPiece, closestPeer)) {
          closestPeer = bPiece;
        } 
      }
    }
    // if (closestChasee === null && aPiece.status != Constants.STATUS.WANDERING) {
    //   aPiece.status = Constants.STATUS.WANDERING;
    // }
    if (closestChasee || closestEvadee) {
      let vectorChase, vectorEvade;
      if (closestChasee) {
        if (this.isCaptured(aPiece, closestChasee)) {
          closestChasee.type = aPiece.type;
          closestChasee = null;
        } else {
          vectorChase = Geometry.getVectorDirectionUnit(aPiece.pos, closestChasee.pos);
        }
      }
      if (closestEvadee) {
        vectorEvade = Geometry.getVectorDirectionUnit(closestEvadee.pos, aPiece.pos);
      }
      if (closestChasee && closestEvadee) {
        if (this.distanceBetween(aPiece, closestChasee) < this.distanceBetween(aPiece, closestEvadee)) {
          netVector.add(vectorChase);
        } else {
          netVector.add(vectorEvade);
        }
      } else if (closestChasee && vectorChase) {
        netVector.add(vectorChase);
      } else if (closestEvadee && vectorEvade) {
        netVector.add(vectorEvade);
      }
    } else { //if (aPiece.status === Constants.STATUS.WANDERING) {
      // 1. move away from the 2 closest wall

      // 2. change the acceleration randomly, but every once in a while
      // aPiece.wanderCounter--;
      // if (aPiece.wanderCounter <= 0) {
      //   aPiece.wanderCounter = Math.floor(Math.random() * MAX_WANDERING_COUNTER);
      //   aPiece.acc = new Vector(Math.random() * MAX_VELOCITY - (MAX_VELOCITY/2), Math.random() * MAX_VELOCITY - (MAX_VELOCITY/2));
      // }

      // 3. with respect to the center of the canvas, move in a clockwise circle
      // 3.1 an acc towards the center
      let vectorCentripetal = Geometry.getVectorDirectionUnit(aPiece.pos, this.centerPoint);
      if (Geometry.getLineLength(aPiece.pos, this.centerPoint) <= aPiece.distanceAwayFromCenter) {
        // if too close to center, reverse the centripetal vector
        vectorCentripetal = Geometry.invertVector(vectorCentripetal);
      }
      netVector.add(vectorCentripetal);

      // 3.2 an acc clockwise, i.e. normal to the center
      netVector.add(Geometry.getVectorNormalUnit(aPiece.pos, this.centerPoint));
    }
    //aPiece.acc = vectorClockwise.add(vectorCentripetal);

    // 4. if the closest peer is too close, then move away
    if (closestPeer && Geometry.getLineLength(aPiece.pos, closestPeer.pos) <= DISTANCE_FROM_PEER) {
      let vectorAwayFromPeer = Geometry.getVectorDirectionUnit(closestPeer.pos, aPiece.pos);
      //netVector.add(vectorAwayFromPeer);
      netVector = vectorAwayFromPeer;
    }
    
    if (aPiece.pos.x > this.canvasWidth) {
      //timeLog(`-Piece:[${idxPiece}] collide x; pos:[${aPiece.pos.toString()}];`);
      netVector.x = -MAX_ACCERATE;
    } else if (aPiece.pos.x < 0) {
      //timeLog(`-Piece:[${idxPiece}] collide x; pos:[${aPiece.pos.toString()}];`);
      netVector.x = MAX_ACCERATE;
    }
    if (aPiece.pos.y > this.canvasHeight) {
      //timeLog(`-Piece:[${idxPiece}] collide y; pos:[${aPiece.pos.toString()}];`);
      netVector.y = -MAX_ACCERATE;
    } else if (aPiece.pos.y < 0) {
      //timeLog(`-Piece:[${idxPiece}] collide y; pos:[${aPiece.pos.toString()}];`);
      netVector.y = MAX_ACCERATE;
    }
    aPiece.acc = netVector;

    // sparse away from peers

    // update velocity with acceleration
    aPiece.accelerate();
  }

  updateAll = () => {
    this.pieces.map((aPiece) => this.updateOne(aPiece));
  }

  // drawAllThenUpdateAll = () => {
  //   timeLog(`drawAllThenUpdateAll;`);
  //   this.drawAll();
  //   this.updateAll();
  // }

  addPiece = (pointStarting) => {
    let aPiece = new RPSPiece(pointStarting, this.randomType());
    this.pieces.push(aPiece);
  }

  replacePiece = (pointStarting, type = this.randomType(), idxPieceToReplace = Math.floor(Math.random() * this.pieces.length)) => {
    let aPiece = new RPSPiece(pointStarting, type);
    this.pieces[idxPieceToReplace] = aPiece;
  }

  isAllSingleType = () => {
    timeLog(`-isAllSingleType;`);
    let typeSet = new Set();
    for (let aPiece of this.pieces) {
      typeSet.add(aPiece.type);
    }
    return (typeSet.size === 1)
  }

  replaceFirstPieceWithChaser = () => {
    timeLog(`-replaceFirstPieceWithChaser;`);
    let firstPiece = this.pieces[0];
    this.replacePiece(new Point(Math.floor(Math.random() * this.canvasWidth), Math.floor(Math.random() * this.canvasHeight)), this.getChaserType(firstPiece), 0);
  }

  countFirstPieceType = () => {
    let firstPieceType = this.pieces[0].type;
    let count = 0;
    for (let aPiece of this.pieces) {
      if (aPiece.type === firstPieceType)
        count++;
    }
    return count;
  }

}

/**
 * Example:
 * Piece = {
 *  pos:Point,
 *  vel:Vector,
 *  acc:Vector,
 *  type:[ROCK, PAPER, SCISSORS],
 *  status:[ CHASING, EVADING, WANDERING ]
 * }
 */
export class RPSPiece {

  pos;
  vel;
  acc;
  type;

  //status = Constants.STATUS.WANDERING;
  distanceAwayFromCenter;
  wanderCounter = 0;
  /**
   * color:
   * red - #fc0703
   * green - #03fc07
   * blue - #0349fc
   * orange - #fc9003
   */

  constructor(pos, type) {
    this.pos = pos;
    this.type = type;
    this.vel = new Vector(0,0);
    this.acc = new Vector(0,0);
    this.distanceAwayFromCenter = Math.floor(Math.random() * DISTANCE_AWAY_FROM_CENTER_VARIANCE) - (DISTANCE_AWAY_FROM_CENTER_VARIANCE / 2) + DISTANCE_AWAY_FROM_CENTER;
  }

  move = () => {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;
  }

  accelerate = () => {
    this.vel.x += this.acc.x;
    let maxVelocity = MAX_VELOCITY_WANDERING;
    // if (this.status === Constants.STATUS.CHASING) {
    //   maxVelocity = MAX_VELOCITY_CHASING;
    // } else {
    //   maxVelocity = MAX_VELOCITY_WANDERING;
    // }
    if (this.vel.x > maxVelocity)
      this.vel.x = maxVelocity;
    else if (-this.vel.x > maxVelocity)
      this.vel.x = -maxVelocity;
    
    this.vel.y += this.acc.y;
    if (this.vel.y > maxVelocity)
      this.vel.y = maxVelocity;
    else if (-this.vel.y > maxVelocity)
      this.vel.y = -maxVelocity;
  }
}
