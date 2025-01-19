// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    // gl_PointSize = 30.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
    if (!gl) {
      console.log('Failed to get the rendering context for WebGL');
      return;
    }
}
function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
      console.log('Failed to intialize shaders.');
      return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
      console.log('Failed to get the storage location of a_Position');
      return;
    }
    
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
      console.log('Failed to get the storage location of u_FragColor');
      return;
    }
    
    // Get the storage location of u_FragColor
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }

   
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;

// Set up actions for the HTML UI elements
function addActionsForHtmlUI() {
    // Button Events (Shape Type)
    document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; };
    document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0]; };
    document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes();};
    
    document.getElementById('pointButton').onclick = function() {g_selectedType=POINT};
    document.getElementById('triButton').onclick = function() {g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick = function() {g_selectedType=CIRCLE};

    // draw cat:
    document.getElementById('drawCatButton').onclick = function() { drawCat(); };

    
    // Color Slider Events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
    
    // Size slider events
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });
    
    
    document.getElementById('segmentSlide').addEventListener('mouseup', function() { Circle.prototype.segments = this.value; });
    

}

function main() {
    // Set up canvas and gl variables
    setupWebGL();
    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    // Set up actions for the HTML UI elements
    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    // canvas.onmousemove = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } }
    

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}


var g_shapesList = [];

function click(ev) {
  
    // Extract the event click and return it in WebGL coordinates
    let [x,y] = convertCoordinatesEventToGL(ev);
    
    // Create and store the new point
    let point;
    if (g_selectedType==POINT) {
        point = new Point();
    } else if (g_selectedType==TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
    }
    point.position=[x,y];
    point.color=g_selectedColor.slice();
    point.size=g_selectedSize;
    g_shapesList.push(point);
    
    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();

  
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    
    return([x,y]);
}

// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
        
    // Check the time at the start of this function
    var startTime = performance.now();
        
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
        
    // Draw each shape in the list
    // var len = g_points.length;
    var len = g_shapesList.length;
        
    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
    
    // Check the time at the end of the function, and show on web page
    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration)/10, "numdot");
}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;

}

