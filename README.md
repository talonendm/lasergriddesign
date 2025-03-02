# Laser Grid Design - lasergriddesign

This is a laser cutting design application built with p5.js that allows users to draw lines, Bezier curves, ellipses, and save their designs as SVG files. The canvas grid and other drawing parameters can be adjusted with keyboard input.

## Features

- **Bezier Curves**: Toggle Bezier mode and draw curves.
- **Ellipses**: Draw ellipses by pressing the "e" key.
- **Grid Adjustment**: Adjust the grid size, snap points to the grid, and scale the grid.
- **Undo/Redo**: Remove the last drawn line or shape.
- **Save as SVG**: Save the drawing as an SVG file.
- **Interactive Keys**: Various keyboard shortcuts for different functionalities.

## Key Commands

### Drawing Tools:
- **`q`, `b`, `l`**: Toggle Bezier curve mode. Once activated, the user can click to set the start, end, and control points of the Bezier curve.
- **`e`**: Draw an ellipse at the current mouse position. The ellipse will be stored in an array for future use.
- To implement a feature where pressing the p key continues a line from the last point (the last end point where the user stopped drawing), you need to store the last point and, when **`p`** is pressed, use it as the starting point for the next line.
  - draw lines by mouseDragging.


### Grid and Snap:
- **`c`**: Toggle snapping of control points to the grid.
- **`C`**: Toggle snapping of ellipse positions to the grid.

### Saving and Undo:
- **`s` or `S`**: Save the current canvas as an SVG file.
- **`z`, `Z`, `u`**: Undo the last drawn line or shape.

### Grid Scaling:
- **`1`**: Decrease the `rx` value (row size).
- **`2`**: Increase the `rx` value (row size).
- **`3`**: Decrease the `ry` value (column size).
- **`4`**: Increase the `ry` value (column size).
- **`5`**: Decrease the grid size scaling factor.
- **`6`**: Increase the grid size scaling factor.

### Visibility and Removal:
- **`g`**: Toggle the grid visibility on/off.
- **`d`**: Delete the nearest line or shape under the mouse cursor.

## Description

### Key Features Breakdown:

1. **Bezier Curves:**
   - Press `q`, `b`, or `l` to toggle Bezier curve drawing mode.
   - Click on the canvas to set the start and end points for the curve.
   - After setting the start and end points, drag the mouse to adjust the control points and preview the Bezier curve.

2. **Ellipses:**
   - Press `e` to draw an ellipse at the mouse position.
   - Ellipses are added to an array for storage and possible later removal.

3. **Grid Scaling:**
   - The grid size can be increased or decreased by using the keys `5` and `6`.
   - The grid is scaled dynamically, affecting all drawn lines, ellipses, and Bezier curves.

4. **Undo and Remove:**
   - The `z`, `Z`, or `u` key undoes the last drawn line or shape.
   - The `d` key removes the nearest line, Bezier curve, or ellipse under the mouse cursor.

5. **Saving:**
   - Press `s` or `S` to save the drawing as an SVG file.

6. **Grid Snapping:**
   - Toggle snapping to the grid for control points and ellipse positions using the `c` (for control points) and `C` (for ellipses) keys.

7. **Canvas Resize:**
   - The canvas size adjusts automatically based on the grid size (`rx`, `ry`) and grid scaling (`gridSizeScale`).

## Example of Key Usage:
- **Bezier Mode**: Press `q`, `b`, or `l` to toggle Bezier mode, then click to set the start and end points. Adjust control points by moving the mouse.
- **Ellipse Drawing**: Press `e` to draw ellipses at the mouse position, and toggle grid snapping if needed.
- **Grid Adjustments**: Use `5` and `6` to zoom in/out of the grid. Adjust `rx` and `ry` values using `1`/`2` for rows and `3`/`4` for columns.
- **Saving**: Once satisfied with the drawing, press `S` to save the design as an SVG file.

---

## Installation and Setup

1. Clone or download the repository.
2. Open the HTML file in any modern web browser.
3. Use the interactive keys to draw, manipulate, and save your designs.

```bash
git clone https://github.com/talonendm/lasergriddesign.git
