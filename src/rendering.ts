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

// init
var canvas = document.getElementById("canvas") as HTMLCanvasElement;
var gl: WebGL2RenderingContext = canvas.getContext("webgl2") as WebGL2RenderingContext;
var lenPerRow = 6;
if (!gl) {
    // Fall back to WebGL 1.0 if WebGL 2.0 is not available
    // gl = canvas.getContext("webgl") ?? WebGL2RenderingContext;
    if (!gl) {
        console.error("WebGL is not supported in this browser.");
    }
    console.log("Using WebGL 1.0");
} else {
    console.log("Using WebGL 2.0");
}

var vertexShader: WebGLShader = gl.createShader(gl.VERTEX_SHADER) as WebGLShader;
var fragmentShader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER) as WebGLShader;

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

var program: WebGLProgram = gl.createProgram() as WebGLProgram;
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
const DoggyGraphicsEngine = new class {
    fov = 90;
    renderingRange = 10;
    camPos = [0, 0, 0];
    loops = 0;
    triangleVerticies: number[] = [];
    lineVerticies: number[] = [];
    constructor() {
        this.renderingFrame = this.renderingFrame.bind(this);
    }
    renderingFrame() {
        // set canvas size
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // clear screen
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // reset
        this.triangleVerticies = [];
        this.lineVerticies = [];

        // run frame function
        frame();

        // draw triangles
        var triangleVerticies32 = new Float32Array(this.triangleVerticies);

        var triangleVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, triangleVerticies32, gl.STATIC_DRAW);
        
        var positionAttribLocation = gl.getAttribLocation(program, 'vertPos');
        var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
        
        gl.vertexAttribPointer(
            positionAttribLocation,
            3,
            gl.FLOAT,
            false,
            lenPerRow * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        gl.vertexAttribPointer(
            colorAttribLocation,
            3,
            gl.FLOAT,
            false,
            lenPerRow * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(colorAttribLocation);

        gl.drawArrays(gl.TRIANGLES, 0, triangleVerticies32.length / lenPerRow);

        // draw LINES
        var lineVerticies32 = new Float32Array(this.lineVerticies);

        var lineVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, lineVerticies32, gl.STATIC_DRAW);
        
        positionAttribLocation = gl.getAttribLocation(program, 'vertPos');
        colorAttribLocation = gl.getAttribLocation(program, 'vertColor');
        
        gl.vertexAttribPointer(
            positionAttribLocation,
            3,
            gl.FLOAT,
            false,
            lenPerRow * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        gl.vertexAttribPointer(
            colorAttribLocation,
            3,
            gl.FLOAT,
            false,
            lenPerRow * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        
        gl.enableVertexAttribArray(positionAttribLocation);
        gl.enableVertexAttribArray(colorAttribLocation);
        gl.drawArrays(gl.LINES, 0, lineVerticies32.length / lenPerRow);
        gl.flush();

        // loop
        this.loops ++;
        window.requestAnimationFrame(this.renderingFrame);
    }
}

start();
DoggyGraphicsEngine.renderingFrame();