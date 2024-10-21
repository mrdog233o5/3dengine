import { initBuffers } from "./initBuffers.js";
import { renderObject } from "./renderObject.js";

let cubeRotation = 0.0;

class Dimet {
	constructor(canvasElement) {
		this.canvas = canvasElement;
		this.objects = [];
	}

	init() {
		this.initWebGL();
		this.initShaderProgram();
		this.initProgramProps();
	}

	initWebGL() {
		this.gl = canvas.getContext("webgl2");

		if (this.gl === null) {
			console.error(
				"Unable to initialize Webgl. Your browser or machine may not support it.",
			);
			return;
		}
	}

	initShaderProgram() {
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
			// this.fragColor = vec4(1,1,1,1);
		}
		`;

		this.shaderProgram = initShaderProgram(
			this.gl,
			vsSource,
			fsSource,
		);
	}

	initProgramProps() {
		this.programProps = {
			program: this.shaderProgram,
			attribLocations: {
				vertexPosition: this.gl.getAttribLocation(
					this
						.shaderProgram,
					"aVertexPosition",
				),
				textureCoord: this.gl.getAttribLocation(
					this
						.shaderProgram,
					"aTextureCoord",
				),
			},
			uniformLocations: {
				projectionMatrix: this.gl.getUniformLocation(
					this
						.shaderProgram,
					"uProjectionMatrix",
				),
				modelViewMatrix: this.gl.getUniformLocation(
					this
						.shaderProgram,
					"uModelViewMatrix",
				),
				uSampler: this.gl.getUniformLocation(
					this
						.shaderProgram,
					"uSampler",
				),
			},
		};
	}

	drawObject(
		vertexPos,
		textureCoords,
		indices,
		translationMatrix,
		rotationMatrix,
		textureURL
	) {
		this.objects.push([
			vertexPos,
			textureCoords,
			indices,
			translationMatrix,
			rotationMatrix,
			loadTexture(this.gl, textureURL)
		]);
	}

	render() {
		var width = document.body.clientWidth;
		var height = document.body.clientHeight;
		canvas.width = width;
		canvas.height = height;
		this.gl.viewport(0, 0, width, height);
		this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
		this.gl.clearDepth(1.0);
		this.gl.enable(this.gl.DEPTH_TEST);
		this.gl.depthFunc(this.gl.LEQUAL);
		this.gl.pixelStorei(
			this.gl.UNPACK_FLIP_Y_WEBGL,
			true,
		);

		this.gl.clear(
			this.gl.COLOR_BUFFER_BIT |
				this.gl
					.DEPTH_BUFFER_BIT,
		);

		this.objects.forEach(object => {
			var buffers = initBuffers(
				this.gl,
				object[0],
				object[1],
				object[2],
			);
			renderObject(
				this.gl,
				this
					.programProps,
				buffers,
				object[5],
				cubeRotation,
				object[2].length,
				object[3],
				object[4],
			);
		});

		cubeRotation += 0.01;
	}
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

export { Dimet };
