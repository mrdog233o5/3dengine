const vertexShaderText = String.raw`#version 300 es
precision highp float;

in vec3 vertPos;
in vec3 vertColor;
out vec3 fragColor;

void main() {
    fragColor = vertColor;
    gl_Position = vec4(vertPos.x, vertPos.y, vertPos.z, 1);
}
`;

const fragmentShaderText = String.raw`#version 300 es
precision highp float;

in vec3 fragColor;
out vec4 color;

void main() {
	color = vec4(fragColor, 1);
}
`;

const lenPerRow = 6;

// 
// main render loop
// 

function isNotNullOrUndefined<T>(value: T): value is NonNullable<T> {
    return value !== null && value !== undefined;
}

const DoggyGraphicsEngine = class {
    constructor(canvas: HTMLCanvasElement) {
        // set stuff
        this.canvas = canvas;

        // bind stuff
        this.renderingFrame = this.renderingFrame.bind(this);

        // initialize webgl
        if (this.canvas == undefined) return;
        this.gl = this.canvas.getContext("webgl2") as WebGL2RenderingContext | null;
        if (!this.gl) {
            // Fall back to WebGL 1.0 if WebGL 2.0 is not available
            this.gl = this.canvas.getContext("webgl") as WebGL2RenderingContext | null;
            if (!this.gl) {
                console.error("WebGL is not supported in this browser.");
            }
            console.log("Using WebGL 1.0");
        } else {
            console.log("Using WebGL 2.0");
        }

        var vertexShader: WebGLShader = this.gl!.createShader(this.gl!.VERTEX_SHADER) as WebGLShader;
        var fragmentShader: WebGLShader = this.gl!.createShader(this.gl!.FRAGMENT_SHADER) as WebGLShader;

        this.gl!.shaderSource(vertexShader, vertexShaderText);
        this.gl!.shaderSource(fragmentShader, fragmentShaderText);

        this.gl!.compileShader(vertexShader);
        if (!this.gl!.getShaderParameter(vertexShader, this.gl!.COMPILE_STATUS)) {
            console.error("Couldn't compile vertex shader:", this.gl!.getShaderInfoLog(vertexShader));
        }
        this.gl!.compileShader(fragmentShader);
        if (!this.gl!.getShaderParameter(fragmentShader, this.gl!.COMPILE_STATUS)) {
            console.error("Couldn't compile fragment shader:", this.gl!.getShaderInfoLog(fragmentShader));
        }

        this.program = this.gl!.createProgram() as WebGLProgram;
        
        this.gl!.attachShader(this.program, vertexShader);
        this.gl!.attachShader(this.program, fragmentShader);
        this.gl!.linkProgram(this.program);

        this.gl!.useProgram(this.program);

        this.gl!.enable(this.gl!.DEPTH_TEST);
        this.gl!.depthFunc(this.gl!.LESS);
        this.gl!.depthMask(true);
    }
    fov:number = 90;
    renderingRange:number = 10;
    camPos:[number,number,number] = [0, 0, 0];
    loops:number = 0;
    triangleVertices:number[] = [];
    lineVertices:number[] = [];
    canvas: HTMLCanvasElement | null;
    gl: WebGL2RenderingContext | null;
    program: WebGLProgram;
    
    // blanks variables
    start: () => void | null;
    frame: () => void | null;
    
    renderingFrame = ():void => {
        // set canvas size
        this.canvas!.width = document.body.clientWidth;
        this.canvas!.height = document.body.clientHeight;
        this.gl!.viewport(0, 0, this.gl!.canvas.width, this.gl!.canvas.height);

        // clear screen
        this.gl!.clearColor(0, 0, 0, 1);
        this.gl!.clear(this.gl!.COLOR_BUFFER_BIT | this.gl!.DEPTH_BUFFER_BIT);

        // reset
        this.triangleVertices = [];
        this.lineVertices = [];

        // run frame function
        if (this.frame != undefined) this.frame();

        // draw triangles
        var triangleVertices32 = new Float32Array(this.triangleVertices);

        var triangleVertexBufferObject = this.gl!.createBuffer();
        this.gl!.bindBuffer(this.gl!.ARRAY_BUFFER, triangleVertexBufferObject);
        this.gl!.bufferData(this.gl!.ARRAY_BUFFER, triangleVertices32, this.gl!.STATIC_DRAW);
        
        var positionAttribLocation = this.gl!.getAttribLocation(this.program, 'vertPos');
        var colorAttribLocation = this.gl!.getAttribLocation(this.program, 'vertColor');
        
        this.gl!.vertexAttribPointer(
            positionAttribLocation,
            3,
            this.gl!.FLOAT,
            false,
            lenPerRow * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.gl!.vertexAttribPointer(
            colorAttribLocation,
            3,
            this.gl!.FLOAT,
            false,
            lenPerRow * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        
        this.gl!.enableVertexAttribArray(positionAttribLocation);
        this.gl!.enableVertexAttribArray(colorAttribLocation);

        this.gl!.drawArrays(this.gl!.TRIANGLES, 0, triangleVertices32.length / lenPerRow);

        // draw LINES
        var lineVertices32 = new Float32Array(this.lineVertices);

        var lineVertexBufferObject = this.gl!.createBuffer();
        this.gl!.bindBuffer(this.gl!.ARRAY_BUFFER, lineVertexBufferObject);
        this.gl!.bufferData(this.gl!.ARRAY_BUFFER, lineVertices32, this.gl!.STATIC_DRAW);
        
        positionAttribLocation = this.gl!.getAttribLocation(this.program, 'vertPos');
        colorAttribLocation = this.gl!.getAttribLocation(this.program, 'vertColor');
        
        this.gl!.vertexAttribPointer(
            positionAttribLocation,
            3,
            this.gl!.FLOAT,
            false,
            lenPerRow * Float32Array.BYTES_PER_ELEMENT,
            0
        );
        this.gl!.vertexAttribPointer(
            colorAttribLocation,
            3,
            this.gl!.FLOAT,
            false,
            lenPerRow * Float32Array.BYTES_PER_ELEMENT,
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        
        this.gl!.enableVertexAttribArray(positionAttribLocation);
        this.gl!.enableVertexAttribArray(colorAttribLocation);
        this.gl!.drawArrays(this.gl!.LINES, 0, lineVertices32.length / lenPerRow);
        this.gl!.flush();

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
        var [x, y] = coords;
        x = (coords[0] * Math.cos(camAngle * (Math.PI/180))) - (coords[1] * Math.sin(camAngle * (Math.PI/180)));
        y = (coords[0] * Math.sin(camAngle * (Math.PI/180))) + (coords[1] * Math.cos(camAngle * (Math.PI/180)));
        return [x, y];
    }
}

// export default DoggyGraphicsEngine;