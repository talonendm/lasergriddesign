// lasergriddesign - talonen.dm 2025 -----------------------------
// ...............................................................
// note: error only in local server, not in online p5.js editor or when hosting
// ...............................................................
// Chrome is moving towards a new experience that allows users to choose to browse without third-party cookies.Understand this warningAI
// web-client-content-script.js:2 Uncaught (in promise) Error: Access to storage is not allowed from this context.Understand this errorAI
// ...............................................................
var gridSize;
let tolerance = 0.05; // Tolerance for connecting cutted pieces
let thicknessWithoutTolerance = 3; // millimetres
let thickness;
let gridSizeScale = 7; // Change this to adjust the grid size
let lines = [];
// let drawingBezier = false; // Flag for drawing Bezier curves

let ellipses = [];
let ellipseRadiusScale = 0.5; // Radius of the ellipse

let drawing = false;
let startX, startY;
let showgrid = true;
let use_strokeweight = 2; //0.3;
let use_laser_strokeweight = 1; //0.1;
let margin = 1; // millimetres
let w;
let h;
let showStartPoint = false;
let rx = 30;
let ry = 30;
let endX, endY;

let drawingBezier = false; // Flag for drawing Bezier curves
let bezierState = 0; // 0: Start/End points, 1: Control points
let startBx, startBy, endBX, endBY, controlX1, controlY1, controlX2, controlY2;
let beziers = [];
let snapcontrolpointstogrid = false;
let snappointstogrid = false;

let mx, my; // mouse coordinates

function setup() {

  thickness = thicknessWithoutTolerance + tolerance;
  gridSize = thickness * gridSizeScale;
  marginsize = margin * gridSizeScale;
  w = marginsize * 2 + rx * gridSize;
  h = marginsize * 2 + ry * gridSize;

  createCanvas(w, h, SVG); // Create SVG Canvas (40mm x 40mm)


  // createCanvas(windowWidth, windowHeight);

  // createCanvas(w, h);
  //createCanvas(800, 800, SVG);  // see: https://github.com/zenozeng/p5.js-svg?tab=readme-ov-file
  
  background(255);
  strokeWeight(use_strokeweight); // Set thin stroke
}

