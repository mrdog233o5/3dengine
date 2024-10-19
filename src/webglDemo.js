main();

import { initBuffers } from "./initBuffers.js";
import { drawScene } from "./drawScene.js";

let cubeRotation = 0.0;
let deltaTime = 0;

function main() {
	const canvas = document.querySelector("#canvas");
	const gl = canvas.getContext("webgl2");

	if (gl === null) {
		alert(
			"Unable to initialize WebGL. Your browser or machine may not support it.",
		);
		return;
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
   		gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    	vColor = aVertexColor;
    }
  	`;

	const fsSource = `
	varying lowp vec4 vColor;

	void main(void) {
		gl_FragColor = vColor;
	}
	`;

	const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

	const programInfo = {
		program: shaderProgram,
		attribLocations: {
			vertexPosition: gl.getAttribLocation(
				shaderProgram,
				"aVertexPosition",
			),
			vertexColor: gl.getAttribLocation(
				shaderProgram,
				"aVertexColor",
			),
		},
		uniformLocations: {
			projectionMatrix: gl.getUniformLocation(
				shaderProgram,
				"uProjectionMatrix",
			),
			modelViewMatrix: gl.getUniformLocation(
				shaderProgram,
				"uModelViewMatrix",
			),
		},
	};

	const buffers = initBuffers(gl);

	let then = 0;

	function render(now) {
		now *= 0.001; // to second
		deltaTime = now - then;
		then = now;

		drawScene(gl, programInfo, buffers, cubeRotation);
		cubeRotation += deltaTime;
		

		requestAnimationFrame(render);
	}
	requestAnimationFrame(render);
}

function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(
		gl,
		gl.FRAGMENT_SHADER,
		fsSource,
	);

	// Create the shader program

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		alert(
			`Unable to initialize the shader program: ${gl.getProgramInfoLog(
				shaderProgram,
			)}`,
		);
		return null;
	}

	return shaderProgram;
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);

	gl.shaderSource(shader, source);

	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert(
			`An error occurred compiling the shaders: ${gl.getShaderInfoLog(
				shader,
			)}`,
		);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}
