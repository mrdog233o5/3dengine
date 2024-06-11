// import DoggyGraphicsEngine from "/src/rendering.ts";

// load stuff
var map = [
    1, 1, 1,
    1, 1, 3,
    1, -1, 3,

    1, 1, 1,
    1, -1, 1,
    1, -1, 3,

    -1, 1, 1,
    -1, 1, 3,
    -1, -1, 3,

    -1, 1, 1,
    -1, -1, 1,
    -1, -1, 3,
    
    1, 1, 1,
    1, 1, 3,
    -1, 1, 3,

    1, 1, 1,
    -1, 1, 1,
    -1, 1, 3,

    1, -1, 1,
    1, -1, 3,
    -1, -1, 3,

    1, -1, 1,
    -1, -1, 1,
    -1, -1, 3,

    1, 1, 3,
    1, -1, 3,
    -1, -1, 3,

    1, 1, 3,
    -1, 1, 3,
    -1, -1, 3,
];

DoggyGraphicsEngine.canvas = document.getElementById("canvas");
DoggyGraphicsEngine.init();

DoggyGraphicsEngine.frame = () => {
    var camAngle = 0;
    var lineLength = 3;
	
    // loop through all triangles
    for (let i = 0; i < map.length; i += lineLength*3) {
        // per triangle
        var vertices = [];
        for (let j = i; j < i+lineLength*3; j += lineLength) {
            // per vertex
            var c = map.slice(j, j+lineLength);
            var rotated = DoggyGraphicsEngine.calcRotatedCoord2D(DoggyGraphicsEngine.loops, [0, 1]);
            c[0] += rotated[0];
            c[1] += rotated[1];
            vertices.push(DoggyGraphicsEngine.projecting3D(DoggyGraphicsEngine.fov, [canvas.width, canvas.height], DoggyGraphicsEngine.renderingRange, c).concat([1, 1, 0]));
        }
        DoggyGraphicsEngine.lineVertices = DoggyGraphicsEngine.lineVertices
            .concat(vertices[0])
            .concat(vertices[1])
            .concat(vertices[1])
            .concat(vertices[2])
            .concat(vertices[2])
            .concat(vertices[0]);
    }
}
DoggyGraphicsEngine.renderingFrame();