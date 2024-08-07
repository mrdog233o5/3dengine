const vertexShaderText = String.raw`#version 300 es
precision highp float;

in vec3 vertPos;
in vec2 aTextureCoord;
out vec2 vTextureCoord;

uniform float fov;
uniform float aspectRatio;
uniform vec2 zRange;

void main() {
    float f = 1.0 / tan((radians(fov) / 2.0));
    
    float y = vertPos.y * f / abs(vertPos.z);
    float x = vertPos.x * f / abs(vertPos.z) * aspectRatio;
    float z = (vertPos.z - zRange.x) / (zRange.y - zRange.x) * 2.0 - 1.0;
    vec3 newPos = vec3(x, y, z);
    
    gl_Position = vec4(newPos, 1.0);
    // vTextureCoord = aTextureCoord;
}
`;

const fragmentShaderText = String.raw`#version 300 es
precision highp float;

in vec2 vTextureCoord;
uniform sampler2D uSampler;
out vec4 fragColor;

void main() {
	fragColor = texture(uSampler, vTextureCoord);
}
`;

const lenPerRowTriangle = 5;
const lenPerRowLine = 6;

//
// main render loop
//

const DoggyGraphicsEngine = class {
	constructor(canvas: HTMLCanvasElement) {
		// set stuff
		this.canvas = canvas;

		// bind stuff
		// this.renderingFrame = this.renderingFrame.bind(this);

		// initialize webgl
		if (this.canvas == undefined) return;
		this.gl = this.canvas.getContext(
			"webgl2"
		) as WebGL2RenderingContext | null;
		if (!this.gl) {
			// Fall back to WebGL 1.0 if WebGL 2.0 is not available
			this.gl = this.canvas.getContext(
				"webgl"
			) as WebGL2RenderingContext | null;
			if (!this.gl) {
				console.error(
					"WebGL is not supported in this browser."
				);
			}
			console.log("Using WebGL 1.0");
		} else {
			console.log("Using WebGL 2.0");
		}

		var vertexShader: WebGLShader = this.gl!.createShader(
			this.gl!.VERTEX_SHADER
		) as WebGLShader;
		var fragmentShader: WebGLShader = this.gl!.createShader(
			this.gl!.FRAGMENT_SHADER
		) as WebGLShader;

		this.gl!.shaderSource(vertexShader, vertexShaderText);
		this.gl!.shaderSource(fragmentShader, fragmentShaderText);

		this.gl!.compileShader(vertexShader);
		if (
			!this.gl!.getShaderParameter(
				vertexShader,
				this.gl!.COMPILE_STATUS
			)
		) {
			console.error(
				"Couldn't compile vertex shader:",
				this.gl!.getShaderInfoLog(vertexShader)
			);
		}
		this.gl!.compileShader(fragmentShader);
		if (
			!this.gl!.getShaderParameter(
				fragmentShader,
				this.gl!.COMPILE_STATUS
			)
		) {
			console.error(
				"Couldn't compile fragment shader:",
				this.gl!.getShaderInfoLog(fragmentShader)
			);
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
	fov: number = 90;
	screenSize: [number, number] = [0, 0];
	zRange: [number, number] = [0.5, 10];
	camPos: [number, number, number] = [0, 0, 0];
	camAngle: [number, number] = [0, 0];
	bgColor: [number, number, number, number] = [0, 0, 0, 0];
	loops: number = 0;
	triangleVertices: number[] = [];
	lineVertices: number[] = [];
	textureCoords: number[] = [];
	canvas: HTMLCanvasElement | null;
	gl: WebGL2RenderingContext | null;
	program: WebGLProgram;

	// blanks variables
	start: () => void | null;

	// NOT FINISHED
	polygonTriangulation = (
		vertices: number[]
	): [number, number, number][] => {
		var res: [number, number, number][] = [];
		for (
			var i = 0, j = vertices.length - 1;
			res.length < vertices.length - 2;
			i++, j--
		) {
			res.push(
				[i, j, (i % 2 == 0 ? i : j) + 1].map(
					(value) => vertices[value]
				) as [number, number, number]
			);
		}

		return res;
	};

	loadTexture = (url: string): WebGLTexture => {
		const texture = this.gl!.createTexture();
		this.gl!.bindTexture(this.gl!.TEXTURE_2D, texture);

		// set some data about the image
		const level = 0;
		const internalFormat = this.gl!.RGBA;
		const width = 1;
		const height = 1;
		const border = 0;
		const srcFormat = this.gl!.RGBA;
		const srcType = this.gl!.UNSIGNED_BYTE;
		const pixel = new Uint8Array([0, 0, 255, 255]); // use this pixel when the image is still loading
		this.gl!.texImage2D(
			this.gl!.TEXTURE_2D,
			level,
			internalFormat,
			width,
			height,
			border,
			srcFormat,
			srcType,
			pixel
		);

		const image = new Image();
		image.onload = () => {
			this.gl!.bindTexture(this.gl!.TEXTURE_2D, texture);
			this.gl!.texImage2D(
				this.gl!.TEXTURE_2D,
				level,
				internalFormat,
				srcFormat,
				srcType,
				image
			);

			// check image size and do stuff with webgl
			if (
				this.isPowerOf2(image.width) &&
				this.isPowerOf2(image.height)
			) {
				this.gl!.generateMipmap(this.gl!.TEXTURE_2D);
			} else {
				this.gl!.texParameteri(
					this.gl!.TEXTURE_2D,
					this.gl!.TEXTURE_WRAP_S,
					this.gl!.CLAMP_TO_EDGE
				);
				this.gl!.texParameteri(
					this.gl!.TEXTURE_2D,
					this.gl!.TEXTURE_WRAP_T,
					this.gl!.CLAMP_TO_EDGE
				);
				this.gl!.texParameteri(
					this.gl!.TEXTURE_2D,
					this.gl!.TEXTURE_MIN_FILTER,
					this.gl!.LINEAR
				);
			}
		};
		image.src = url;

		return texture as WebGLTexture;
	};

	isPowerOf2 = (value): boolean => {
		return (value & (value - 1)) === 0;
	};

	// NOT FINISHED
	readOBJ = (rawContent: string): object[] => {
		var content = rawContent
			.split("\n")
			.map((line) => line.trim().split(" "));
		var res: {}[] = [];
		var tempName: string = "";
		var tempVertices: [number, number, number][] = [];
		var tempTriangles: number[] = [];
		content.forEach((line, i) => {
			switch (line[0]) {
				case "o":
					tempName = line[1];
					break;

				case "v":
					tempVertices.push(
						line
							.slice(1)
							.map((coord) =>
								Number(coord)
							) as [
							number,
							number,
							number
						]
					);
					break;

				case "f":
					this.polygonTriangulation(
						line
							.slice(1)
							.map((value) =>
								Number(value)
							)
					).forEach((vertices, index) => {
						vertices.forEach((vertex) => {
							tempTriangles =
								tempTriangles
									.concat(
										tempVertices[
											vertex -
												1
										]
									);
									// .concat(
									// 	[
									// 		0,
                                    //         0
									// 	]
									// );
						});
					});
					break;

				default:
					console.warn(
						`unknown command in obj file: ${line[0]}`
					);
					break;
			}
		});

		// add object
		res[tempName] = {
			vertices: tempVertices,
			triangles: tempTriangles,
		};

		return res;
	};

	setTexture = (url: string): void => {
		const texture = this.loadTexture(url);
		this.gl!.pixelStorei(this.gl!.UNPACK_FLIP_Y_WEBGL, true);
	};

	drawLine = (
		vertices: [
			[number, number, number, number, number, number],
			[number, number, number, number, number, number]
		]
	) => {
		this.lineVertices = this.lineVertices
			.concat(vertices[0])
			.concat(vertices[1]);
	};

	drawTriangle = (
		vertices: [
			[number, number, number, number, number,],
			[number, number, number, number, number,],
			[number, number, number, number, number,]
		]
	): void => {
		canvas1.triangleVertices = canvas1.triangleVertices
			.concat(vertices[0])
			.concat(vertices[1])
			.concat(vertices[2]);
	};

	render = (): void => {
		// set canvas size
		this.canvas!.width = document.body.clientWidth;
		this.canvas!.height = document.body.clientHeight;
		this.screenSize = [this.canvas!.width, this.canvas!.height];
		this.gl!.viewport(
			0,
			0,
			this.gl!.canvas.width,
			this.gl!.canvas.height
		);

		// clear screen
		this.gl!.clearColor(
			this.bgColor[0],
			this.bgColor[1],
			this.bgColor[2],
			this.bgColor[3]
		);
		this.gl!.clear(
			this.gl!.COLOR_BUFFER_BIT | this.gl!.DEPTH_BUFFER_BIT
		);

		// set stuff
		const fovLocation = this.gl!.getUniformLocation(
			this.program,
			"fov"
		);
		const aspectRatioLocation = this.gl!.getUniformLocation(
			this.program,
			"aspectRatio"
		);
		const zRangeLocation = this.gl!.getUniformLocation(
			this.program,
			"zRange"
		);

		// Set the uniform values
		this.gl!.uniform1f(fovLocation, this.fov);
		this.gl!.uniform1f(
			aspectRatioLocation,
			this.screenSize[1] / this.screenSize[0]
		);
		this.gl!.uniform2f(
			zRangeLocation,
			this.zRange[0],
			this.zRange[1]
		);

		// draw triangles
        // console.log(this.triangleVertices);
		var triangleVertices32 = new Float32Array(
			this.triangleVertices
		);

		var triangleVertexBufferObject = this.gl!.createBuffer();
		this.gl!.bindBuffer(
			this.gl!.ARRAY_BUFFER,
			triangleVertexBufferObject
		);
		this.gl!.bufferData(
			this.gl!.ARRAY_BUFFER,
			triangleVertices32,
			this.gl!.STATIC_DRAW
		);

		var positionAttribLocation = this.gl!.getAttribLocation(
			this.program,
			"vertPos"
		);
		var textureCoordsAttribLocation = this.gl!.getAttribLocation(
			this.program,
			"vertColor"
		);

		this.gl!.vertexAttribPointer(
			positionAttribLocation,
			3,
			this.gl!.FLOAT,
			false,
			lenPerRowTriangle * Float32Array.BYTES_PER_ELEMENT,
			0
		);
		this.gl!.vertexAttribPointer(
			textureCoordsAttribLocation,
			2,
			this.gl!.FLOAT,
			false,
			lenPerRowTriangle * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		);

		this.gl!.enableVertexAttribArray(positionAttribLocation);
		this.gl!.enableVertexAttribArray(textureCoordsAttribLocation);

		this.gl!.drawArrays(
			this.gl!.TRIANGLES,
			0,
			triangleVertices32.length / lenPerRowTriangle
		);

		// draw lines
		var lineVertices32 = new Float32Array(this.lineVertices);

		var lineVertexBufferObject = this.gl!.createBuffer();
		this.gl!.bindBuffer(
			this.gl!.ARRAY_BUFFER,
			lineVertexBufferObject
		);
		this.gl!.bufferData(
			this.gl!.ARRAY_BUFFER,
			lineVertices32,
			this.gl!.STATIC_DRAW
		);

		positionAttribLocation = this.gl!.getAttribLocation(
			this.program,
			"vertPos"
		);
		textureCoordsAttribLocation = this.gl!.getAttribLocation(
			this.program,
			"vertColor"
		);

		this.gl!.vertexAttribPointer(
			positionAttribLocation,
			3,
			this.gl!.FLOAT,
			false,
			lenPerRowLine * Float32Array.BYTES_PER_ELEMENT,
			0
		);
		this.gl!.vertexAttribPointer(
			textureCoordsAttribLocation,
			2,
			this.gl!.FLOAT,
			false,
			lenPerRowLine * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		);

		this.gl!.enableVertexAttribArray(positionAttribLocation);
		this.gl!.enableVertexAttribArray(textureCoordsAttribLocation);
		this.gl!.drawArrays(
			this.gl!.LINES,
			0,
			lineVertices32.length / lenPerRowTriangle
		);
		this.gl!.flush();

		// reset
		this.loops++;
		this.triangleVertices = [];
		this.lineVertices = [];
	};

	calcRotatedCoord2D = (
		camAngle: number,
		coords: [number, number]
	): [number, number] => {
		var [x, y] = coords;
		x =
			coords[0] * Math.cos(camAngle * (Math.PI / 180)) -
			coords[1] * Math.sin(camAngle * (Math.PI / 180));
		y =
			coords[0] * Math.sin(camAngle * (Math.PI / 180)) +
			coords[1] * Math.cos(camAngle * (Math.PI / 180));
		return [x, y];
	};

	calcRotatedCoord3D = (
		camAngle: [number, number],
		coords: [number, number, number]
	): [number, number, number] => {
		var [x, y, z] = coords;
		[y, z] = this.calcRotatedCoord2D(camAngle[0], [y, z]);
		[x, z] = this.calcRotatedCoord2D(camAngle[1], [x, z]);
		return [x, y, z];
	};
};

// export default DoggyGraphicsEngine;