// Draw picture of cat
function drawCat() {
    //console.log("Draw cat button clicked!");
    const catTriangles = [
        
        // Body
        {coords: [-0.3, 0.1, -0.3, -0.7, 0.3, 0.1], color: [1.0, 0.7, 0.4, 1.0] },
        {coords: [0.3, 0.1, 0.3, -0.7, -0.3, -0.7], color: [1.0, 0.7, 0.4, 1.0] },
        
        
        // Head coordinates
        {coords: [-0.4, 0.7, 0.4, 0.7, 0.0, 0.2], color: [0.9, 0.5, 0.0, 1.0] },
        {coords: [-0.4, 0.2, -0.4, 0.7, 0.0, 0.2], color: [0.9, 0.5, 0.0, 1.0] },
        {coords: [0.4, 0.2, 0.4, 0.7, 0.0, 0.2], color: [0.9, 0.5, 0.0, 1.0] },
        {coords: [-0.4, 0.2, 0.4, 0.2, 0.0, 0.0], color: [0.9, 0.5, 0.0, 1.0] },

        // Ears
        {coords: [-0.4, 0.7, -0.4, 0.9, -0.2, 0.7], color: [1.0, 0.7, 0.4, 1.0] },
        {coords: [0.4, 0.7, 0.4, 0.9, 0.2, 0.7], color: [1.0, 0.7, 0.4, 1.0] },
        
        // Arms
        {coords: [-0.2, -0.2, -0.2, -0.4, -0.1, -0.4], color: [0.9, 0.5, 0.1, 1.0] },
        {coords: [-0.2, -0.2, -0.1, -0.4, -0.1, -0.2], color: [0.9, 0.5, 0.1, 1.0] },
        
        {coords: [0.2, -0.2, 0.2, -0.4, 0.1, -0.2], color: [0.9, 0.5, 0.1, 1.0] },
        {coords: [0.1, -0.2, 0.1, -0.4, 0.2, -0.4], color: [0.9, 0.5, 0.1, 1.0] },
        
        {coords: [-0.2, -0.4, -0.1, -0.4, -0.15, -0.45], color: [0.8, 0.4, 0.0, 1.0] },
        {coords: [0.2, -0.4, 0.1, -0.4, 0.15, -0.45], color: [0.8, 0.4, 0.0, 1.0] },
        
        // Legs
        {coords: [-0.3, -0.7, -0.1, -0.7, -0.2, -0.8], color: [0.9, 0.5, 0.1, 1.0] },
        {coords: [-0.1, -0.7, -0.1, -0.8, -0.2, -0.8], color: [0.9, 0.5, 0.1, 1.0] },
        {coords: [-0.1, -0.7, -0.1, -0.8, 0.0, -0.7], color: [0.9, 0.5, 0.1, 1.0] },
        
        {coords: [0.0, -0.7, 0.2, -0.7, 0.1, -0.8], color: [0.9, 0.5, 0.1, 1.0] },
        {coords: [0.1, -0.8, 0.2, -0.8, 0.2, -0.7], color: [0.9, 0.5, 0.1, 1.0] },
        {coords: [0.2, -0.7, 0.2, -0.8, 0.3, -0.7], color: [0.9, 0.5, 0.1, 1.0] },
        
        // Tail
        {coords: [0.3, -0.7, 0.4, -0.7, 0.7, -0.1], color: [0.9, 0.5, 0.1, 1.0] },
        
        // Face
        
        // Mask
        {coords: [0.0, 0.4, -0.4, 0.7, 0.4, 0.7], color: [1.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, 0.4, 0.2, 0.4, 0.7], color: [1.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, -0.4, 0.2, -0.4, 0.7], color: [1.0, 0.0, 0.0, 1.0] },
        
        // Webs on mask
        {coords: [0.0, 0.4, -0.025, 0.7, 0.025, 0.7], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, -0.225, 0.7, -0.175, 0.7], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, 0.225, 0.7, 0.175, 0.7], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, 0.4, 0.275, 0.4, 0.325], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, -0.4, 0.275, -0.4, 0.325], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, 0.4, 0.475, 0.4, 0.525], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, -0.4, 0.475, -0.4, 0.525], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, 0.4, 0.675, 0.4, 0.7], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.4, -0.4, 0.675, -0.4, 0.7], color: [0.0, 0.0, 0.0, 1.0] },
        
        {coords: [0.0, 0.575, -0.15, 0.6, 0.15, 0.6], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.675, -0.2, 0.69, 0.2, 0.69], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [0.0, 0.475, -0.075, 0.5, 0.075, 0.5], color: [0.0, 0.0, 0.0, 1.0] },
        
        {coords: [0.06, 0.46, 0.05, 0.5, 0.1, 0.43], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [-0.06, 0.46, -0.05, 0.5, -0.1, 0.43], color: [0.0, 0.0, 0.0, 1.0] },
        
        {coords: [0.14, 0.6, 0.2, 0.52, 0.3, 0.46], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [-0.14, 0.6, -0.2, 0.52, -0.3, 0.46], color: [0.0, 0.0, 0.0, 1.0] },
        
        {coords: [0.2, 0.7, 0.4, 0.51, 0.27, 0.6], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [-0.2, 0.7, -0.4, 0.51, -0.27, 0.6], color: [0.0, 0.0, 0.0, 1.0] },
        
        {coords: [0.3, 0.3, 0.3, 0.46, 0.28, 0.39], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [-0.3, 0.3, -0.3, 0.46, -0.28, 0.39], color: [0.0, 0.0, 0.0, 1.0] },
        
        {coords: [0.39, 0.28, 0.39, 0.52, 0.37, 0.4], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [-0.39, 0.28, -0.39, 0.52, -0.37, 0.4], color: [0.0, 0.0, 0.0, 1.0] },
        
        // Eye Outline
        {coords: [0.05, 0.36, 0.23, 0.36, 0.23, 0.56], color: [0.0, 0.0, 0.0, 1.0] },
        {coords: [-0.05, 0.36, -0.23, 0.36, -0.23, 0.56], color: [0.0, 0.0, 0.0, 1.0] },
        
        // Eyes
        {coords: [0.2, 0.4, 0.2, 0.5, 0.1, 0.4], color: [1.0, 1.0, 1.0, 1.0] },
        {coords: [-0.2, 0.4, -0.2, 0.5, -0.1, 0.4], color: [1.0, 1.0, 1.0, 1.0] },
        
        // Mouth
        {coords: [-0.1, 0.2, 0.1, 0.2, 0.0, 0.3], color: [0.0, 0.0, 0.0, 1.0] },
        // Nose
        {coords: [-0.05, 0.35, 0.05, 0.35, 0.0, 0.3], color: [1.0, 0.8, 0.9, 1.0] },

        
    ];
    // render each triangle
    catTriangles.forEach(function(triangle) {
        // Set the color
        const rgba = triangle.color;
        gl.uniform4f(u_FragColor,rgba[0], rgba[1], rgba[2], rgba[3]);
        
        drawTriangle(triangle.coords);
    });
}
