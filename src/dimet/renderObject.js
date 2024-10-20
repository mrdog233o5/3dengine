function renderObject(
	gl,
	programInfo,
	buffers,
	texture,
	cubeRotation,
	vertexCount,
	translateMatrix,
	rotationMatrix,
) {
	const FOV = 60;
	const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
	const zNear = 0.1;
	const zFar = 100.0;
	const projectionMatrix = mat4.create();

	mat4.perspective(
		projectionMatrix,
		(FOV * Math.PI) / 180,
		aspect,
		zNear,
		zFar,
	);

	const modelViewMatrix = mat4.create();

	mat4.translate(
		modelViewMatrix,
		modelViewMatrix,
		translateMatrix,
	);
	mat4.rotate(
		modelViewMatrix,
		modelViewMatrix,
		cubeRotation,
		rotationMatrix,
	);

	setPositionAttribute(gl, buffers, programInfo);
	setTextureAttribute(gl, buffers, programInfo);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

	gl.useProgram(programInfo.program);

	gl.uniformMatrix4fv(
		programInfo.uniformLocations.projectionMatrix,
		false,
		projectionMatrix,
	);
	gl.uniformMatrix4fv(
		programInfo.uniformLocations.modelViewMatrix,
		false,
		modelViewMatrix,
	);

	gl.activeTexture(gl.TEXTURE0);

	gl.bindTexture(gl.TEXTURE_2D, texture);

	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

	{
		const type = gl.UNSIGNED_SHORT;
		const offset = 0;
		gl.drawElements(
			gl.TRIANGLES,
			vertexCount,
			type,
			offset,
		);
	}
}

function setPositionAttribute(gl, buffers, programInfo) {
	const numComponents = 3;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexPosition,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	gl.enableVertexAttribArray(
		programInfo.attribLocations.vertexPosition,
	);
}

function setTextureAttribute(gl, buffers, programInfo) {
	const num = 2;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
	gl.vertexAttribPointer(
		programInfo.attribLocations.textureCoord,
		num,
		type,
		normalize,
		stride,
		offset,
	);
	gl.enableVertexAttribArray(
		programInfo.attribLocations.textureCoord,
	);
}

export { renderObject };
