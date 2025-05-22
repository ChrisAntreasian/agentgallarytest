'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

// Helper function to apply randomness
const applyRandomness = (value, randomnessFactor) => {
  return value * (1 + (Math.random() - 0.5) * 2 * randomnessFactor);
};

// Helper function to create a wavy branch segment
function createWavyBranch(startPoint, endPoint, startWidth, endWidth, waviness, segments = 10) {
  const actualStartWidth = Math.max(0.001, startWidth); // Ensure minimum width
  const actualEndWidth = Math.max(0.001, endWidth);     // Ensure minimum width

  if (waviness === 0 && actualStartWidth === actualEndWidth && startPoint.equals(endPoint) === false) { // check for non-zero length
    const straightCurve = new THREE.LineCurve3(startPoint, endPoint);
    // Ensure at least 2 segments for TubeGeometry, even for straight lines
    return new THREE.TubeGeometry(straightCurve, Math.max(2, segments / 2), actualStartWidth, 8, false);
  }


  const points = [];
  const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
  const length = direction.length();
  if (length === 0) { // Avoid issues with zero-length branches
      return new THREE.BufferGeometry(); // Return empty geometry
  }
  direction.normalize();
  
  let perpendicular = new THREE.Vector3(direction.y, -direction.x, direction.z).normalize(); 
  if (perpendicular.lengthSq() === 0) { 
      perpendicular.set(1,0,0).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), direction));
      if (direction.x === 0 && direction.z === 0) perpendicular.set(1,0,0); // if direction is Y axis
      else perpendicular.crossVectors(direction, new THREE.Vector3(0,1,0)).normalize();
      if (perpendicular.lengthSq() === 0) perpendicular.set(1,0,0); // Final fallback
  }

  const radii = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const pointOnLine = new THREE.Vector3().copy(startPoint).addScaledVector(direction, t * length);
    const waveOffset = waviness > 0 ? Math.sin(t * Math.PI * 3) * waviness * length * 0.2 : 0; 
    const waveVec = new THREE.Vector3().copy(perpendicular).multiplyScalar(waveOffset);
    points.push(pointOnLine.add(waveVec));
    radii.push(actualStartWidth * (1 - t) + actualEndWidth * t); // Interpolate radius
  }
  const curve = new THREE.CatmullRomCurve3(points);
  
  const tubeSegments = Math.max(2, Math.floor(segments * 0.8)); // Ensure at least 2 segments
  const radialSegments = 5; // Keep radial segments reasonable
  const tubeGeometry = new THREE.TubeGeometry(curve, tubeSegments, actualStartWidth, radialSegments, false);
  return tubeGeometry;
}

