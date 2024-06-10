var vertexShaderText = String.raw`#version 300 es
precision highp float;

in vec3 vertPos;
in vec3 vertColor;
out vec3 fragColor;

void main() {
    fragColor = vertColor;
    gl_Position = vec4(vertPos.x, vertPos.y, vertPos.z, 1);
}
`;

var fragmentShaderText = String.raw`#version 300 es
precision highp float;

in vec3 fragColor;
out vec4 color;

void main() {
	color = vec4(fragColor, 1);
}
`;


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

// init
var canvas = document.getElementById("canvas");
var gl = canvas.getContext("webgl2");
var lenPerRow = 6;
if (!gl) {
    // Fall back to WebGL 1.0 if WebGL 2.0 is not available
    gl = canvas.getContext("webgl");
    if (!gl) {
        console.error("WebGL is not supported in this browser.");
    }
    console.log("Using WebGL 1.0");
} else {
    console.log("Using WebGL 2.0");
}

gl.clearColor(0, 0, 0, 1);

var vertexShader = gl.createShader(gl.VERTEX_SHADER);
var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vertexShaderText);
gl.shaderSource(fragmentShader, fragmentShaderText);

gl.compileShader(vertexShader);
if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    console.error("Couldn't compile vertex shader:", gl.getShaderInfoLog(vertexShader));
}
gl.compileShader(fragmentShader);
if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    console.error("Couldn't compile fragment shader:", gl.getShaderInfoLog(fragmentShader));
}

var program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

gl.useProgram(program);

// 
// stuff
// 

gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LESS);
gl.depthMask(true);

// 
// main render loop
// 
var fov = 90;
var renderingRange = 10;
var camPos = [0, 0, 0];
var temp = 0;
function frame() {
    // set canvas size
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // clear screen
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // main
    var triangleVerticies = [];
    var lineVerticies = [];
    var camAngle = 0;
    var lineLength = 3;

    // loop through all triangles
    for (let i = 0; i < map.length; i += lineLength*3) {
        // per triangle
        var vertices = [];
        for (let j = i; j < i+lineLength*3; j += lineLength) {
            // per vertex
            var c = map.slice(j, j+lineLength);
            var rotated = calcRotatedCoord2D(temp, [0, 1]);
            c[0] += rotated[0];
            c[1] += rotated[1];
            // asd
            vertices.push(projecting3D(fov, [canvas.width, canvas.height], renderingRange, c).concat([1, 1, 0]));
        }
        lineVerticies = lineVerticies
            .concat(vertices[0])
            .concat(vertices[1])
            .concat(vertices[1])
            .concat(vertices[2])
            .concat(vertices[2])
            .concat(vertices[0]);
    }
    temp += 2;

    // draw triangles
    var triangleVerticies32 = new Float32Array(triangleVerticies);

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVerticies32, gl.STATIC_DRAW);
    
    var positionAttribLocation = gl.getAttribLocation(program, 'vertPos');
    var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    
    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        lenPerRow * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        lenPerRow * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    );
    
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    gl.drawArrays(gl.TRIANGLES, 0, triangleVerticies32.length / lenPerRow);

    // draw LINES
    var lineVerticies32 = new Float32Array(lineVerticies);

    var lineVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, lineVerticies32, gl.STATIC_DRAW);
    
    positionAttribLocation = gl.getAttribLocation(program, 'vertPos');
    colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
    
    gl.vertexAttribPointer(
        positionAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        lenPerRow * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.vertexAttribPointer(
        colorAttribLocation,
        3,
        gl.FLOAT,
        gl.FALSE,
        lenPerRow * Float32Array.BYTES_PER_ELEMENT,
        3 * Float32Array.BYTES_PER_ELEMENT
    );
    
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);
    gl.drawArrays(gl.LINES, 0, lineVerticies32.length / lenPerRow);
    gl.flush();

    // loop
    requestAnimationFrame(frame);
}
frame();