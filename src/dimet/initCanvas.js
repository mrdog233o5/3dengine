function initWebGL(canvas) {
	const gl = canvas.getContext("webgl2");
	if (gl === null) {
		console.error(
			"Unable to initialize Webgl. Your browser or machine may not support it.",
		);
		return;
	}
	return gl;
}

function initShader(gl) {
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

	return shaderProgram;
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

function initProgramProps(gl, shaderProgram) {
	const programProps = {
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

	return programProps;
}

export { initWebGL, initShader, initProgramProps };