function draw() {
  background(255);
  if (showgrid) {
    drawGrid();
    strokeWeight(use_strokeweight);
  } else {
    strokeWeight(use_laser_strokeweight);
    noFill();
    rect(0, 0, w, h);
  }

  fill(255, 0, 0);
  if (snappointstogrid) {
    ellipse(snapToGrid(mouseX), snapToGrid(mouseY), 10, 10);
  }

  if (showStartPoint) {
    fill(0, 255, 0);
    ellipse(startX, startY, 8, 8);

    textSize(16);
    textAlign(LEFT, TOP);
    text(
      showToGridValue(startX) +
      "," +
      showToGridValue(startY) +
      " to " +
      showToGridValue(mouseX) +
      "," +
      showToGridValue(mouseY),
      10,
      10
    );

    let xd = -showToGridValue(startX) + showToGridValue(snapToGrid(mouseX));
    let yd = -showToGridValue(startY) + showToGridValue(snapToGrid(mouseY));

    text(xd + "," + yd, 10, 30);
  }

  if (showgrid) {
    fill(0, 0, 150);

    textSize(14);
    textAlign(LEFT, BOTTOM);
    text(
      showToGridValue(mouseX) + "," + showToGridValue(mouseY),
      margin,
      h - margin
    );

    textAlign(CENTER, TOP);

    if (drawingBezier) {
      text("Bezier: 4 mouse clicks. Ellipse e", w / 2, margin);
    } else {
      text("Line: drag and drop. Ellipse e", w / 2, margin);
    }

    let infotext = "";
    if (snapcontrolpointstogrid) {
      infotext = infotext + "control points to grid. ";
    } else {
      infotext = infotext + 'press c to turn on control point snapping.';
    }
    if (snappointstogrid) {
      infotext = infotext + "points to grid are snapped. ";
    } else {
      infotext = infotext + 'press C to turn on snapping.';
    }
    textAlign(CENTER, BOTTOM);
    text(infotext, w / 2, h - margin);

    textAlign(RIGHT, BOTTOM);
    text(rx + "," + ry, w - margin, h - margin);
  }

  // DRAW --------------------------------------------------------------------->

  if (showgrid) {
    strokeWeight(use_strokeweight);
  } else {
    strokeWeight(use_laser_strokeweight);
  }

  // Draw all saved lines
  for (let l of lines) {
    stroke(0);
    line(l.x1, l.y1, l.x2, l.y2);
  }

  // Draw all stored ellipses from the array
  for (let i = 0; i < ellipses.length; i++) {
    let e = ellipses[i];
    //fill(e.color); // Set the color of the ellipse
    noFill();
    stroke(0);
    //noStroke(); // No stroke for the ellipses
    ellipse(e.x, e.y, e.radius * 2, e.radius * 2); // Draw the ellipse
  }

  // Draw existing Bezier curves
  for (let bezierCurve of beziers) {
    noFill();
    stroke(0); // Use black stroke for curves
    bezier(
      bezierCurve.startBx,
      bezierCurve.startBy,
      bezierCurve.controlX1,
      bezierCurve.controlY1,
      bezierCurve.controlX2,
      bezierCurve.controlY2,
      bezierCurve.endBX,
      bezierCurve.endBY
    );
  }

  // Visual feedback for the current Bezier being drawn
  if (drawingBezier) {
    stroke(255, 0, 0); // Red for start/end points
    if (startBx && startBy) ellipse(startBx, startBy, 5, 5); // Start point
    if (endBX && endBY) ellipse(endBX, endBY, 5, 5); // End point
    stroke(0, 255, 0); // Green for control points
    if (controlX1 && controlY1) ellipse(controlX1, controlY1, 5, 5); // Control point 1
    if (controlX2 && controlY2) ellipse(controlX2, controlY2, 5, 5); // Control point 2

    noFill();
    stroke(0, 0, 255);

    if (bezierState === 0) {
      // Preview for start and end points only
      if (startBx && startBy && endBX && endBY) {
        if (!snapcontrolpointstogrid) {
          bezier(startBx, startBy, mouseX, mouseY, mouseX, mouseY, endBX, endBY);
        } else {
          bezier(startBx, startBy, snapToGrid(mouseX), snapToGrid(mouseY), snapToGrid(mouseX), snapToGrid(mouseY), endBX, endBY);
        }
        
      }
    } else if (bezierState === 1) {
      if (!controlX1 && !controlY1) {
        // Preview with mouse as the first control point
        // bezier(startBx, startBy, mouseX, mouseY, mouseX, mouseY, endBX, endBY);
        if (!snapcontrolpointstogrid) {
          bezier(startBx, startBy, mouseX, mouseY, mouseX, mouseY, endBX, endBY);
        } else {
          bezier(startBx, startBy, snapToGrid(mouseX), snapToGrid(mouseY), snapToGrid(mouseX), snapToGrid(mouseY), endBX, endBY);
        }
      } else if (!controlX2 && !controlY2) {
        // Preview with the second control point as the mouse
      
        if (!snapcontrolpointstogrid) {
          bezier(startBx, startBy, controlX1, controlY1, mouseX, mouseY, endBX, endBY);
        } else {
          bezier(startBx, startBy, controlX1, controlY1, snapToGrid(mouseX), snapToGrid(mouseY), endBX, endBY);
        }


      }
    }
    stroke(0);
  }

  // Preview line while drawing
  if (drawing & !drawingBezier) {
    stroke(0);
    if (snappointstogrid) {
      line(startX, startY, snapToGrid(mouseX), snapToGrid(mouseY));
    } else {
      line(startX, startY, (mouseX), (mouseY));
    }

  }
}
function resetBezierState() {
  // Reset Bezier state for new drawing
  startBx = startBy = endBX = endBY = controlX1 = controlY1 = controlX2 = controlY2 = null;
  bezierState = 0;
}
// Snap coordinates to grid
function snapToGrid(val) {
  return round(val / gridSize) * gridSize + marginsize;
}

function showToGridValue(val) {
  return round((val - marginsize) / gridSize);
}


function endlinepoint() {
if (snappointstogrid) {
  endX = snapToGrid(mouseX);
  endY = snapToGrid(mouseY);
  lines.push({ x1: startX, y1: startY, x2: endX, y2: endY });
} else {
  endX = (mouseX);
  endY = (mouseY);
  lines.push({ x1: startX, y1: startY, x2: mouseX, y2: mouseY });
}

drawing = false;
showStartPoint = false;
}


function selectLineStartPoint(fromPrevious) {

  if (fromPrevious) {
    startX = endX;
    startY = endY;
  } else {
    if (snappointstogrid) {
      startX = snapToGrid(mouseX);
      startY = snapToGrid(mouseY);
    } else {
      startX = (mouseX);
      startY = (mouseY);
    }
  }


  drawing = true;
  showStartPoint = true;
}


