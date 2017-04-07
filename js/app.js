var canvasWidth = 500;
var canvasHeight = 500;

var columns;
var rows;
var cellWidth = 50;
var cells = [];
var current;
var stack = [];
var grid;

var playerX = cellWidth/2;
var playerY= cellWidth/2;

var finished = false;

function setup() {
	var myCanvas = createCanvas(canvasWidth+1, canvasHeight+1); 
	$('canvas').attr('id', 'canvasStyling');
	columns = canvasWidth/cellWidth;
	rows = canvasHeight/cellWidth;
	frameRate(20);
	grid = new Grid();
	grid.createCells();
	//starting point at first cell
	current = cells[0];
};

//constructor function for player
var Player = function(x, y, width, height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
};

Player.prototype.display = function (){
	stroke(0);
	fill(255, 255, 0);
	ellipse(this.x, this.y, this.width, this.height);
};

//constructor function for a cell
var Cell = function(i, j, width){
	this.i = i;
	this.j = j;
	this.x = i*cellWidth;
	this.y = j*cellWidth;
	this.width = cellWidth;
	//will need to draw the wall if it exists
	this.cellWall = [true, true, true, true];//top, right, bottom, left
	this.visited = false;
	this.playerHere = false;
	this.endCell = false;
};

//check if Neighbors have been visited & return random neighbor
Cell.prototype.checkNeighbors = function(){
	//consider edge cases where no neighbor
	var index = function(x, y){ 
		if(x<0 || y<0 || x > (columns -1) || y > (rows -1)){
			return -1;
		} else {
			return x + (y * columns);
		};
	};
	var neighbors = [];
	//var index = (y * columns) * x //index value for all cells
	var topNeighbor = cells[index(this.i, this.j-1)];
	//console.log(topNeighbor);
	var rightNeighbor = cells[index(this.i+1, this.j)];
	//console.log(rightNeighbor);
	var bottomNeighbor = cells[index(this.i, this.j+1)];
	//console.log(bottomNeighbor);
	var leftNeighbor = cells[index(this.i-1, this.j)];
	//console.log(leftNeighbor);

	//if neighhbor has not been visited and it's not an edge case, add it to neighbors array
	if (topNeighbor  && !topNeighbor.visited){ 
		neighbors.push(topNeighbor);
	};
	if (rightNeighbor && !rightNeighbor.visited){
		neighbors.push(rightNeighbor);
	};
	if (bottomNeighbor && !bottomNeighbor.visited){
		neighbors.push(bottomNeighbor);
	};
	if (leftNeighbor && !leftNeighbor.visited){
		neighbors.push(leftNeighbor);
	};

	//pick neighbor from neighbors array
	if(neighbors.length>0){
		var randomNeighbor = floor(random(0, neighbors.length));
		return neighbors[randomNeighbor];
	} else {
		return undefined;
	};
};

Cell.prototype.display = function(){
	//noFill();
	stroke(0);//cell outlines
	//if cell wall exists, display on screen
	if(this.cellWall[0]){
		line(this.x, this.y, this.x+this.width, this.y); //top side	
	};
	if(this.cellWall[1]){
		line(this.x+this.width, this.y, this.x+this.width, this.y+this.width); //right side
	};
	if(this.cellWall[2]){
		line(this.x+this.width, this.y+this.width, this.x, this.y+this.width); //bottom side
	};
	if(this.cellWall[3]){
		line(this.x, this.y+this.width, this.x, this.y); //left side
	};
	
	if(this.visited){
		noStroke();
		if(finished){
			fill(0, 250, 0, 50);
		}else {
			fill(0, 0, 255, 50);
			//change color of visited cells
		};
		rect(this.x, this.y, this.width, this.width);
	};
};

var Grid = function(){};

Grid.prototype.createCells = function(){
	//need to make a cell at each position on the grid
	for(var y=0; y<10; y++){ //10 rows
		for(var x= 0; x<10; x++){ //10 columns
			var cell = new Cell(x, y, cellWidth);
			if(x == 9 && y == 9){
				cell.endCell = true;
			}
			cells.push(cell);
		};
	};	
};

Grid.prototype.createMazeCell = function(){
	//mark the current cell as visited
	current.visited = true; 
	
	//take random unvisited neighbor and assign to next
	var next = current.checkNeighbors(); 
	
	if (next){
		next.visited = true; //make the random neighbor(next cell) visited
		//add the current cell to the stack
		stack.push(current);
		//Remove the wall between the current cell and the chosen cell
		this.removeWalls(current, next);
		//make the random neighbor the new current cell aka make next cell current
		current = next; 
	} else if(stack.length>0){ //if no neighbors, and something in stack
		var poppedCell = stack.pop(); //pop cell and make it current
		current = poppedCell;
	};
};

//function takes firstCell & secondCell and removes sharing wall
Grid.prototype.removeWalls = function (firstCell, secondCell){
	var xDifference = (firstCell.x - secondCell.x)/50; //x value of 1st cell - xVal of 2nd
	//console.log(xDifference);
	if(xDifference === 1){
		firstCell.cellWall[3] = false; //remove cell a's left wall [3]
		secondCell.cellWall[1] = false;
		//console.log(a);
	} else if(xDifference === -1){
		firstCell.cellWall[1] = false;
		secondCell.cellWall[3] = false;
	};

	var yDifference = (firstCell.y - secondCell.y)/50;
	//console.log(yDifference);
	if(yDifference === 1){
		firstCell.cellWall[0] = false;
		secondCell.cellWall[2] = false;
		//console.log(firstCell);
	} else if(yDifference === -1){
		firstCell.cellWall[2] = false;
		secondCell.cellWall[0] = false;
	};
};

Grid.prototype.display = function(){
	for(var i = 0; i < cells.length; i++){
		cells[i].display();
	};
};

var player1 = new Player(playerX, playerY, 20, 20);

function draw(){
	//draw cells
	background(224, 211, 255);
	grid.display();
	grid.createMazeCell();
	player1.display();
};

function keyPressed(){
	//check which cell you're in by checking x and y position of player
	var playerCell; //cell that player is currently in

	for(var i = 0; i<cells.length; i++){
		if (cells[i].x == (player1.x - 25) && cells[i].y == (player1.y - 25)){
			playerCell = cells[i];
		};
	};

	if (keyCode === UP_ARROW && playerCell.cellWall[0] == false){
		player1.y -= cellWidth;
		//console.log ("x is " + player1.x + " y is " + player1.y);
	};
	if (keyCode === DOWN_ARROW && playerCell.cellWall[2] == false){
		player1.y += cellWidth;
		// console.log ("x is " + player1.x + " y is " + player1.y);
	};
	if (keyCode === LEFT_ARROW && playerCell.cellWall[3] == false){
		player1.x -= cellWidth;
		// console.log ("x is " + player1.x + " y is " + player1.y);
	};
	if (keyCode === RIGHT_ARROW && playerCell.cellWall[1] == false){
		player1.x += cellWidth;
		// console.log ("x is " + player1.x + " y is " + player1.y);
	};
	for(var i = 0; i<cells.length; i++){
		if (cells[i].x == (player1.x - 25) && cells[i].y == (player1.y - 25)){
			playerCell = cells[i];
			if(playerCell.endCell){
				finished = true;
				console.log("You made it!")
			};
		};
	};
};