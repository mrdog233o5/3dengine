// import DoggyGraphicsEngine from "/src/rendering.ts";

// load stuff

var textureCoords = [
    // Front
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
    // Back
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
    // Top
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
    // Bottom
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
    // Right
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
    // Left
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 0.0, 1.0, 1.0, 1.0,
];
var map = [];



const canvas1 = new DoggyGraphicsEngine(document.getElementById("canvas"));
canvas1.fov = 90;
canvas1.zRange[0] = 0.1;
var startT = new Date().getTime();

mapold = canvas1.readOBJ(`o Cube
        v 1.000000 1.000000 -1.000000
        v 1.000000 -1.000000 -1.000000
        v 1.000000 1.000000 1.000000
        v 1.000000 -1.000000 1.000000
        v -1.000000 1.000000 -1.000000
        v -1.000000 -1.000000 -1.000000
        v -1.000000 1.000000 1.000000
        v -1.000000 -1.000000 1.000000
        f 1 5 7 3
        f 4 3 7 8
        f 8 7 5 6
        f 6 2 4 8
        f 2 1 3 4
        f 6 5 1 2`)["Cube"].triangles;

for (let i = 0; i < mapold.length/9; i++) {
    for (let j = 0; j < 3; j++) {
        map = map
        .concat(mapold.slice(i*9+j*3, i*9+j*3+3))
        .concat(textureCoords.slice(i*6+j*2, i*6+j*2+2));
    }
}

canvas1.textureCoord = textureCoords;

function main() {
	// canvas 1
	canvas1.bgColor = [0, 0, 0, 1];
	var lineLength = 5;
	// loop through all triangles
	for (let i = 0; i < map.length; i += lineLength * 3) {
		// per triangle
		var vertices = [];
		for (let j = i; j < i + lineLength * 3; j += lineLength) {
			// per vertex
			var c = map.slice(j, j + lineLength);
			var rotated = canvas1.calcRotatedCoord3D(
				[canvas1.loops, canvas1.loops],
				c
			);
			c[0] = rotated[0];
			c[1] = rotated[1];
			c[2] = rotated[2];
			c[2] += 4;
			vertices.push(c);
		}
		canvas1.drawTriangle(vertices);
	}

	canvas1.render();

	requestAnimationFrame(main);
}
document.addEventListener("mousemove", (event) => {
	const x = event.clientX;
	const y = event.clientY;
	canvas1.camAngle = [
		-((y / canvas1.screenSize[1]) * 360) - 360 / 2,
		-((-x / canvas1.screenSize[0]) * 360) + 360 / 2,
	];
});

main();