// Start drawing ------------
function mousePressed() {
  if (mouseButton === LEFT) {
    if (!drawingBezier) {
      selectLineStartPoint(fromPrevious = false);
    }

    if (drawingBezier && bezierState === 0) {
      // Set start and end points
      if (!startBx && !startBy) {
        if (snappointstogrid) {
          startBx = snapToGrid(mouseX);
          startBy = snapToGrid(mouseY);
        } else {
          startBx = mouseX;
          startBy = mouseY;
        }
      } else {
        if (snappointstogrid) {
          endBX = snapToGrid(mouseX);
          endBY = snapToGrid(mouseY);
        } else {
          endBX = mouseX;
          endBY = mouseY;
        }
        bezierState = 1; // Move to control point selection
      }
    } else if (drawingBezier && bezierState === 1) {
      // Set control points
      if (!controlX1 && !controlY1) {
        if (snapcontrolpointstogrid) {
          controlX1 = snapToGrid(mouseX); // No snapping for finer control
          controlY1 = snapToGrid(mouseY);
        } else {
          controlX1 = mouseX; // No snapping for finer control
          controlY1 = mouseY;
        }
      } else {
        if (snapcontrolpointstogrid) {
          controlX2 = snapToGrid(mouseX); // No snapping for finer control
          controlY2 = snapToGrid(mouseY);
        } else {
          controlX2 = mouseX;
          controlY2 = mouseY;
        }
        // Save the completed Bezier curve
        beziers.push({
          startBx,
          startBy,
          controlX1,
          controlY1,
          controlX2,
          controlY2,
          endBX,
          endBY,
        });
        resetBezierState(); // Reset for the next Bezier
      }
    }
  } else if (mouseButton === RIGHT) {
    removeNearestLine(mouseX, mouseY);
  }
}

function mouseReleased() {
  if (drawing & !drawingBezier) {
    endlinepoint();
  }
}
// MOUSE functions <---------------------------------------------------

// DRAW Functions ---------------------------------------------------

// Draw the grid ---------------------------------------------------
function drawGrid() {
  stroke(220);
  strokeWeight(0.5);
  for (let x = marginsize; x < width; x += gridSize) {
    line(x, 0, x, height);
  }
  for (let y = marginsize; y < height; y += gridSize) {
    line(0, y, width, y);
  }
}

