function initBuffers(gl, positions, textureCorods, indices) {
	const positionBuffer = initPositionBuffer(gl, positions);
	const textureCoordBuffer = initTextureBuffer(gl, textureCorods);
	const indexBuffer = initIndexBuffer(gl, indices);

	return {
		position: positionBuffer,
		textureCoord: textureCoordBuffer,
		indices: indexBuffer,
	};
}

function initPositionBuffer(gl, data) {
	const positionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(data),
		gl.STATIC_DRAW,
	);

	return positionBuffer;
}

function initIndexBuffer(gl, data) {
	const indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

	gl.bufferData(
		gl.ELEMENT_ARRAY_BUFFER,
		new Uint16Array(data),
		gl.STATIC_DRAW,
	);

	return indexBuffer;
}

function initTextureBuffer(gl, data) {
	const textureCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

	gl.bufferData(
		gl.ARRAY_BUFFER,
		new Float32Array(data),
		gl.STATIC_DRAW,
	);

	return textureCoordBuffer;
}

export { initBuffers };
