// Global variables
var canvas;
var gl;
var staticProgram;
var cowVertices = get_vertices();
let cowFaces = get_faces();

cowFaces = flatten(cowFaces).map(function (element) {
    return element - 1;
});

var fudgeLocation
var fudgeFactor

var MVP;
var MVPlocation;





window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" ); // Looking up the canvas element
    // Canvases just like Images have 2 sizes. The number of pixels actually in them and separately the size they are displayed. CSS determines the size the canvas is displayed. You should always set the size you want a canvas to be with CSS since it is far far more flexible than any other method.
    gl = WebGLUtils.setupWebGL( canvas ); // Prof provided code to setup WEBGLcontext easier
    if( !gl ) { alert( "WebGL is not available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height ); // We need to tell WebGL how to convert from the clip space values we'll be setting gl_Position to back into pixels, often called screen space. To do this we call gl.viewport and pass it the current size of the canvas. // This tells WebGL the -1 +1 clip space maps to 0 <-> gl.canvas.width for x and 0 <-> gl.canvas.height for y.







    // initShaders for programs
    staticProgram = initShaders( gl, "vertex-shader", "fragment-shader" ); // Provided code from prof which creates shaders, uploads the GLSL source and compiles the shader. It also links the 2 shaders into a program and then creates the program 
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram( staticProgram );

    // Attributes get their data from buffers so we need to Create a buffer
    let iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cowFaces), gl.STATIC_DRAW); // Now we can put data in that buffer by referencing it through the bind point // The last argument, gl.STATIC_DRAW is a hint to WebGL about how we'll use the data. WebGL can try to use that hint to optimize certain things. gl.STATIC_DRAW tells WebGL we are not likely to change this data much.

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cowVertices), gl.STATIC_DRAW); // Now we can put data in that buffer by referencing it through the bind point // cowVertices is a JavaScript array. WebGL needs strongly typed data so the flatten creates a new array of floating point numbers and copies the values from cowVertices. gl.bufferData then copies that data to the vBuffer on the GPU. It's using the v buffer because we bound it to the ARRAY_BUFFER bind point above.


    let vPosition = gl.getAttribLocation( staticProgram, "vPosition" ); // Getting vPosition attribute location in the HTML
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 ); // The 4 means that there is 4 components per iteration (i only see 1 right now, where the other 4) vec4 is a 4 float value. In JavaScript you could think of it something like a_position = {x: 0, y: 0, z: 0, w: 0}. In the internet exaple they set size = 2. Attributes default to 0, 0, 0, 1 so this attribute will get its first 2 values (x and y) from our buffer. The z, and w will be the default 0 and 1 respectively.
    gl.enableVertexAttribArray( vPosition );
    // fudgeLocation = gl.getUniformLocation(staticProgram, "u_fudgeFactor");
    // fudgeFactor = 1;

    MVPlocation = gl.getUniformLocation(staticProgram, "MVP");

    

    

	// gl.enableVertexAttribArray( vPosition ); // we need to tell WebGL how to take data from the buffer we setup above and supply it to the attribute in the shader. First off we need to turn the attribute on



    


	render();
    // The code up to this point is initialization code. Code that gets run once when we load the page. The code below this point is rendering code or code that should get executed each time we want to render/draw.
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor( 0.1, 0.1, 0.1, 1.0 );
    gl.useProgram(staticProgram);

    

    // Set the fudgeFactor
    // gl.uniform1f(fudgeLocation, fudgeFactor);
    let cam_pos = vec3(0, 0, 30);
    let cow_pos = vec3(0, 0, 0);
    
    let viewMatrix = lookAt(cam_pos, cow_pos, vec3([0, 1, 0]));

    let fov = 20;
    let projectionMatrix = perspective(fov, canvas.width / canvas.height, 0.1, 100.0);

    let modelmatrix = mat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);

    let MVP = mat4();
    MVP = mult(mult(projectionMatrix, viewMatrix), modelmatrix);

    gl.uniformMatrix4fv(MVPlocation, false, flatten(MVP));

    gl.drawElements(gl.TRIANGLES, cowVertices.length, gl.UNSIGNED_SHORT, 0);
}


// ----------- THIS IS NOT FOR THIS ASSIGNMENT THIS IS JUST FOR YOU TO UNDERSTAND----

// var primitiveType = gl.TRIANGLES;
// var offset = 0;
// var count = 3;
// gl.drawArrays(primitiveType, offset, count);

// Because the count is 3 this will execute our vertex shader 3 times. The first time a_position.x and a_position.y in our vertex shader attribute will be set to the first 2 values from the positionBuffer. The second time a_position.x and a_position.y will be set to the second 2 values. The last time they will be set to the last 2 values.

// Because we set primitiveType to gl.TRIANGLES, each time our vertex shader is run 3 times WebGL will draw a triangle based on the 3 values we set gl_Position to. No matter what size our canvas is those values are in clip space coordinates that go from -1 to 1 in each direction.

// Because our vertex shader is simply copying our positionBuffer values to gl_Position the triangle will be drawn at clip space coordinates

//   0, 0,
//   0, 0.5,
//   0.7, 0,
// Converting from clip space to screen space if the canvas size happened to be 400x300 we'd get something like this

//  clip space      screen space
//    0, 0       ->   200, 150
//    0, 0.5     ->   200, 225
//  0.7, 0       ->   340, 150

// WebGL will now render that triangle. For every pixel it is about to draw WebGL will call our fragment shader. Our fragment shader just sets gl_FragColor to 1, 0, 0.5, 1. Since the Canvas is an 8bit per channel canvas that means WebGL is going to write the values [255, 0, 127, 255] into the canvas.