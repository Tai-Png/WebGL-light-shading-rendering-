// Random code snippets from discord

modelViewMatrixLoc = gl.getUniformLocation( staticProgram, "modelViewMatrix");
projectionMatrixLoc = gl.getUniformLocation( staticProgram, "projectionMatrix");



projectionMatrix = perspective(fovy, aspect, near, far);

gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));





For each triangle, use the cross product to find the normal vector of the triangle, which is also the normal vector of the three vertices. If vertex p is used in m triangles, then the normal vector of vertex p should be normalize(n1+n2+n3+ ... .nm)


// Yeah I literally just copied this for my point light
// Same for the spot light tutorial from that website 
// You do need to convert the functions for our MV library, but it's not that bad

// Was a mix of this
// https://stackoverflow.com/questions/30594511/webgl-fragment-shader-for-multiple-light-sources
// And this
// https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-spot.html