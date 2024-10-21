import { initBuffers } from "./initBuffers.js";
import { renderObject } from "./renderObject.js";
import { initWebGL, initShader, initProgramProps } from "./initCanvas.js";

let cubeRotation = 0.0;

class Dimet {
	constructor(canvasElement) {
		this.canvas = canvasElement;
		this.objects = [];
	}

	init() {
		this.gl = initWebGL(this.canvas);
		this.shaderProgram = initShader(this.gl);
		this.programProps = initProgramProps(
			this.gl,
			this.shaderProgram,
		);
	}

	drawObject(
		vertexPos,
		textureCoords,
		indices,
		translationMatrix,
		rotationMatrix,
		textureURL,
	) {
		this.objects.push([
			vertexPos,
			textureCoords,
			indices,
			translationMatrix,
			rotationMatrix,
			this.loadTexture(
				this.gl,
				textureURL,
			),
		]);
	}

	loadTexture(gl, url) {
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
			gl.bindTexture(
				gl.TEXTURE_2D,
				texture,
			);
			gl.texImage2D(
				gl.TEXTURE_2D,
				level,
				internalFormat,
				srcFormat,
				srcType,
				image,
			);

			if (
				(image.width &
					(image.width -
						1)) ===
					0 &&
				(image.height &
					(image.height -
						1)) ===
					0
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
				object[2]
					.length,
				object[3],
				object[4],
			);
		});

		cubeRotation += 0.01;
	}
}

export { Dimet };
