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
canvas1.fov = 90;
canvas1.frame = () => {
    canvas1.bgColor = [(canvas1.loops/100)%1-0.3,(canvas1.loops/400)%1-0.3,(canvas1.loops/700)%1-0.3,1];
    var lineLength = 6;
	
    // loop through all triangles
    for (let i = 0; i < map.length; i += lineLength*3) {
        // per triangle
        var vertices = [];
        for (let j = i; j < i+lineLength*3; j += lineLength) {
            // per vertex
            var c = map.slice(j, j+lineLength);
            c[2] -= 2;
            var rotated = canvas1.calcRotatedCoord3D(canvas1.camAngle, c);
            c[0] = rotated[0];
            c[1] = rotated[1];
            c[2] = rotated[2];
            c[2] += 5;
            vertices.push(c);
        }
        canvas1.triangleVertices = canvas1.triangleVertices
            .concat(vertices[0])
            .concat(vertices[1])
            .concat(vertices[2]);
    }
}
document.addEventListener('mousemove', (event) => {
    const x = event.clientX;
    const y = event.clientY;
    canvas1.camAngle = [
        (y/canvas1.screenSize[1]*canvas1.fov)-canvas1.fov/2,
        (-x/canvas1.screenSize[0]*canvas1.fov)+canvas1.fov/2
    ];
});

canvas1.renderingFrame();