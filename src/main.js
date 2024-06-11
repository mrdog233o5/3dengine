// import DoggyGraphicsEngine from "/src/rendering.ts";

// load stuff
var map = [
    1, 1, 1, 1, 0, 1,
    1, 1, 3, 1, 0, 1,
    1, -1, 3, 1, 0, 1,

    1, 1, 1, 1, 0, 1,
    1, -1, 1, 1, 0, 1,
    1, -1, 3, 1, 0, 1,

    -1, 1, 1, 1, 0, 1,
    -1, 1, 3, 1, 0, 1,
    -1, -1, 3, 1, 0, 1,

    -1, 1, 1, 1, 0, 1,
    -1, -1, 1, 1, 0, 1,
    -1, -1, 3, 1, 0, 1,
    
    1, 1, 1, 0, 1, 1,
    1, 1, 3, 0, 1, 1,
    -1, 1, 3, 0, 1, 1,

    1, 1, 1, 0, 1, 1,
    -1, 1, 1, 0, 1, 1,
    -1, 1, 3, 0, 1, 1,

    1, -1, 1, 0, 1, 1,
    1, -1, 3, 0, 1, 1,
    -1, -1, 3, 0, 1, 1,

    1, -1, 1, 0, 1, 1,
    -1, -1, 1, 0, 1, 1,
    -1, -1, 3, 0, 1, 1,

    1, 1, 3, 1, 1, 0,
    1, -1, 3, 1, 1, 0,
    -1, -1, 3, 1, 1, 0,

    1, 1, 3, 1, 1, 0,
    -1, 1, 3, 1, 1, 0,
    -1, -1, 3, 1, 1, 0,
];

const canvas1 = new DoggyGraphicsEngine(document.getElementById("canvas"));

canvas1.frame = () => {
    var lineLength = 6;
	
    // loop through all triangles
    for (let i = 0; i < map.length; i += lineLength*3) {
        // per triangle
        var vertices = [];
        for (let j = i; j < i+lineLength*3; j += lineLength) {
            // per vertex
            var c = map.slice(j, j+lineLength);
            var rotated = canvas1.calcRotatedCoord2D(canvas1.loops*2, [0, 0.5]);
            c[0] += rotated[0];
            c[1] += rotated[1];
            vertices.push(canvas1.projecting3D(canvas1.fov, [canvas.width, canvas.height], canvas1.renderingRange, c).concat(map.slice(j+3, j+lineLength)));
        }
        canvas1.triangleVertices = canvas1.triangleVertices
            .concat(vertices[0])
            .concat(vertices[1])
            .concat(vertices[2]);
    }
}
canvas1.renderingFrame();