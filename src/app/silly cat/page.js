"use client";

import { useEffect, useRef, useState } from 'react';

export default function CubePage() {
  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  let isDragging = false;
  let lastMousePosition = { x: 0, y: 0 };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    const cubeVertices = [
      { x: -50, y: -50, z: -50 },
      { x: 50, y: -50, z: -50 },
      { x: 50, y: 50, z: -50 },
      { x: -50, y: 50, z: -50 },
      { x: -50, y: -50, z: 50 },
      { x: 50, y: -50, z: 50 },
      { x: 50, y: 50, z: 50 },
      { x: -50, y: 50, z: 50 },
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const project = (x, y, z) => {
      const scale = 200 / (z + 300);
      return {
        x: width / 2 + x * scale,
        y: height / 2 - y * scale,
      };
    };

    const rotate = (vertex, angleX, angleY) => {
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      // Rotate around Y-axis
      let x = vertex.x * cosY - vertex.z * sinY;
      let z = vertex.x * sinY + vertex.z * cosY;

      // Rotate around X-axis
      let y = vertex.y * cosX - z * sinX;
      z = vertex.y * sinX + z * cosX;

      return { x, y, z };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'orange';

      edges.forEach(([start, end]) => {
        const rotatedStart = rotate(cubeVertices[start], rotation.x, rotation.y);
        const rotatedEnd = rotate(cubeVertices[end], rotation.x, rotation.y);

        const p1 = project(rotatedStart.x, rotatedStart.y, rotatedStart.z);
        const p2 = project(rotatedEnd.x, rotatedEnd.y, rotatedEnd.z);

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });
    };

    draw();
  }, [rotation]);

  const handleMouseDown = (e) => {
    isDragging = true;
    lastMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - lastMousePosition.x;
    const deltaY = e.clientY - lastMousePosition.y;

    setRotation((prev) => ({
      x: prev.x + deltaY * 0.25, // Increased sensitivity for faster rotation
      y: prev.y + deltaX * 0.25, // Increased sensitivity for faster rotation
    }));

    lastMousePosition = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging = false;
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{ display: 'block', margin: '0 auto' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}