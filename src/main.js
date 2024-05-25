const canvas = document.getElementById("canva");
const ctx = canvas.getContext("2d");
const length = 100;
var data = {
	cam: {
		pos: [0, 5, 0],
		fov: 60,
		angle: [0, -90],
	},
	map: [
		{
			pos: [
				[0, -1, 1],
				[1, -1, -1],
				[-1, -1, -1],
			],
			color: "green",
		},
		{
			pos: [
				[0, 1, 0],
				[1, -1, -1],
				[-1, -1, -1],
			],
			color: "yellow",
		},
		{
			pos: [
				[0, -1, 1],
				[0, 1, 0],
				[-1, -1, -1],
			],
			color: "blue",
		},
		{
			pos: [
				[0, -1, 1],
				[1, -1, -1],
				[0, 1, 0],
			],
			color: "red",
		},
	],
};

function frame() {
	// create grid

	var grid = [];
	var line = [];
	var px = [0, 0, 0]; // rgb
	for (let i = 0; i < canvas.width; i++) {
		line.push(px);
	}
	for (let i = 0; i < canvas.height; i++) {
		grid.push(line);
	}

	flattenTriangle(data.map[0]);

	// draw on screen color
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid[0].length; j++) {
			var px = grid[i][j];
			paintPixel([j, i], `rgb(${px.join(",")})`);
		}
	}
	window.requestAnimationFrame(frame);
}

function angleToCoords(angle) {
	var fov = Number(data.cam.fov);
	var pxPerDeg = canvas.width / fov;
	return [
		(angle[0] + fov / 2) * pxPerDeg,
		(angle[1] + fov / (canvas.width / canvas.height) / 2) *
			pxPerDeg,
	];
}

function flattenTriangle(triangle) {
	paintPixel(angleToCoords([20, 10]), "yellow");
}

function paintPixel(pos, color) {
	ctx.fillStyle = color;
	ctx.fillRect(pos[0], pos[1], 1, 1);
}

// resize canva
function resizeCanvas() {
	// canvas.width = window.innerWidth;
	// canvas.height = window.innerHeight;
	canvas.width = 600;
	canvas.height = 400;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

frame();
