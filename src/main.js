var vertexShaderText = String.raw`#version 300 es
precision highp float;

in vec3 vertPos;
in vec3 vertColor;
out vec3 fragColor;

void main() {
    fragColor = vertColor;
    gl_Position = vec4(vertPos, 1.0);
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

initCanvas();

function initCanvas() {
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl2");
    if (!gl) {
        // Fall back to WebGL 1.0 if WebGL 2.0 is not available
        gl = canvas.getContext("webgl");
        if (!gl) {
            console.error("WebGL is not supported in this browser.");
            return;
        }
        console.log("Using WebGL 1.0");
    } else {
        console.log("Using WebGL 2.0");
    }

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

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
    // buffers
    // 
    var lenPerRow = 6;
    var triangleVerticies = new Float32Array([
        0.3, 0.5, 1,        1, 1, 0,
        -0.5, 0, 1,         1, 1, 0,
        0.3, -0.5, 1,       1, 1, 0,
        -0.3, 0.5, 0,       1, 0, 1,
        0.5, 0, 1,          1, 0, 1,
        -0.3, -0.5, 0,      1, 0, 1,
    ]);

    var triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVerticies, gl.STATIC_DRAW);
	
	const positionAttribLocation = gl.getAttribLocation(program, 'vertPos');
	const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

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

    // 
    // main render loop
    // 
    gl.drawArrays(gl.TRIANGLES, 0, triangleVerticies.length / lenPerRow);
}