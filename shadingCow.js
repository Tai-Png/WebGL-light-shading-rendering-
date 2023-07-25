// Global variables
var canvas;
var gl;

var isRightMouseBtnPressed = false;
var toggleRightMouseBtn = false;

var cam_pos;
var fov;
var modelmatrix;
var viewMatrix;
var projectionMatrix;


var cowProgram;
var cowIBuffer;
var cowVBuffer;
var cowVPosition;
var cowVColor;
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
var cowRotationX = 0;
var cowRotationY = 0;
var cowRotationZ = 0;
var cowMVP;
var cowMVPlocation;
var cow_pos;
var cow_initial_pos = vec3(0, 0, 0);
function resetCow() {
    cowX = initialCowX;
    cowY = initialCowY;
    cowZ = initialCowZ;

    cowRotationX = 0;
    cowRotationY = 0;
    cowRotationZ = 0;

    render();
}


var pointLightX = 8;
var pointLightY = 5;
var pointlightZ = 5;
var pointLightRotationX = 0;
var pointLightRotationY = 0;
var pointLightRotationZ = 0;
var pointLightProgram;
var pointLightPos;
var pointLightVBuffer;
var pointLightIBuffer;
var pointLightVPosition;
var pointLightVertices = getPointLightVertices();
var pointLightIndices = getPointLightIndices();
var pointLightMVPlocation;
var pointLightMVP;
var pointLightVColor;
var pointLightColor = vec4(0, 0, 1, 1);


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
            cowRotationY += event.movementX; 
            cowRotationX += event.movementY; 
            render();
        }
    });

    
    document.addEventListener("keydown", function(event) {
        if (event.key === "ArrowLeft") {
            cowRotationZ += 6; 
            render();
        } else if (event.key === "ArrowRight") {
            cowRotationZ -= 6; 
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
    cowProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    pointLightProgram = initShaders( gl, "vertex-shader", "fragment-shader" );

    // Cow program buffer
    cowVBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cowVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cowVertices), gl.STATIC_DRAW); 
    cowVPosition = gl.getAttribLocation( cowProgram, "vPosition" ); 
    gl.vertexAttribPointer( cowVPosition, 3, gl.FLOAT, false, 0, 0 ); 
    gl.enableVertexAttribArray( cowVPosition );
    cowVColor = gl.getUniformLocation(cowProgram, "vColor");
    cowMVPlocation = gl.getUniformLocation(cowProgram, "MVP");

    cowIBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cowIBuffer);
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

    drawCow();

    drawPointLight();
    

}

function drawCow() {
    // cowProgram stuff
    gl.useProgram(cowProgram);
    gl.enableVertexAttribArray(cowVPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, cowVBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cowIBuffer);
    gl.vertexAttribPointer(cowVPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(cowVColor, cowColor);

    // Cow math
    cam_pos = vec3(0, 0, 30);
    cow_pos = vec3(cowX, cowY, cowZ);
    fov = 30;

    viewMatrix = lookAt(cam_pos, cow_initial_pos, vec3([0, 1, 0]));
    
    projectionMatrix = perspective(fov, canvas.width / canvas.height, 0.1, 100.0);

    modelmatrix = mat4(
        1, 0, 0, cowX,
        0, 1, 0, cowY,
        0, 0, 1, cowZ,
        0, 0, 0, 1
    );
    modelmatrix = mult(mult(rotate(cowRotationX, [1, 0, 0]), rotate(cowRotationY, [0, 1, 0])), rotate(cowRotationZ, [0, 0, 1]));
    modelmatrix = mult(modelmatrix, translate(cowX, cowY, cowZ));

    cowMVP = mat4();
    cowMVP = mult(mult(projectionMatrix, viewMatrix), modelmatrix);

    gl.uniformMatrix4fv(cowMVPlocation, false, flatten(cowMVP)); // send cowMVP to html
    gl.drawElements(gl.TRIANGLES, cowFaces.length, gl.UNSIGNED_SHORT, 0);
}

function drawPointLight(){
    // pointLightProgram stuff
    gl.useProgram(pointLightProgram);
    gl.enableVertexAttribArray(pointLightVPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointLightVBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pointLightIBuffer);
    gl.vertexAttribPointer( pointLightVPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(pointLightVColor, pointLightColor);

    // pointLight math
    cam_pos = vec3(0, 0, 30);
    cow_pos = vec3(pointLightX, pointLightY, pointlightZ);
    pointLight_initial_pos = vec3(8, 5, 5);
    fov = 30;

    viewMatrix = lookAt(cam_pos, pointLight_initial_pos, vec3([0, 1, 0]));
    
    projectionMatrix = perspective(fov, canvas.width / canvas.height, 0.1, 100.0);

    modelmatrix = mat4(
        1, 0, 0, pointLightX,
        0, 1, 0, pointLightY,
        0, 0, 1, pointlightZ,
        0, 0, 0, 1
    );
    modelmatrix = mult(mult(rotate(pointLightRotationX, [1, 0, 0]), rotate(pointLightRotationY, [0, 1, 0])), rotate(pointLightRotationZ, [0, 0, 1]));
    modelmatrix = mult(modelmatrix, translate(pointLightX, pointLightY, pointlightZ));

    pointLightMVP = mat4();
    pointLightMVP = mult(mult(projectionMatrix, viewMatrix), modelmatrix);

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