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


var iBuffer;
var vBuffer;
var vPosition;

var MVP;
var MVPlocation;
var cam_pos;
var cow_pos;
var viewMatrix;
var fov;
var projectionMatrix;
var projectionMatrixLoc;
var modelmatrix;

var cowX = 0;
var cowY = 0;
var cowZ = 0;


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" ); 
    gl = WebGLUtils.setupWebGL( canvas );
    if( !gl ) { alert( "WebGL is not available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );

    // Event listener to handle mouse movement
    canvas.addEventListener("mousemove", function(event) {
        if (event.buttons === 1) { // Left mouse button is pressed
            cowX -= event.movementX / 100; // Adjust the translation speed as needed
            cowY += event.movementY / 100; // Invert Y direction for more intuitive movement
            render();
        }
    });

    // Event listener to handle keyboard input (up and down arrow keys)
    document.addEventListener("keydown", function(event) {
        if (event.key === "ArrowUp") {
            cowZ += 1; // Adjust the translation speed as needed
            render();
        } else if (event.key === "ArrowDown") {
                    cowZ -= 1; // Adjust the translation speed as needed
                    render();
                }
    });

    staticProgram = initShaders( gl, "vertex-shader", "fragment-shader" ); 
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram( staticProgram );

    iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cowFaces), gl.STATIC_DRAW);

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cowVertices), gl.STATIC_DRAW); // This puts all the vertices into the buffer


    vPosition = gl.getAttribLocation( staticProgram, "vPosition" ); 
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 ); // This means 3 things will be read in the buffer, namely (x, y, z)
    gl.enableVertexAttribArray( vPosition );

    MVPlocation = gl.getUniformLocation(staticProgram, "MVP");

	render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor( 0, 0, 0, 1 );
    gl.useProgram(staticProgram);

    cam_pos = vec3(0, 0, 30);
    cow_pos = vec3(cowX, cowY, cowZ);
    
    viewMatrix = lookAt(cam_pos, cow_pos, vec3([0, 1, 0]));

    fov = 30;
    projectionMatrix = perspective(fov, canvas.width / canvas.height, 0.1, 100.0);
    modelmatrix = mat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);

    MVP = mat4();
    MVP = mult(mult(projectionMatrix, viewMatrix), modelmatrix);

    gl.uniformMatrix4fv(MVPlocation, false, flatten(MVP));

    gl.drawElements(gl.TRIANGLES, cowFaces.length, gl.UNSIGNED_SHORT, 0);
}
