//global variables
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var width = 600;
var height = 600;
var totalEnemies = 8;
var enemyRadius = 30;
var boundry = 600 + enemyRadius;
var enemyColors = ["aqua", "red", "orange", "pink"];
var score = 0;
var tick = 0;
var curvedirection = 5;
var curvingNum = 20;
var mX = 0;
var mY = 0;
var ylines = '#' + Math.random().toString(16).substring(2, 8);
var xlines = ylines;
var started = false;
var gameOver = false;
canvas.width = width;
canvas.height = height;

//no cursor in the way :)
canvas.style.cursor = 'none';

//movement control
var pressed = {};
document.addEventListener('keydown', function (e) {
	pressed[e.keyCode] = true;
	//for resetting
	if (32 in pressed && gameOver) {
		//reset settings
		gameOver = false;
		enemies = [];
		score = 0;
		window.onload();
		requestAnimationFrame(render);
	}
});

document.addEventListener('keyup', function (e) {
	delete pressed[e.keyCode];
});

canvas.addEventListener("mousemove", function (e) {
	mX = e.pageX;
	mY = e.pageY;

	if(!started){
		started = true;
		render();
	}

	if (Math.floor(mY) % 100 > 90 || Math.floor(mY) % 100 < 10) {
		ylines = '#' + Math.random().toString(16).substring(2, 8);
	}
	if (Math.floor(mX) % 100 > 90 || Math.floor(mX) % 100 < 10) {
		xlines = '#' + Math.random().toString(16).substring(2, 8);
		curvingNum += curvedirection;
		curvedirection *= (((curvingNum % height) == 0) ? -1 : 1);
	}
});

//global objects
var player = {
	x: width/2,
	y: height/2,
	width: 50,
	height:50,
	color: "yellow"
};

//enemy objects etc
function enemy (x, y, color) {
	this.x = x;
	this.y = y;
	this.radius = enemyRadius;
	this.color = color;
	this.thrust = 10;
	this.angle = Math.random()*Math.PI*2;
	this.velX = Math.cos(this.angle)*this.thrust;
	this.velY = Math.sin(this.angle)*this.thrust;
}
var enemies = [];

//enemies are created once the page is loaded
window.onload = function() {
	//background
	context.fillStyle = "black";
	context.fillRect(0,0, width, height);
	//load starting enemies
	for (var i = 0; i < totalEnemies; i++) {
		var coordValues = getCoords();
		enemies.push(new enemy (coordValues.x, coordValues.y, enemyColors[i%4]));
	}
	//instructions
	context.fillStyle = "white";
	context.font = 36 + "pt Arial ";
	context.fillText("Move mouse to start.", 75, height/2);
};

//canvas drawing
var render = function() {
	//background
	context.fillStyle = "black";
	context.fillRect(0,0, width, height);

	//a nice grid
	context.fillStyle = "black";
	for(i = 0; i < width; i += 100){
		context.beginPath();
		context.moveTo(i,-20);
		context.bezierCurveTo(i + 100, curvingNum, i + 100, curvingNum, i, height+20);
		context.moveTo(i,0);
		context.strokeStyle = xlines;
		context.closePath();
		context.stroke();
		context.beginPath();
		context.moveTo(-20, i);
		context.bezierCurveTo(curvingNum, i + 100, curvingNum, i + 100, width + 20, i);
		context.moveTo(-20, i);
		context.strokeStyle = ylines;
		context.closePath();
		context.lineWidth = 5;
		context.stroke();
	}

	//draw player
	context.fillStyle = player.color;
	context.fillRect(player.x - player.width/2, player.y - player.height/2, player.width, player.height);

	//draw enemy
	for (var i = 0; i < enemies.length; i++) {
		context.beginPath();
		context.fillStyle = enemies[i].color;
		context.arc(enemies[i].x, enemies[i].y, enemies[i].radius, 0, Math.PI*2, false);
		context.closePath();
		context.fill();
	}

	//draw scoreboard
	context.fillStyle = "white";
	context.font = 18 + "pt Arial ";
	context.fillText("Score: " + score, 2, 20);

	update();

	if (gameOver) {
		//game over/score/replay opt
		context.fillStyle = "black";
		context.fillRect(0,0, width, height);
		context.fillStyle = "white";
		context.font = 36 + "pt Arial ";
		context.fillText("GAME OVER", 150, height/2);
		context.font = 24 + "pt Arial";
		context.fillText("Final score: " + score, 190, width/2 + 36);
		context.fillText("Hit space to play again", 140, width/2 + 75);
	}
	else {
		requestAnimationFrame(render);
	}
};

var update = function() {
	//player updates
	player.x = mX;
	player.y = mY;
	if (player.x > width - player.width/2) {
		player.x = width - player.width/2;
	}
	if (player.x < 0 + player.width/2) {
		player.x = player.width/2;
	}
	if (player.y > height - player.height/2) {
		player.y = height - player.height/2;
	}
	if (player.y < player.height/2) {
		player.y = player.height/2;
	}

	//enemy updates
	for (var i = 0; i < enemies.length; i++) {
		enemies[i].x += enemies[i].velX;
		enemies[i].y += enemies[i].velY;

		//out of bounds?
		if (enemies[i].x > boundry || enemies[i].x + enemyRadius < 0 || enemies[i].y > boundry || enemies[i].y + enemyRadius < 0) {
			var newCoords = getCoords();
			enemies[i].x = newCoords.x;
			enemies[i].y = newCoords.y;
			enemies[i].radians = Math.atan2((player.y - enemies[i].y),(player.x - enemies[i].x));
			enemies[i].velX = Math.cos(enemies[i].radians) * enemies[i].thrust;
			enemies[i].velY = Math.sin(enemies[i].radians) * enemies[i].thrust;			
		}
		//collision check
		if (checkPlayerCollision(player, enemies[i])) {
			gameOver = true;
		}
	}

	//score updates
	tick++;
	if(tick % 50 == 0){
		score++;
	}
};

//pick "random" side of the playing field to put enemy
function getCoords () {
	var returnedCoord = {};
	var randNum = Math.random();
	if (randNum < 0.25) {
		returnedCoord.x = enemyRadius*-1;
		returnedCoord.y = Math.random() * height;
	} 
	else if (randNum < 0.5) {
		returnedCoord.x = Math.random() * width;
		returnedCoord.y = enemyRadius*-1;
	}
	else if (randNum < 0.75) {
		returnedCoord.x = width + enemyRadius*1.5;
		returnedCoord.y = Math.random() * height;
	}
	else{
		returnedCoord.x = Math.random() * width;
		returnedCoord.y = height + enemyRadius*1.5;
	}
	return returnedCoord;
}

function checkPlayerCollision (player, enemy) {
	var x = (enemy.x - enemyRadius/2) - (player.x - player.width/2);
	var y = (enemy.y - enemyRadius/2) - (player.y - player.height/2);
	var dist = Math.sqrt(x*x + y*y);
	var collision = false;
	if (dist < player.height/2 + enemyRadius) {
		collision = true;
	}
	return collision;
}