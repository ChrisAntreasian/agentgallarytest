'use client';

import React, { Suspense, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Stats, OrthographicCamera } from '@react-three/drei'; // Added OrthographicCamera
import * as THREE from 'three';
import Tree from './Tree';
import Controls from './Controls';
import styles from './roots.module.css';

const initialTreeParams = {
  branchLength: 1.2,
  branchingAngle: 0.45, // Radians
  maxDepth: 5, // Reduced for 2D clarity initially
  baseBranchWidth: 0.1,
  branchTipWidth: 0.01,
  childParentWidthRatio: 0.7,
  branchLengthFactor: 0.8,
  branchLengthRandomness: 0.2,
  branchPositionRandomness: 0.1, // Reduced for 2D
  sproutNodes: 2, // Simplified for 2D
  branchWaviness: 0.1,
  trunkHeight: 2,
  trunkBaseWidth: 0.2,
  trunkTipWidth: 0.1,
  trunkLean: 0.0, // Straight trunk for 2D start
  trunkWaviness: 0.05,
  numberOfTrunks: 1,
  trunkSplitAngle: 0.3, // Radians
  trunkSplitAngleRandomness: 0.1,
  trunkSplitDistribution: 1.0,
  trunkSplitDistributionRandomness: 0.1,
};

// Scene component now receives treeParams as a prop
function Scene({ currentTreeParams, clickTarget, onCanvasClick }) {
  const { camera, raycaster, scene, gl } = useThree();
  // Ground plane is now the XY plane at Z=0
  const xyPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);

  const handleLocalCanvasClick = useCallback((event) => {
    const pointer = new THREE.Vector2();
    const rect = gl.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    // Intersect with the XY plane
    const intersectionPoint = new THREE.Vector3();
    if (raycaster.ray.intersectPlane(xyPlane, intersectionPoint)) {
      console.log("Scene: Clicked at 2D world coordinates (XY plane):", intersectionPoint);
      onCanvasClick(intersectionPoint); // Pass to parent handler
    } else {
      // Fallback if plane intersection fails (shouldn't with Ortho looking at XY)
      const intersects = raycaster.intersectObjects(scene.children, true);
      if (intersects.length > 0) {
        console.log("Scene: Clicked on object (fallback):", intersects[0].point);
        onCanvasClick(intersects[0].point); // Pass to parent handler
      }
    }
  }, [gl, camera, raycaster, scene, xyPlane, onCanvasClick]);

  useEffect(() => {
    const canvasElement = gl.domElement;
    canvasElement.addEventListener('click', handleLocalCanvasClick);
    return () => {
      canvasElement.removeEventListener('click', handleLocalCanvasClick);
    };
  }, [gl, handleLocalCanvasClick]);

  return (
    <>
      {/* Orthographic Camera for 2D view */}
      <OrthographicCamera 
        makeDefault 
        position={[0, currentTreeParams.trunkHeight / 2, 10]} // Positioned to view the tree centered
        zoom={50} // Adjust zoom to fit the tree well; larger value = more zoomed in
        near={0.1} 
        far={100} 
      />
      <ambientLight intensity={0.8} /> 
      {/* Removed directional/point lights and Environment for a flatter 2D look for now */}
      {/* <Environment preset="sunset" background blur={0.5} /> */}
      <Suspense fallback={null}>
        <Tree key={JSON.stringify(currentTreeParams)} {...currentTreeParams} clickTargetPoint={clickTarget} is2D={true} />
      </Suspense>
      <OrbitControls enableRotate={false} /> {/* Disable rotation for 2D-like panning/zooming */}
      <Stats />
      {/* No 3D ground plane mesh needed for 2D view */}
    </>
  );
}

export default function RootsPage() {
  const [treeParams, setTreeParams] = useState(initialTreeParams);
  const [clickTarget, setClickTarget] = useState(null);

  const handleCanvasClick = useCallback((point) => {
    setClickTarget(point);
    // Optional: Reset click target after a delay
    // setTimeout(() => setClickTarget(null), 2000);
  }, [setClickTarget]);

  return (
    // Using the new layout classes from roots.module.css
    <div className={styles.pageContainer}>
      {/* Optional: <h1 className={styles.mainTitle}>2D Procedural Tree</h1> */}
      <div className={styles.contentWrapper}>
        <div className={styles.controlsColumn}>
          <Controls initialParams={treeParams} onParamsChange={setTreeParams} />
        </div>
        <div className={styles.canvasColumn}>
          <Canvas 
            shadows={false} // Shadows less relevant in 2D
            // Removed camera prop, Scene now defines its OrthographicCamera
          >
            <Scene currentTreeParams={treeParams} clickTarget={clickTarget} onCanvasClick={handleCanvasClick} /> 
          </Canvas>
        </div>
      </div>
    </div>
  );
}
