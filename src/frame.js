function frame() {
	// set canvas size
	// canvas.width = document.body.clientWidth;
	// canvas.height = document.body.clientHeight;
	// clear screen
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var lenPerRow = 6;
	triangleVerticies = new Float32Array([
		0.3, 0.5, -0.5, 1, 1, 0, -0.5, 0, 0, 1, 1, 0, 0.3, -0.5, 0.5, 1,
		1, 0, -0.3, 0.5, 0.5, 1, 0, 1, 0.5, 0, 0, 1, 0, 1, -0.3, -0.5,
		-0.5, 1, 0, 1,
	]);

	i++;

	var triangleVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, triangleVerticies, gl.STATIC_DRAW);

	const positionAttribLocation = gl.getAttribLocation(program, "vertPos");
	const colorAttribLocation = gl.getAttribLocation(program, "vertColor");

	gl.vertexAttribPointer(
		positionAttribLocation,
		3,
		gl.FLOAT,
		gl.FALSE,
		lenPerRow * Float32Array.BYTES_PER_ELEMENT,
		0
	);
	gl.vertexAttribPointer(
		colorAttribLocation,
		3,
		gl.FLOAT,
		gl.FALSE,
		lenPerRow * Float32Array.BYTES_PER_ELEMENT,
		3 * Float32Array.BYTES_PER_ELEMENT
	);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(colorAttribLocation);

	gl.drawArrays(gl.TRIANGLES, 0, triangleVerticies.length / lenPerRow);

	// loop
	requestAnimationFrame(frame);
}
