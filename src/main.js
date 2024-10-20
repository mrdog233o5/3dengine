import { initBuffers } from "./initBuffers.js";
import { renderObject } from "./renderObject.js";

let cubeRotation = 0.0;
let deltaTime = 0;

const vertexPos = [
	1, -1, 1,
	1, -1, -1,
	1, 1, -1,
	1, 1, 1,
	-1, 1, 1,
	-1, 1, -1,
	-1, -1, -1,
	-1, -1, 1,
];

const vertexPos2 = vertexPos.map((value, index) => (index % 3 == 0 ? value + 3 : value));
console.log(vertexPos2);

const indices = [
	1, 2, 3,
	1, 3, 4,
	5, 6, 7,
	5, 7, 8,
	4, 5, 8,
	4, 8, 1,
	8, 7, 2,
	8, 2, 1,
	4, 3, 6,
	4, 6, 5,
	2, 7, 6,
	2, 6, 3,
].map((value) => value-1);

var textureCoords = [];
indices.forEach((value, index) => {
	var temp = [
		0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 
	];
	textureCoords = textureCoords.concat(temp[index % temp.length])
})

textureCoords = [
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
];

function main() {
	const canvas = document.querySelector("#canvas");
	const gl = canvas.getContext("webgl2");

	if (gl === null) {
		console.error(
			"Unable to initialize WebGL. Your browser or machine may not support it.",
		);
		return;
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	const vsSource = `#version 300 es
    in vec4 aVertexPosition;
    in vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    out highp vec2 vTextureCoord;

    void main(void) {
      	gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      	vTextureCoord = aTextureCoord;
    }
  	`;

	const fsSource = `#version 300 es
	precision highp float;
	in vec2 vTextureCoord;

	uniform sampler2D uSampler;
	out vec4 fragColor;

	void main(void) {
		fragColor = texture(uSampler, vTextureCoord);
		// fragColor = vec4(1,1,1,1);
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
			textureCoord: gl.getAttribLocation(
				shaderProgram,
				"aTextureCoord",
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
			uSampler: gl.getUniformLocation(
				shaderProgram,
				"uSampler",
			),
		},
	};


	const texture = loadTexture(gl, "/cubeTexture.png");
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	let then = 0;

	function render(now) {
		var width = document.body.clientWidth;
		var height = document.body.clientHeight;
		canvas.width = width;
		canvas.height = height;
		gl.viewport(
			0,
			0,
			width, height
		);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clearDepth(1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		now *= 0.001; // to second
		deltaTime = now - then;
		then = now;
		var buffers = initBuffers(gl, vertexPos, textureCoords, indices);
		renderObject(
			gl,
			programInfo,
			buffers,
			texture,
			cubeRotation,
			indices.length
		);

		var buffers2 = initBuffers(gl, vertexPos2, textureCoords, indices);
		renderObject(
			gl,
			programInfo,
			buffers2,
			texture,
			cubeRotation,
			indices.length
		);

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

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.error(
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
		console.error(
			`An error occurred compiling the shaders: ${gl.getShaderInfoLog(
				shader,
			)}`,
		);
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	const level = 0;
	const internalFormat = gl.RGBA;
	const width = 1;
	const height = 1;
	const border = 0;
	const srcFormat = gl.RGBA;
	const srcType = gl.UNSIGNED_BYTE;
	const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
	gl.texImage2D(
		gl.TEXTURE_2D,
		level,
		internalFormat,
		width,
		height,
		border,
		srcFormat,
		srcType,
		pixel,
	);

	const image = new Image();
	image.onload = () => {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(
			gl.TEXTURE_2D,
			level,
			internalFormat,
			srcFormat,
			srcType,
			image,
		);

		if (
			isPowerOf2(image.width) &&
			isPowerOf2(image.height)
		) {
			gl.generateMipmap(
				gl.TEXTURE_2D,
			);
		} else {
			gl.texParameteri(
				gl.TEXTURE_2D,
				gl.TEXTURE_WRAP_S,
				gl.CLAMP_TO_EDGE,
			);
			gl.texParameteri(
				gl.TEXTURE_2D,
				gl.TEXTURE_WRAP_T,
				gl.CLAMP_TO_EDGE,
			);
			gl.texParameteri(
				gl.TEXTURE_2D,
				gl.TEXTURE_MIN_FILTER,
				gl.LINEAR,
			);
		}
	};
	image.src = url;

	return texture;
}

function isPowerOf2(value) {
	return (value & (value - 1)) === 0;
}

main();