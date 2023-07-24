// Random code snippets from discord
let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(faces),
    gl.STATIC_DRAW
  );


modelViewMatrixLoc = gl.getUniformLocation( staticProgram, "modelViewMatrix");
projectionMatrixLoc = gl.getUniformLocation( staticProgram, "projectionMatrix");

eye = vec3(0, 0, 3);
modelViewMatrix = lookAt(eye, at, up);
projectionMatrix = perspective(fovy, aspect, near, far);

gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));


gl.enable(gl.DEPTH_TEST);
gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);

gl.drawElements(gl.TRIANGLES, cowFaces.length, gl.UNSIGNED_SHORT, 0);

// double check how you are adding your indices to the Element buffer. i think 8 should use unsigned byte and 16 should be unsigned short (edited)

// Someone in the discord asked how the translation function in MV is used and this was the response
let worldMatrix = mat4();

  // Translate cow model
  worldMatrix = mult(
    worldMatrix,
    translate(modelTranslationX, modelTranslationY, modelTranslationZ)
  );

// Yeah I literally just copied this for my point light
// Same for the spot light tutorial from that website 
// You do need to convert the functions for our MV library, but it's not that bad

// Was a mix of this
// https://stackoverflow.com/questions/30594511/webgl-fragment-shader-for-multiple-light-sources
// And this
// https://webglfundamentals.org/webgl/lessons/webgl-3d-lighting-spot.html