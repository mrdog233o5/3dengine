function drawScene(gl, programInfo, buffers, texture, cubeRotation) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
		[-0.0, 0.0, -6.0],
	);
	mat4.rotate(
		modelViewMatrix,
		modelViewMatrix,
		cubeRotation,
		[0, 0, 1],
	);
	mat4.rotate(
		modelViewMatrix,
		modelViewMatrix,
		cubeRotation * 0.7,
		[0, 1, 0],
	);
	mat4.rotate(
		modelViewMatrix,
		modelViewMatrix,
		cubeRotation * 0.3,
		[1, 0, 0],
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

	// Tell WebGL we want to affect texture unit 0
	gl.activeTexture(gl.TEXTURE0);

	// Bind the texture to texture unit 0
	gl.bindTexture(gl.TEXTURE_2D, texture);

	// Tell the shader we bound the texture to texture unit 0
	gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

	{
		const vertexCount = 3*12;
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

function setColorAttribute(gl, buffers, programInfo) {
	const numComponents = 4;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
	gl.vertexAttribPointer(
		programInfo.attribLocations.vertexColor,
		numComponents,
		type,
		normalize,
		stride,
		offset,
	);
	gl.enableVertexAttribArray(
		programInfo.attribLocations.vertexColor,
	);
}

// tell webgl how to pull out the texture coordinates from buffer
function setTextureAttribute(gl, buffers, programInfo) {
	const num = 2; // every coordinate composed of 2 values
	const type = gl.FLOAT; // the data in the buffer is 32-bit float
	const normalize = false; // don't normalize
	const stride = 0; // how many bytes to get from one set to the next
	const offset = 0; // how many bytes inside the buffer to start from
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

export { drawScene };
