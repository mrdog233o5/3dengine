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

	const buffers = initBuffers(gl);

	// Load texture
	const texture = loadTexture(gl, "/cubeTexture.png");
	// Flip image pixels into the bottom-to-top order that WebGL expects.
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	let then = 0;

	function render(now) {
		now *= 0.001; // to second
		deltaTime = now - then;
		then = now;

		drawScene(
			gl,
			programInfo,
			buffers,
			texture,
			cubeRotation,
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

	// Create the shader program
	console.log(vertexShader);
	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

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

//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.
//
function loadTexture(gl, url) {
	const texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Because images have to be downloaded over the internet
	// they might take a moment until they are ready.
	// Until then put a single pixel in the texture so we can
	// use it immediately. When the image has finished downloading
	// we'll update the texture with the contents of the image.
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

		// WebGL1 has different requirements for power of 2 images
		// vs. non power of 2 images so check if the image is a
		// power of 2 in both dimensions.
		if (
			isPowerOf2(image.width) &&
			isPowerOf2(image.height)
		) {
			// Yes, it's a power of 2. Generate mips.
			gl.generateMipmap(
				gl.TEXTURE_2D,
			);
		} else {
			// No, it's not a power of 2. Turn off mips and set
			// wrapping to clamp to edge
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
