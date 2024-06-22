const vertexShaderText = String.raw`#version 300 es
precision highp float;

in vec3 vertPos;
in vec3 vertColor;
out vec3 fragColor;
uniform float fov;
uniform float aspectRatio;
uniform vec2 zRange;

void main() {
    float f = 1.0 / tan((radians(fov) / 2.0));
    
    float y = vertPos.y * f / abs(vertPos.z);
    float x = vertPos.x * f / abs(vertPos.z) * aspectRatio;
    float z = (vertPos.z - zRange.x) / (zRange.y - zRange.x) * 2.0 - 1.0;
    vec3 newPos = vec3(x, y, z);
    
    fragColor = vertColor;
    gl_Position = vec4(newPos, 1.0);
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
        // this.renderingFrame = this.renderingFrame.bind(this);

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
    screenSize:[number, number] = [0, 0];
    zRange:[number,number] = [0.5, 10];
    camPos:[number,number,number] = [0, 0, 0];
    camAngle:[number, number] = [0, 0];
    bgColor:[number, number, number, number] = [0,0,0,0];
    loops:number = 0;
    triangleVertices:number[] = [];
    lineVertices:number[] = [];
    canvas: HTMLCanvasElement | null;
    gl: WebGL2RenderingContext | null;
    program: WebGLProgram;
    
    // blanks variables
    start: () => void | null;

    drawLine = (vertices:[
        [number, number, number, number, number, number],
        [number, number, number, number, number, number],
    ]) => {
        canvas1.lineVertices = canvas1.lineVertices
            .concat(vertices[0])
            .concat(vertices[1]);
    }

    drawTriangle = (vertices:[
        [number, number, number, number, number, number],
        [number, number, number, number, number, number],
        [number, number, number, number, number, number],
    ],
    lines:boolean=false):void => {
        if (lines) {
            for (let i = 0; i < 3; i++) {
                this.drawLine([vertices[i], vertices[(i+1)%3]]);
            }
            return;
        }
        canvas1.triangleVertices = canvas1.triangleVertices
            .concat(vertices[0])
            .concat(vertices[1])
            .concat(vertices[2]);
    }

    render = ():void => {
        // set canvas size
        this.canvas!.width = document.body.clientWidth;
        this.canvas!.height = document.body.clientHeight;
        this.screenSize = [this.canvas!.width, this.canvas!.height];
        this.gl!.viewport(0, 0, this.gl!.canvas.width, this.gl!.canvas.height);

        // clear screen
        this.gl!.clearColor(this.bgColor[0],this.bgColor[1],this.bgColor[2],this.bgColor[3]);
        this.gl!.clear(this.gl!.COLOR_BUFFER_BIT | this.gl!.DEPTH_BUFFER_BIT);

        // set stuff
        const fovLocation = this.gl!.getUniformLocation(this.program, 'fov');
        const aspectRatioLocation = this.gl!.getUniformLocation(this.program, 'aspectRatio');
        const zRangeLocation = this.gl!.getUniformLocation(this.program, 'zRange');

        // Set the uniform values
        this.gl!.uniform1f(fovLocation, this.fov);
        this.gl!.uniform1f(aspectRatioLocation, this.screenSize[1] / this.screenSize[0]);
        this.gl!.uniform2f(zRangeLocation, this.zRange[0], this.zRange[1]);

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

        // reset
        this.loops ++;
        this.triangleVertices = [];
        this.lineVertices = [];
    }

    calcRotatedCoord2D = (camAngle:number, coords: [number, number]):[number, number] => {
        var [x, y] = coords;
        x = (coords[0] * Math.cos(camAngle * (Math.PI/180))) - (coords[1] * Math.sin(camAngle * (Math.PI/180)));
        y = (coords[0] * Math.sin(camAngle * (Math.PI/180))) + (coords[1] * Math.cos(camAngle * (Math.PI/180)));
        return [x, y];
    }

    calcRotatedCoord3D = (camAngle:[number, number], coords: [number, number, number]):[number, number, number] => {
        var [x, y, z] = coords;
        [y, z] = this.calcRotatedCoord2D(camAngle[0], [y, z]);
        [x, z] = this.calcRotatedCoord2D(camAngle[1], [x, z]);
        return [x, y, z];
    }
}

// export default DoggyGraphicsEngine;