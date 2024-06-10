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
    constructor() {
        this.renderingFrame = this.renderingFrame.bind(this);
    }
    fov:number = 90;
    renderingRange:number = 10;
    camPos:[number,number,number] = [0, 0, 0];
    loops:number = 0;
    triangleVertices:number[] = [];
    lineVertices:number[] = [];

    // special functions
    start: () => void | undefined;
    frame: () => void | undefined;

    renderingFrame = ():void => {
        // set canvas size
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // clear screen
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // reset
        this.triangleVertices = [];
        this.lineVertices = [];

        // run frame function
        if (this.frame != undefined) this.frame();

        // draw triangles
        var triangleVertices32 = new Float32Array(this.triangleVertices);

        var triangleVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, triangleVertices32, gl.STATIC_DRAW);
        
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

        gl.drawArrays(gl.TRIANGLES, 0, triangleVertices32.length / lenPerRow);

        // draw LINES
        var lineVertices32 = new Float32Array(this.lineVertices);

        var lineVertexBufferObject = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, lineVertexBufferObject);
        gl.bufferData(gl.ARRAY_BUFFER, lineVertices32, gl.STATIC_DRAW);
        
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
        gl.drawArrays(gl.LINES, 0, lineVertices32.length / lenPerRow);
        gl.flush();

        // loop
        this.loops ++;
        window.requestAnimationFrame(this.renderingFrame);
    }
    projecting3D = (fov:number, screenSize:[number, number], renderingRange:number, coords:[number, number, number]):[number, number, number] => {
        var fovVertical = fov;
        var [x, y, z] = coords;
        x = x / z / (Math.tan((Math.PI/180)*fov / 2));
        y = y / z / (Math.tan((Math.PI/180)*fovVertical / 2));
        z = z/renderingRange;
        return [x, y, z];
    }
    calcRotatedCoord2D = (camAngle:number, coords: [number, number]):[number, number] => {
        var originalX = coords[0];
        var originalY = coords[1];
        var relAngle = Math.atan(originalX/originalY) * ( 180 / Math.PI );
        var angle = camAngle + relAngle;
        if (coords[1] < 0) angle += 180;
        var distance = Math.sqrt(originalX**2 + originalY**2);
    
        var x = (Math.sin((Math.PI/180)*angle) * distance);
        var y = (Math.cos((Math.PI/180)*angle) * distance);
        return [x, y];
    }
}

export default DoggyGraphicsEngine;
DoggyGraphicsEngine.renderingFrame();