// New component to handle animation for each branch segment
function AnimatedBranchSegment({
  // Segment specific:
  segmentKey, segmentStartPoint, segmentEndPoint, segmentStartWidth, segmentEndWidth, segmentWaviness,
  // click target:
  clickTargetPoint,
  // Props for the child Branch call:
  childInitialAngle, childCurrentLength, childCurrentWidth, childCurrentDepth,
  // Common tree generation props (passed through to child Branch):
  maxDepth, baseBranchWidth, branchTipWidth, childParentWidthRatio,
  branchLengthFactor, branchLengthRandomness, branchPositionRandomness,
  sproutNodes, branchingAngle
}) {
  const groupRef = useRef();
  const [animationState, setAnimationState] = useState({
    isActive: false,
    target: null,
    startTime: 0,
  });
  const baseQuaternion = useMemo(() => new THREE.Quaternion(), []); // Identity quaternion
  // Define wiggleAxis at the component's top level, ensuring it's stable per instance.
  const wiggleAxis = useMemo(() => new THREE.Vector3(0.2, 0.7, 0.1).normalize(), []);

  const geometry = useMemo(() => {
    return createWavyBranch(segmentStartPoint, segmentEndPoint, segmentStartWidth, segmentEndWidth, segmentWaviness);
  }, [segmentStartPoint, segmentEndPoint, segmentStartWidth, segmentEndWidth, segmentWaviness]);
  
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 'saddlebrown', side: THREE.DoubleSide }), []);

  useEffect(() => {
    if (clickTargetPoint && groupRef.current && segmentStartPoint && segmentEndPoint) {
      const distance = segmentStartPoint.distanceTo(clickTargetPoint);
      const segmentLength = segmentStartPoint.distanceTo(segmentEndPoint);
      const REACTION_RADIUS = Math.max(segmentLength * 1.5, 0.5); // Example radius

      if (distance < REACTION_RADIUS) {
        setAnimationState({
          isActive: true,
          target: clickTargetPoint.clone(),
          startTime: Date.now(),
        });
      }
    }
  }, [clickTargetPoint, segmentStartPoint, segmentEndPoint]);

  useEffect(() => {
    if (!animationState.isActive || !animationState.target || !groupRef.current || !segmentStartPoint || !segmentEndPoint) {
      return;
    }

    let animationFrameId;
    const { target, startTime } = animationState;
    const ANIMATION_DURATION = 1500; // 1.5 seconds
    const currentGroup = groupRef.current; // Capture ref value for cleanup

    const animate = () => {
      const elapsedTime = Date.now() - startTime;

      if (elapsedTime >= ANIMATION_DURATION) {
        if(currentGroup) currentGroup.quaternion.copy(baseQuaternion);
        setAnimationState({ isActive: false, target: null, startTime: 0 });
        return;
      }

      const progress = elapsedTime / ANIMATION_DURATION; // 0 to 1

      // Point Towards Logic:
      const segmentForward = new THREE.Vector3().subVectors(segmentEndPoint, segmentStartPoint).normalize();
      const directionToTarget = new THREE.Vector3().subVectors(target, segmentStartPoint).normalize();
      
      let pointQuaternion = new THREE.Quaternion();
      if (segmentForward.lengthSq() > 0.001 && directionToTarget.lengthSq() > 0.001 && !segmentForward.equals(directionToTarget)) {
        pointQuaternion.setFromUnitVectors(segmentForward, directionToTarget);
      }
      
      const targetOrientation = pointQuaternion.clone().multiply(baseQuaternion); // Target is relative to base
      const currentPointingQuaternion = baseQuaternion.clone().slerp(targetOrientation, Math.sin(progress * Math.PI / 2));

      // Wiggle Logic:
      const wiggleIntensity = 0.10 * (1 - Math.sin(progress * Math.PI / 2)); // Diminishing wiggle
      const wiggleSpeed = 0.025;
      // Use the memoized wiggleAxis defined at the component level
      const wiggleQ = new THREE.Quaternion().setFromAxisAngle(wiggleAxis, Math.sin(elapsedTime * wiggleSpeed) * wiggleIntensity);

      if (currentGroup) {
        currentGroup.quaternion.copy(currentPointingQuaternion).multiply(wiggleQ);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (currentGroup) { // Use captured value in cleanup
        currentGroup.quaternion.copy(baseQuaternion);
      }
    };
  }, [animationState, segmentStartPoint, segmentEndPoint, baseQuaternion, wiggleAxis]); // Added wiggleAxis to dependencies

  const showChildren = childCurrentDepth > 0;

  return (
    <group key={segmentKey} ref={groupRef}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      {showChildren && (
        <Branch
          startPoint={segmentEndPoint}
          initialAngle={childInitialAngle}
          currentLength={childCurrentLength}
          currentWidth={childCurrentWidth}
          currentDepth={childCurrentDepth}
          maxDepth={maxDepth}
          baseBranchWidth={baseBranchWidth}
          branchTipWidth={branchTipWidth}
          childParentWidthRatio={childParentWidthRatio}
          branchLengthFactor={branchLengthFactor}
          branchLengthRandomness={branchLengthRandomness}
          branchPositionRandomness={branchPositionRandomness}
          sproutNodes={sproutNodes}
          branchingAngle={branchingAngle}
          branchWaviness={segmentWaviness}
          clickTargetPoint={clickTargetPoint}
        />
      )}
    </group>
  );
}


