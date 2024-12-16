"use client";

import React, { useEffect } from 'react';
import { Canvas } from '../components/three/ThreeTextComponent';

const HomePage = () => {
  useEffect(() => {
    const canvasElement = document.querySelector('.webgl-canvas');
    if (canvasElement) {
      new Canvas(canvasElement);
    }
  }, []);

  return (
    <div>
      <h1>Three.js Text Example</h1>
      <canvas className="webgl-canvas" style={{ width: '100%', height: '100vh' }}></canvas>
    </div>
  );
};

export default HomePage;
