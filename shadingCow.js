// Global variables
var canvas;
var gl;
var staticProgram;


var iBuffer;
var vBuffer;
var vPosition;
var vColor;
var cowColor = vec4(1, 0.5, 0.5, 1);
var cowVertices = get_vertices();
let cowFaces = get_faces();

cowFaces = flatten(cowFaces).map(function (element) {
    return element - 1;
});
var cowX = 0;
var cowY = 0;
var cowZ = 0;
var initialCowX = 0;
var initialCowY = 0;
var initialCowZ = 0;

var rotationX = 0;
var rotationY = 0;
var rotationZ = 0;
var isRightMouseBtnPressed = false;
var toggleRightMouseBtn = false;



var MVP;
var MVPlocation;
var cam_pos;
var cow_pos;
var cow_initial_pos;
var viewMatrix;
var fov;
var projectionMatrix;
var projectionMatrixLoc;
var modelmatrix;



var pointLightProgram;
var pointLightPos;
var pointLightVBuffer;
var pointLightIBuffer;
var pointLightVPosition;
var pointLightVertices = getPointLightVertices();
var pointLightIndices = getPointLightIndices();
// pointLightIndices = flatten(pointLightIndices).map(function (element) {
//     return element - 1;
// });
var pointLightMVPlocation;
var pointLightMVP = mat4(1, 0, 0, 0,
                        0, 1, 0, 0,
                        0, 0, 1, 0,
                        0, 0, 0, 1);
var pointLightVColor;
var pointLightColor = vec4(0, 0, 0, 1);

function resetCow() {
    cowX = initialCowX;
    cowY = initialCowY;
    cowZ = initialCowZ;

    rotationX = 0;
    rotationY = 0;
    rotationZ = 0;

    render();
}

document.oncontextmenu = (event) => {
    event.preventDefault();
};

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" ); 
    gl = WebGLUtils.setupWebGL( canvas );
    if( !gl ) { alert( "WebGL is not available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );


    canvas.addEventListener("mousemove", function(event) {
        if (event.buttons === 2) { 
            rotationY += event.movementX; 
            rotationX += event.movementY; 
            render();
        }
    });

    
    document.addEventListener("keydown", function(event) {
        if (event.key === "ArrowLeft") {
            rotationZ += 6; 
            render();
        } else if (event.key === "ArrowRight") {
            rotationZ -= 6; 
            render();
        } else if (event.key === "r" || event.key === "R") {
            resetCow(); 
        }
    });

    
    canvas.addEventListener("mousemove", function(event) {
        if (event.buttons === 1) { 
            cowX += event.movementX/50; 
            cowY -= event.movementY/50; 
            render();
        }
    });


    document.addEventListener("keydown", function(event) {
        if (event.key === "ArrowUp") {
            cowZ += 1; 
            render();
        } else if (event.key === "ArrowDown") {
                    cowZ -= 1; 
                    render();
                }
    });

    gl.enable(gl.DEPTH_TEST);

    // initShaders
    staticProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    pointLightProgram = initShaders( gl, "vertex-shader", "fragment-shader" );

    // Static program buffer
    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cowVertices), gl.STATIC_DRAW); 
    vPosition = gl.getAttribLocation( staticProgram, "vPosition" ); 
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 ); 
    gl.enableVertexAttribArray( vPosition );
    vColor = gl.getUniformLocation(staticProgram, "vColor");
    MVPlocation = gl.getUniformLocation(staticProgram, "MVP");

    iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cowFaces), gl.STATIC_DRAW);

    // pointLight program buffer
    pointLightVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointLightVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointLightVertices), gl.STATIC_DRAW);
    pointLightVPosition = gl.getAttribLocation( pointLightProgram, "vPosition");
    gl.vertexAttribPointer( pointLightVPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pointLightVPosition);
    pointLightVColor = gl.getUniformLocation(pointLightProgram, "vColor");
    pointLightMVPlocation = gl.getUniformLocation(pointLightProgram, "MVP");


    pointLightIBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pointLightIBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pointLightIndices), gl.STATIC_DRAW);


	render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor( 0, 0, 0, 0.5 );
    

    // staticProgram stuff
    gl.useProgram(staticProgram);
    gl.enableVertexAttribArray(vPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(vColor, cowColor);

    // Cow math
    cam_pos = vec3(0, 0, 30);
    cow_pos = vec3(cowX, cowY, cowZ);
    cow_initial_pos = vec3(0, 0, 0)
    fov = 30;

    viewMatrix = lookAt(cam_pos, cow_initial_pos, vec3([0, 1, 0]));
    
    projectionMatrix = perspective(fov, canvas.width / canvas.height, 0.1, 100.0);

    modelmatrix = mat4(
        1, 0, 0, cowX,
        0, 1, 0, cowY,
        0, 0, 1, cowZ,
        0, 0, 0, 1
    );
    modelmatrix = mult(mult(rotate(rotationX, [1, 0, 0]), rotate(rotationY, [0, 1, 0])), rotate(rotationZ, [0, 0, 1]));
    modelmatrix = mult(modelmatrix, translate(cowX, cowY, cowZ));

    MVP = mat4();
    MVP = mult(mult(projectionMatrix, viewMatrix), modelmatrix);

    gl.uniformMatrix4fv(MVPlocation, false, flatten(MVP)); // send MVP to html
    gl.drawElements(gl.TRIANGLES, cowFaces.length, gl.UNSIGNED_SHORT, 0);
    
    // pointLightProgram stuff
    gl.useProgram(pointLightProgram);
    gl.enableVertexAttribArray(pointLightVPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointLightVBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pointLightIBuffer);
    gl.vertexAttribPointer( pointLightVPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(pointLightVColor, pointLightColor);

    gl.uniformMatrix4fv(pointLightMVPlocation, false, flatten(pointLightMVP));

    gl.drawElements(gl.LINES, pointLightIndices.length, gl.UNSIGNED_SHORT, 0);

}

function getPointLightVertices(){
    let vertices = [
        -1, -1, -1,
         1, -1, -1,
         1,  1, -1,
        -1,  1, -1,
        -1, -1,  1,
         1, -1,  1,
         1,  1,  1,
        -1,  1,  1,
    ];
    
    return vertices.map(e => {
        return e/4
    });
}

function getPointLightIndices(){
    return [
        0, 1,
        1, 2,
        2, 3,
        3, 0,
        4, 5,
        5, 6,
        6, 7,
        7, 4,
        0, 4,
        1, 5,
        2, 6,
        3, 7,
    ];
}