function Branch({
  startPoint,
  initialAngle,
  currentLength,
  currentWidth, // Current branch starts with this width
  currentDepth,
  maxDepth,
  baseBranchWidth, // Initial width for first set of branches from trunk
  branchTipWidth, // Target minimum width for terminal branches
  childParentWidthRatio, // Factor for child branch width relative to parent
  branchLengthFactor, // Factor for child branch length relative to parent
  branchLengthRandomness, // Randomness for child branch length
  branchPositionRandomness,
  sproutNodes, 
  branchingAngle, 
  branchWaviness,
  clickTargetPoint // New prop
}) {
  if (currentDepth <= 0) return null;

  const branches = [];
  const numSprouts = Math.max(1, Math.min(4, Math.round(sproutNodes)));
  const angleStep = numSprouts > 1 ? branchingAngle / (numSprouts -1) : 0;
  const baseSproutAngle = initialAngle - (numSprouts > 1 ? branchingAngle / 2 : 0);

  for (let i = 0; i < numSprouts; i++) {
    const randomizedChildLength = applyRandomness(currentLength * branchLengthFactor, branchLengthRandomness);
    const childStartWidth = Math.max(branchTipWidth, currentWidth * childParentWidthRatio);
    const currentBranchEndWidth = childStartWidth; 

    const sproutAngle = baseSproutAngle + i * angleStep;
    const randomizedAngle = applyRandomness(sproutAngle, branchPositionRandomness * 0.1);

    const endPoint = new THREE.Vector3(
      startPoint.x + randomizedChildLength * Math.sin(randomizedAngle),
      startPoint.y + randomizedChildLength * Math.cos(randomizedAngle),
      startPoint.z + applyRandomness(0, branchPositionRandomness * 0.2) // Z randomness for position
    );
    
    branches.push(
      <AnimatedBranchSegment
        key={`branch-${currentDepth}-${i}`} // React key for AnimatedBranchSegment
        segmentKey={`segment-${currentDepth}-${i}`} // Prop for internal use if needed, or just use key
        // Segment specific:
        segmentStartPoint={startPoint}
        segmentEndPoint={endPoint}
        segmentStartWidth={currentWidth}
        segmentEndWidth={currentBranchEndWidth}
        segmentWaviness={branchWaviness}
        // clickTargetPoint for this segment's animation logic
        clickTargetPoint={clickTargetPoint}
        // Props for the recursive Branch call:
        childInitialAngle={randomizedAngle}
        childCurrentLength={randomizedChildLength}
        childCurrentWidth={childStartWidth}
        childCurrentDepth={currentDepth - 1}
        // Common props for all branches (must be passed to AnimatedBranchSegment for its child Branch call)
        maxDepth={maxDepth} baseBranchWidth={baseBranchWidth} branchTipWidth={branchTipWidth}
        childParentWidthRatio={childParentWidthRatio} branchLengthFactor={branchLengthFactor}
        branchLengthRandomness={branchLengthRandomness} branchPositionRandomness={branchPositionRandomness}
        sproutNodes={sproutNodes} branchingAngle={branchingAngle}
      />
    );
  }

  return <>{branches}</>;
}

export default function Tree({ 
  branchLength, // Initial length for first set of branches from trunk
  branchingAngle,
  maxDepth,
  baseBranchWidth, // Initial width for first set of branches from trunk
  branchTipWidth,
  childParentWidthRatio,
  branchLengthFactor,
  branchLengthRandomness,
  branchPositionRandomness,
  sproutNodes,
  branchWaviness,
  trunkHeight,
  trunkWidth,
  trunkLean,
  clickTargetPoint = null // New prop for click target coordinates
}) {
  const trunkStart = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const trunkEnd = useMemo(() => new THREE.Vector3(
    trunkHeight * Math.sin(trunkLean),
    trunkHeight * Math.cos(trunkLean),
    0
  ), [trunkHeight, trunkLean]);

  const trunkTopWidth = Math.max(branchTipWidth, trunkWidth * childParentWidthRatio * 0.8);
  const trunkGeometry = useMemo(() => {
    return createWavyBranch(trunkStart, trunkEnd, trunkWidth, trunkTopWidth, branchWaviness * 0.3, 10); 
  }, [trunkStart, trunkEnd, trunkWidth, trunkTopWidth, branchWaviness]);
  
  const trunkMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#5C3A21', side: THREE.DoubleSide }), []);

  return (
    <group>
      <mesh geometry={trunkGeometry} material={trunkMaterial} castShadow receiveShadow />
      <Branch
        startPoint={trunkEnd} 
        initialAngle={trunkLean} 
        currentLength={branchLength} 
        currentWidth={baseBranchWidth} 
        currentDepth={maxDepth}
        maxDepth={maxDepth}
        baseBranchWidth={baseBranchWidth}
        branchTipWidth={branchTipWidth}
        childParentWidthRatio={childParentWidthRatio}
        branchLengthFactor={branchLengthFactor}
        branchLengthRandomness={branchLengthRandomness}
        branchPositionRandomness={branchPositionRandomness}
        sproutNodes={sproutNodes}
        branchingAngle={branchingAngle}
        branchWaviness={branchWaviness}
        clickTargetPoint={clickTargetPoint} // Pass down the click target
      />
    </group>
  );
}
