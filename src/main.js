var vertexShaderText = String.raw`
precision mediump float;

attribute vec2 vertPos;
attribute vec3 vertColor;
varying vec3 fragColor;

void main() {
	fragColor = vertColor;
	gl_Position = vec4(vertPos, 0.0, 1.0);
}
`;
var fragmentShaderText = String.raw`
precision mediump float;

varying vec3 fragColor;

void main() {
	gl_FragColor = vec4(fragColor, 1);
}
`;

initCanvas();

function initCanvas() {
	var canvas = document.getElementById("canvas");
	var gl = canvas.getContext("webgl");

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
		console.error("Couldn't compile vertex shader:", gl.getShaderInfoLog(fragmentShader));
	}

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	// 
	// buffers
	// 
	var lenPerRow = 5;
	var triangleVerticies = new Float32Array([
		0.0, 0.5,		1, 1, 0,
		-0.5, -0.5,		0.7, 0, 1.0,
		0.5, -0.5,		0.1, 1.0, 0.6,
	]);

	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, triangleVerticies, gl.STATIC_DRAW);

	var positionAttribLocation = gl.getAttribLocation(program, "vertPos");
	var colorAttribLocation = gl.getAttribLocation(program, "vertColor");

	gl.vertexAttribPointer(
		positionAttribLocation,
		2,
		gl.FLOAT,
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT,
		0
	);
	gl.vertexAttribPointer(
		colorAttribLocation,
		3,
		gl.FLOAT,
		gl.FALSE,
		5 * Float32Array.BYTES_PER_ELEMENT,
		2 * Float32Array.BYTES_PER_ELEMENT
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	// 
	// main render loop
	// 
	gl.useProgram(program);
	gl.drawArrays(gl.TRIANGLES, 0, triangleVerticies.length / lenPerRow);
}