// Handle key presses
function keyPressed() {
  if ((key === "q") | (key === "b") | (key === "l")) {
    drawingBezier = !drawingBezier; // Toggle Bezier mode
    if (!drawingBezier) resetBezierState(); // Reset if exiting Bezier mode
  }

  if (key === "e") {
    // Check if the "e" key was pressed
    // Store ellipse data into the array (position, radius, color)
    let newEllipse;
    if (snappointstogrid) {
      newEllipse = {
        x: snapToGrid(mouseX), // snap X position
        y: snapToGrid(mouseY), // snap Y position
        radius: ellipseRadiusScale * gridSize,
      };
    } else {
      newEllipse = {
        x: mouseX, //  X position
        y: mouseY, //  Y position
        radius: ellipseRadiusScale * gridSize,
      };
    }

    ellipses.push(newEllipse); // Add new ellipse to the array
  }

  if (key === "p") {
    if (drawing) {
      endlinepoint();
    } else {
      if (lines.length === 0) {
        selectLineStartPoint(fromPrevious = false);
      } else {
        selectLineStartPoint(fromPrevious = true);
      }
      
    }
    
  }

  if (key === "c") {
    snapcontrolpointstogrid = !snapcontrolpointstogrid;
  }
  if (key === "C") {
    snappointstogrid = !snappointstogrid;
  }

  if (key === "s") {
    let datetag = new Date().toISOString().replace(/[-:]/g, "").split('.')[0];  // Generate a timestamp
    saveCanvas("laser" + datetag, "svg");
  } else if (key === "S") {
    let datetag = new Date().toISOString().replace(/[-:]/g, "").split('.')[0];  // Generate a timestamp
    save("laser_" + datetag + ".svg");

  } else if (key === "z" || key === "Z" || key === "u") {
    undoLastLine();
  } else if (key == "g") {
    showgrid = !showgrid;
  } else if (key == "d") {
    removeNearestLine(mouseX, mouseY); // Remove the nearest line to the mouse position, or ellipse, or bezier
  }

  if (key === "1") {
    rx--;
  } else if (key === "2") {
    rx++;
  } else if (key === "3") {
    ry--;
  } else if (key === "4") {
    ry++;
  } else if ((key === "5") & (gridSizeScale > 2)) {
    gridSizeScale--;
    gridSize = thickness * gridSizeScale;

    for (let l of lines) {
      l.x1 =
        ((l.x1 - marginsize) * gridSize) / (thickness * (gridSizeScale + 1)) +
        marginsize;
      l.x2 =
        ((l.x2 - marginsize) * gridSize) / (thickness * (gridSizeScale + 1)) +
        marginsize;
      l.y1 =
        ((l.y1 - marginsize) * gridSize) / (thickness * (gridSizeScale + 1)) +
        marginsize;
      l.y2 =
        ((l.y2 - marginsize) * gridSize) / (thickness * (gridSizeScale + 1)) +
        marginsize;
    }

    for (let l of ellipses) {
      l.x =
        ((l.x - marginsize) * gridSize) / (thickness * (gridSizeScale + 1)) +
        marginsize;
      l.y =
        ((l.y - marginsize) * gridSize) / (thickness * (gridSizeScale + 1)) +
        marginsize;

      l.radius = ellipseRadiusScale * gridSize;
    }

    for (let bezierCurve of beziers) {
      bezierCurve.startBx =
        ((bezierCurve.startBx - marginsize) * gridSize) /
        (thickness * (gridSizeScale + 1)) +
        marginsize;

      bezierCurve.startBy =
        ((bezierCurve.startBy - marginsize) * gridSize) /
        (thickness * (gridSizeScale + 1)) +
        marginsize;

      bezierCurve.endBX =
        ((bezierCurve.endBX - marginsize) * gridSize) /
        (thickness * (gridSizeScale + 1)) +
        marginsize;

      bezierCurve.endBY =
        ((bezierCurve.endBY - marginsize) * gridSize) /
        (thickness * (gridSizeScale + 1)) +
        marginsize;

      bezierCurve.controlX1 =
        ((bezierCurve.controlX1 - marginsize) * gridSize) /
        (thickness * (gridSizeScale + 1)) +
        marginsize;

      bezierCurve.controlY1 =
        ((bezierCurve.controlY1 - marginsize) * gridSize) /
        (thickness * (gridSizeScale + 1)) +
        marginsize;

      bezierCurve.controlX2 =
        ((bezierCurve.controlX2 - marginsize) * gridSize) /
        (thickness * (gridSizeScale + 1)) +
        marginsize;

      bezierCurve.controlY2 =
        ((bezierCurve.controlY2 - marginsize) * gridSize) /
        (thickness * (gridSizeScale + 1)) +
        marginsize;
    }
  } else if (key === "6") {
    gridSizeScale++;
    gridSize = thickness * gridSizeScale;

    for (let l of lines) {
      l.x1 =
        ((l.x1 - marginsize) * gridSize) / (thickness * (gridSizeScale - 1)) +
        marginsize;
      l.x2 =
        ((l.x2 - marginsize) * gridSize) / (thickness * (gridSizeScale - 1)) +
        marginsize;
      l.y1 =
        ((l.y1 - marginsize) * gridSize) / (thickness * (gridSizeScale - 1)) +
        marginsize;
      l.y2 =
        ((l.y2 - marginsize) * gridSize) / (thickness * (gridSizeScale - 1)) +
        marginsize;
    }

    for (let l of ellipses) {
      l.x =
        ((l.x - marginsize) * gridSize) / (thickness * (gridSizeScale - 1)) +
        marginsize;
      l.y =
        ((l.y - marginsize) * gridSize) / (thickness * (gridSizeScale - 1)) +
        marginsize;

      l.radius = ellipseRadiusScale * gridSize;
    }

    // scale bezier curves
    for (let bezierCurve of beziers) {
      bezierCurve.startBx =
        ((bezierCurve.startBx - marginsize) * gridSize) /
        (thickness * (gridSizeScale - 1)) +
        marginsize;

      bezierCurve.startBy =
        ((bezierCurve.startBy - marginsize) * gridSize) /
        (thickness * (gridSizeScale - 1)) +
        marginsize;

      bezierCurve.endBX =
        ((bezierCurve.endBX - marginsize) * gridSize) /
        (thickness * (gridSizeScale - 1)) +
        marginsize;

      bezierCurve.endBY =
        ((bezierCurve.endBY - marginsize) * gridSize) /
        (thickness * (gridSizeScale - 1)) +
        marginsize;

      bezierCurve.controlX1 =
        ((bezierCurve.controlX1 - marginsize) * gridSize) /
        (thickness * (gridSizeScale - 1)) +
        marginsize;

      bezierCurve.controlY1 =
        ((bezierCurve.controlY1 - marginsize) * gridSize) /
        (thickness * (gridSizeScale - 1)) +
        marginsize;

      bezierCurve.controlX2 =
        ((bezierCurve.controlX2 - marginsize) * gridSize) /
        (thickness * (gridSizeScale - 1)) +
        marginsize;

      bezierCurve.controlY2 =
        ((bezierCurve.controlY2 - marginsize) * gridSize) /
        (thickness * (gridSizeScale - 1)) +
        marginsize;
    }
  }

  // grid size change or grid scale change
  if (
    (key == "1") | (key == "2") | (key == "3") | (key == "4") | (key == "5") ||
    key == "6"
  ) {


  // Manually clear the canvas before resizing
  //clear();  // Clear the canvas

    // Update canvas size
    w = marginsize * 2 + rx * gridSize;
    h = marginsize * 2 + ry * gridSize;
    //resizeCanvas(w, h, SVG); // Resize the canvas and keep SVG renderer active
    //redraw();


  // Create a new canvas with the new size
  //createCanvas(w, h, SVG); 

  }
}

