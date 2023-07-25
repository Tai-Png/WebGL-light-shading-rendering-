// Global variables
var canvas;
var gl;

var isRightMouseBtnPressed = false;
var toggleRightMouseBtn = false;

var cam_pos;
var fov = 40;
var modelmatrix;
var viewMatrix;
var projectionMatrix;
var worldInverseTransposeLocation;

var vao;
var cowProgram;
var cowIBuffer;
var cowVBuffer;
var cowVPosition;
var cowVColor;
var cowColor = vec4(1, 0.5, 0.5, 1);
var cowVertices = get_vertices();
var cowFaces = get_faces();
cowFaces = flatten(cowFaces).map(function (element) {
    return element - 1;
});
var cowFaces2 = get_faces();
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
var normalLocation;
var cow_pos;
var cow_initial_pos = vec3(0, 0, 0);

var cowNormals;
var normalBuffer;

var pointLight_initial_pos = vec3(8, 5, 5);
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
var autoRotatePointLight = true;
var t = (Math.PI)/3;
var r = 10;


var reverseLightDirectionLocation;
var lightWorldPositionLocation;
var worldLocation;

document.oncontextmenu = (event) => {
    event.preventDefault();
};
// ------------------------------------ INIT ---------------------------------------
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

    document.addEventListener("keydown", function(event) {
        if (event.key === "p" || event.key === "P") {
            autoRotatePointLight = !autoRotatePointLight;   
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

    // initShaders
    cowProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    pointLightProgram = initShaders( gl, "vertex-shader", "fragment-shader" );

    // Attribute locations
    cowVPosition = gl.getAttribLocation( cowProgram, "vPosition" );
    normalLocation = gl.getAttribLocation(cowProgram, "a_normal");
    pointLightVPosition = gl.getAttribLocation( pointLightProgram, "vPosition");
    // Uniform locations
    cowMVPlocation = gl.getUniformLocation(cowProgram, "MVP");
    cowVColor = gl.getUniformLocation(cowProgram, "vColor");
    lightWorldPositionLocation = gl.getUniformLocation(cowProgram, "u_lightWorldPosition");
    worldInverseTransposeLocation = gl.getUniformLocation(cowProgram, "u_worldInverseTranspose");
    worldLocation = gl.getUniformLocation(cowProgram, "u_world");
    pointLightVColor = gl.getUniformLocation(pointLightProgram, "vColor");
    pointLightMVPlocation = gl.getUniformLocation(pointLightProgram, "MVP");

    // Enable attribArrays
    gl.enableVertexAttribArray( cowVPosition );
    gl.enableVertexAttribArray(normalLocation);
    gl.enableVertexAttribArray(pointLightVPosition);

    // Create buffer
    cowVBuffer = gl.createBuffer();
    cowIBuffer = gl.createBuffer();
    normalBuffer = gl.createBuffer();
    pointLightVBuffer = gl.createBuffer();
    pointLightIBuffer = gl.createBuffer();

    // Populate Cow buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cowVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(cowVertices), gl.STATIC_DRAW); 
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cowIBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cowFaces), gl.STATIC_DRAW);

    // Populate normal buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    cowNormals = calculateNormals();
    gl.bufferData(gl.ARRAY_BUFFER, cowNormals, gl.STATIC_DRAW);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    
    // Populate pointLight buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, pointLightVBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointLightVertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pointLightIBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pointLightIndices), gl.STATIC_DRAW);

    setInterval(rotateCube, 100);

	render();
}
// ------------------------------------ RENDER ---------------------------------------
function render() {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);    
    gl.cullFace(gl.BACK);  
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearColor( 0, 0, 0, 0.5 );

    drawCow();
    drawPointLight();
}

function rotateCube(){
    if(autoRotatePointLight) {
        pointlightZ = r * Math.cos(t);
        pointLightX = r * Math.sin(t);
        t += 0.1;
        render();    
    }
    
}

function calculateNormals() {
    cowNormals = Array(cowVertices.length);
    cowFaces2.forEach((e) => {
        let v1 = normalize(subtract(cowVertices[e[0]-1],cowVertices[e[1]-1]));
        let v2 = normalize(subtract(cowVertices[e[0]-1],cowVertices[e[2]-1]));
        let norm = normalize(cross(v1,v2));
        for(let i = 0; i < 3; i++) {
            if (cowNormals[e[i]]){
                cowNormals[e[i]] = add(cowNormals[e[i]-1],norm).map(z=>z/2);
            }else{
                cowNormals[e[i]-1] = vec3(...norm);
            }
        }
    });
    cowNormals = flatten(cowNormals);
    return cowNormals;
}

function drawCow() {
    // cowProgram stuff
    gl.useProgram(cowProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, cowVBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cowIBuffer);
    gl.vertexAttribPointer(cowVPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(lightWorldPositionLocation, normalize([8, 5, 5]));
    gl.uniform4fv(cowVColor, cowColor);

    // Cow math
    cam_pos = vec3(0, 0, 30);
    cow_pos = vec3(cowX, cowY, cowZ);

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
    var worldInverseMatrix = inverse(modelmatrix);
    var worldInverseTransposeMatrix = transpose(worldInverseMatrix);
    
    gl.uniformMatrix4fv(worldLocation, false, flatten(modelmatrix));
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, flatten(worldInverseTransposeMatrix)); // send modelmatrix to u_world in html file
    

    cowMVP = mat4();
    cowMVP = mult(mult(projectionMatrix, viewMatrix), modelmatrix);

    gl.uniformMatrix4fv(cowMVPlocation, false, flatten(cowMVP)); // send cowMVP to html
    gl.drawElements(gl.TRIANGLES, cowFaces.length, gl.UNSIGNED_SHORT, 0);
}

function drawPointLight(){
    // pointLightProgram stuff
    gl.useProgram(pointLightProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointLightVBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pointLightIBuffer);
    gl.vertexAttribPointer( pointLightVPosition, 3, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(pointLightVColor, pointLightColor);

    // pointLight math
    cam_pos = vec3(0, 0, 30);
    pointLightPos = vec3(pointLightX, pointLightY, pointlightZ);

    viewMatrix = lookAt(cam_pos, cow_initial_pos, vec3([0, 1, 0]));
    
    projectionMatrix = perspective(fov, canvas.width / canvas.height, 0.1, 100.0);

    modelmatrix = mat4(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
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
function resetCow() {
    cowX = initialCowX;
    cowY = initialCowY;
    cowZ = initialCowZ;

    cowRotationX = 0;
    cowRotationY = 0;
    cowRotationZ = 0;

    render();
}