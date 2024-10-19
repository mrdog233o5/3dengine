function initBuffers(gl) {
	const positionBuffer = initPositionBuffer(gl);
	const textureCoordBuffer = initTextureBuffer(gl);
	const indexBuffer = initIndexBuffer(gl);

	return {
		position: positionBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer,
	};
}

function initPositionBuffer(gl) {
	const positionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	const positions = [
		1, -1, 1,
		1, -1, -1,
		1, 1, -1,
		1, 1, 1,
		-1, 1, 1,
		-1, 1, -1,
		-1, -1, -1,
		-1, -1, 1,
	];

	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(positions),
		gl.STATIC_DRAW,
	);

	return positionBuffer;
}

function initIndexBuffer(gl) {
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	// This array defines each face as two triangles, using the
	// indices into the vertex array to specify each triangle's
	// position.

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

	// Now send the element array to GL

	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(indices),
		gl.STATIC_DRAW,
	);

	return indexBuffer;
}

function initTextureBuffer(gl) {
	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

	// const textureCoordinates = [
	// 	// Front
	// 	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	// 	// Back
	// 	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	// 	// Top
	// 	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	// 	// Bottom
	// 	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	// 	// Right
	// 	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	// 	// Left
	// 	0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
	// ];

	const textureCoordinates = [
		// Front
		1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 
		1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 
		1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 
		1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 
		1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 
		1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 1.0, 0.0, 
	];

	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(textureCoordinates),
		gl.STATIC_DRAW,
	);

	return textureCoordBuffer;
}

export { initBuffers };