// Undo last drawn line
function undoLastLine() {
  if (lines.length > 0) {
    lines.pop(); // Remove last drawn line
  }
}

// Remove the nearest line to the mouse position
function removeNearestLine(mx, my) {
  // Loop through the ellipses array to check if the mouse is inside any ellipse
  for (let i = ellipses.length - 1; i >= 0; i--) {
    let e = ellipses[i];
    // Check if the mouse is inside the ellipse
    let d = dist(mouseX, mouseY, e.x, e.y);
    if (d < e.radius) {
      // If the mouse is inside the ellipse
      ellipses.splice(i, 1); // Remove the ellipse from the array
      break; // Exit the loop after deleting the first ellipse
    }
  }

  let closestIndex = -1;
  let minDist = Infinity;

  for (let i = 0; i < lines.length; i++) {
    let l = lines[i];
    let d = distToSegment(mx, my, l.x1, l.y1, l.x2, l.y2);
    if (d < minDist && d < 10) {
      // Only delete if within 10 pixels
      minDist = d;
      closestIndex = i;
    }
  }

  if (closestIndex !== -1) {
    lines.splice(closestIndex, 1); // Remove closest line
  }

  closestIndex = -1;
  minDist = Infinity;

  for (let i = 0; i < beziers.length; i++) {
    let bezierCurve = beziers[i];
    let d = distanceToBezierCurve(mx, my, bezierCurve);
    if (d < minDist && d < 10) {
      minDist = d;
      closestIndex = i;
    }
  }

  if (closestIndex !== -1) {
    beziers.splice(closestIndex, 1); // Remove closest Bezier curve
  }
}

function distanceToBezierCurve(mx, my, bezierCurve) {
  let minDist = Infinity;
  for (let t = 0; t <= 1; t += 0.01) {
    // Sample points on the Bezier curve from t = 0 to t = 1
    let bx = bezierPointF(
      bezierCurve.startBx,
      bezierCurve.controlX1,
      bezierCurve.controlX2,
      bezierCurve.endBX,
      t
    );
    let by = bezierPointF(
      bezierCurve.startBy,
      bezierCurve.controlY1,
      bezierCurve.controlY2,
      bezierCurve.endBY,
      t
    );
    let d = dist(mx, my, bx, by);
    if (d < minDist) {
      minDist = d;
    }
  }
  return minDist;
}

function bezierPointF(p0, p1, p2, p3, t) {
  // Cubic Bezier formula: B(t) = (1-t)^3 * P0 + 3(1-t)^2 * t * P1 + 3(1-t) * t^2 * P2 + t^3 * P3
  let u = 1 - t;
  return (
    u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
  );
}

// Calculate the shortest distance from a point to a line segment
function distToSegment(px, py, x1, y1, x2, y2) {
  let A = px - x1;
  let B = py - y1;
  let C = x2 - x1;
  let D = y2 - y1;

  let dot = A * C + B * D;
  let lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : -1;

  let nearestX, nearestY;
  if (param < 0) {
    nearestX = x1;
    nearestY = y1;
  } else if (param > 1) {
    nearestX = x2;
    nearestY = y2;
  } else {
    nearestX = x1 + param * C;
    nearestY = y1 + param * D;
  }

  return dist(px, py, nearestX, nearestY);
}


// this function fires with any double click anywhere
//function doubleClicked() {
//	doublec = doublec + 1;
//}
//function windowResized() {
//  resizeCanvas(windowWidth, windowHeight);
//}

/* prevents the mobile browser from processing some default
 * touch events, like swiping left for "back" or scrolling
 * the page.
 */
//document.ontouchmove = function(event) {
//    event.preventDefault();
//};