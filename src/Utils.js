export const timeLog = (msg) => {
  let current = new Date();
  let currentTime = `${(current.getMonth()+1).toString().padStart(2,"0")}-${current.getDate().toString().padStart(2,"0")}@${current.getHours().toString().padStart(2,"0")}:${current.getMinutes().toString().padStart(2,"0")}:${current.getSeconds().toString().padStart(2,"0")}:${current.getMilliseconds().toString().padStart(3,"0")}`;
  console.log(`[${currentTime}]${msg}`);
};

export const timeLogSec = (msg) => {
  let current = new Date();
  let currentTime = `${(current.getMonth()+1).toString().padStart(2,"0")}-${current.getDate().toString().padStart(2,"0")}@${current.getHours().toString().padStart(2,"0")}:${current.getMinutes().toString().padStart(2,"0")}:${current.getSeconds().toString().padStart(2,"0")}`;
  console.log(`[${currentTime}]${msg}`);
};

export const collidesBallWithLine = (ball, line) => {
	// Calculate the line vector
	const lineVector = {
		x: line.pointEnd.x - line.pointStart.x,
		y: line.pointEnd.y - line.pointStart.y
	};
	
	// Calculate the length of the line segment
	const lineLength = getLineLength(line.pointStart, line.pointEnd);
	
	// Normalize the line vector
	const lineUnitVector = {
		x: lineVector.x / lineLength,
		y: lineVector.y / lineLength
	};

	// Calculate the vector from the start of the line to the ball's center
	const ballToLineStart = {
		x: ball.x - line.pointStart.x,
		y: ball.y - line.pointStart.y
	};

	// Project the ball's position onto the line
	const projectionLength = ballToLineStart.x * lineUnitVector.x + ballToLineStart.y * lineUnitVector.y;

	// Check if the projection is outside the line segment
	if (projectionLength < 0 || projectionLength > lineLength) {
		return false; // Ball is outside the line segment
	}

	// Calculate the closest point on the line segment to the ball
	const closestPoint = {
		x: line.pointStart.x + projectionLength * lineUnitVector.x,
		y: line.pointStart.y + projectionLength * lineUnitVector.y
	};

	// Calculate the distance from the ball to the closest point
	const distanceToClosestPoint = getLineLength(ball, closestPoint);//Math.sqrt(

	return distanceToClosestPoint < ball.radius; // Check if the ball is within the radius of the line
}


export const startDraw = (drawObj, x, y) => {
  drawObj.drawing = true;
  let pointStart = {x,y};
	drawObj.line = {pointStart, color:generateRandomHexColor()};
}

export const updateLine = (drawObj, x, y) => {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  //drawLine(ctx, pointStart, {x,y}, lineColor);
	drawObj.line.pointEnd = {x,y};
}

export const stopDraw = (drawObj, x, y) => {
	drawObj.drawing = false;
	drawObj.line.pointEnd = {x, y};

	let lineLength = getLineLength(drawObj.line.pointStart, drawObj.line.pointEnd);
	let vectorNormal = getVectorNormal(drawObj.line.pointStart, drawObj.line.pointEnd);
	let lineMiddlePoint = getLineMiddlePoint(drawObj.line.pointStart, drawObj.line.pointEnd);
  drawObj.lineNormal =  getLineWithVector(lineMiddlePoint, vectorNormal, lineLength);
	drawObj.lineNormal.color = generateRandomHexColor();

	//socket.emit('new-click', JSON.stringify({line}));
}

export const touchStart = (drawObj, e) => {
	timeLog(`touchStart: 1.1;`);
	//timeLog(`touchStart: 1.2; e:[${e.touches[0].clientX},${e.touches[0].clientY}]`);
  //const rect = event.target.getBoundingClientRect();
  const rect = e.target.getBoundingClientRect();
  //timeLog(`-rect: left:[${rect.left}]; top:[${rect.top}]`);
  let canvasX = rect.left;
  let canvasY = rect.top;
	startDraw(drawObj, e.touches[0].clientX - canvasX, e.touches[0].clientY - canvasY);
}

export const touchEnd = (drawObj, e) => {
	timeLog(`touchEnd: 3.1`);
	//timeLog(`touchEnd: 3.2; e:[${e.touches[0].clientX},${e.touches[0].clientY}]`);
	if (drawObj.drawing) stopDraw(drawObj, drawObj.line.pointEnd.x, drawObj.line.pointEnd.y);
}

export const touchMove = (drawObj, e) => {
	//timeLog(`touchMove: 0.3`);
	//timeLog(`touchMove: 2.1;`);
  const rect = e.target.getBoundingClientRect();
  //timeLog(`-rect: left:[${rect.left}]; top:[${rect.top}]`);
  let canvasX = rect.left;
  let canvasY = rect.top;
	let relX = e.touches[0].clientX - canvasX;
	let relY = e.touches[0].clientY - canvasY;
	//timeLog(`touchMove: 2.2; e:[${relX},${relY}]`);
	if (drawObj.drawing) updateLine(drawObj, relX, relY);
}


