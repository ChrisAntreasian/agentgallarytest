'use client';

import React from 'react';
import styles from './roots.module.css';

export default function Controls({ initialParams: params, onParamsChange: setParams }) { // Renamed props here
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Ensure numberOfTrunks is an integer
    const val = name === 'numberOfTrunks' || name === 'maxDepth' || name === 'sproutNodes' 
                ? parseInt(value, 10) 
                : parseFloat(value);
    setParams((prevParams) => ({
      ...prevParams,
      [name]: val,
    }));
  };

  // Ensure params is not undefined before trying to access its properties
  if (!params) {
    return <div>Loading controls...</div>; // Or some other placeholder
  }

  return (
    <div className={styles.controlsContainerScrollable}> {/* Added for scrolling if content overflows */}
      {/* Trunk Controls */}
      <div className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Trunk Properties</h3>
        <div>
          <label htmlFor="trunkHeight">Height:</label>
          <input type="range" id="trunkHeight" name="trunkHeight" min="0.5" max="5" step="0.1" value={params.trunkHeight} onChange={handleChange} />
          <span>{params.trunkHeight.toFixed(1)}</span>
        </div>
        <div>
          <label htmlFor="trunkBaseWidth">Base Width:</label> {/* Changed label and name */}
          <input type="range" id="trunkBaseWidth" name="trunkBaseWidth" min="0.01" max="0.5" step="0.01" value={params.trunkBaseWidth} onChange={handleChange} />
          <span>{params.trunkBaseWidth.toFixed(2)}</span>
        </div>
        <div>
          <label htmlFor="trunkTipWidth">Tip Width:</label>
          <input type="range" id="trunkTipWidth" name="trunkTipWidth" min="0.005" max="0.3" step="0.005" value={params.trunkTipWidth} onChange={handleChange} />
          <span>{params.trunkTipWidth.toFixed(3)}</span>
        </div>
        <div>
          <label htmlFor="trunkLean">Lean (-45° to 45°):</label>
          <input type="range" id="trunkLean" name="trunkLean" min={(-Math.PI / 4).toFixed(3)} max={(Math.PI / 4).toFixed(3)} step="0.01" value={params.trunkLean} onChange={handleChange} />
          <span>{(params.trunkLean * 180 / Math.PI).toFixed(0)}°</span>
        </div>
        <div>
          <label htmlFor="trunkWaviness">Waviness:</label>
          <input type="range" id="trunkWaviness" name="trunkWaviness" min="0" max="0.3" step="0.01" value={params.trunkWaviness} onChange={handleChange} />
          <span>{params.trunkWaviness.toFixed(2)}</span>
        </div>
      </div>

      {/* Trunk Splitting Controls */}
      <div className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Trunk Splitting</h3>
        <div>
          <label htmlFor="numberOfTrunks">Number of Trunks (1-5):</label>
          <input type="range" id="numberOfTrunks" name="numberOfTrunks" min="1" max="5" step="1" value={params.numberOfTrunks} onChange={handleChange} />
          <span>{params.numberOfTrunks}</span>
        </div>
        {params.numberOfTrunks > 1 && (
          <>
            <div>
              <label htmlFor="trunkSplitAngle">Split Angle:</label>
              <input type="range" id="trunkSplitAngle" name="trunkSplitAngle" min="0.05" max={(Math.PI / 2).toFixed(2)} step="0.01" value={params.trunkSplitAngle} onChange={handleChange} />
              <span>{(params.trunkSplitAngle * 180 / Math.PI).toFixed(0)}°</span>
            </div>
            <div>
              <label htmlFor="trunkSplitAngleRandomness">Split Angle Randomness:</label>
              <input type="range" id="trunkSplitAngleRandomness" name="trunkSplitAngleRandomness" min="0" max="0.5" step="0.01" value={params.trunkSplitAngleRandomness} onChange={handleChange} />
              <span>{params.trunkSplitAngleRandomness.toFixed(2)}</span>
            </div>
            <div>
              <label htmlFor="trunkSplitDistribution">Split Distribution:</label>
              <input type="range" id="trunkSplitDistribution" name="trunkSplitDistribution" min="0.1" max="2" step="0.05" value={params.trunkSplitDistribution} onChange={handleChange} />
              <span>{params.trunkSplitDistribution.toFixed(2)}</span>
            </div>
            <div>
              <label htmlFor="trunkSplitDistributionRandomness">Distribution Randomness:</label>
              <input type="range" id="trunkSplitDistributionRandomness" name="trunkSplitDistributionRandomness" min="0" max="0.5" step="0.01" value={params.trunkSplitDistributionRandomness} onChange={handleChange} />
              <span>{params.trunkSplitDistributionRandomness.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Branch Controls - General */}
      <div className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Branch Structure</h3>
        <div>
          <label htmlFor="maxDepth">Recursion Depth:</label>
          <input type="range" id="maxDepth" name="maxDepth" min="1" max="7" step="1" value={params.maxDepth} onChange={handleChange} />
          <span>{params.maxDepth}</span>
        </div>
        <div>
          <label htmlFor="sproutNodes">Sprout Nodes (1-4):</label>
          <input type="range" id="sproutNodes" name="sproutNodes" min="1" max="4" step="1" value={params.sproutNodes} onChange={handleChange} />
          <span>{params.sproutNodes}</span>
        </div>
        <div>
          <label htmlFor="branchingAngle">Branching Angle:</label>
          <input type="range" id="branchingAngle" name="branchingAngle" min="0.1" max={Math.PI.toFixed(2)} step="0.01" value={params.branchingAngle} onChange={handleChange} />
          <span>{(params.branchingAngle * 180 / Math.PI).toFixed(0)}°</span>
        </div>
      </div>

      {/* Branch Controls - Length */}
      <div className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Branch Length</h3>
        <div>
          <label htmlFor="branchLength">Initial Length:</label>
          <input type="range" id="branchLength" name="branchLength" min="0.2" max="3" step="0.1" value={params.branchLength} onChange={handleChange} />
          <span>{params.branchLength.toFixed(1)}</span>
        </div>
        <div>
          <label htmlFor="branchLengthFactor">Length Factor (Child/Parent):</label>
          <input type="range" id="branchLengthFactor" name="branchLengthFactor" min="0.3" max="0.95" step="0.01" value={params.branchLengthFactor} onChange={handleChange} />
          <span>{params.branchLengthFactor.toFixed(2)}</span>
        </div>
        <div>
          <label htmlFor="branchLengthRandomness">Length Randomness:</label>
          <input type="range" id="branchLengthRandomness" name="branchLengthRandomness" min="0" max="0.5" step="0.01" value={params.branchLengthRandomness} onChange={handleChange} />
          <span>{params.branchLengthRandomness.toFixed(2)}</span>
        </div>
      </div>

      {/* Branch Controls - Width */}
      <div className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Branch Width</h3>
        <div>
          <label htmlFor="baseBranchWidth">Base Width (Trunk Branches):</label>
          <input type="range" id="baseBranchWidth" name="baseBranchWidth" min="0.01" max="0.3" step="0.005" value={params.baseBranchWidth} onChange={handleChange} />
          <span>{params.baseBranchWidth.toFixed(3)}</span>
        </div>
        <div>
          <label htmlFor="branchTipWidth">Min Tip Width:</label>
          <input type="range" id="branchTipWidth" name="branchTipWidth" min="0.001" max="0.05" step="0.001" value={params.branchTipWidth} onChange={handleChange} />
          <span>{params.branchTipWidth.toFixed(3)}</span>
        </div>
        <div>
          <label htmlFor="childParentWidthRatio">Width Factor (Child/Parent):</label>
          <input type="range" id="childParentWidthRatio" name="childParentWidthRatio" min="0.3" max="0.95" step="0.01" value={params.childParentWidthRatio} onChange={handleChange} />
          <span>{params.childParentWidthRatio.toFixed(2)}</span>
        </div>
      </div>

      {/* Branch Controls - Appearance & Randomness */}
      <div className={styles.controlGroup}>
        <h3 className={styles.groupTitle}>Branch Appearance</h3>
        <div>
          <label htmlFor="branchPositionRandomness">Position Randomness:</label>
          <input type="range" id="branchPositionRandomness" name="branchPositionRandomness" min="0" max="1" step="0.05" value={params.branchPositionRandomness} onChange={handleChange} />
          <span>{params.branchPositionRandomness.toFixed(2)}</span>
        </div>
        <div>
          <label htmlFor="branchWaviness">Waviness:</label>
          <input type="range" id="branchWaviness" name="branchWaviness" min="0" max="0.5" step="0.01" value={params.branchWaviness} onChange={handleChange} />
          <span>{params.branchWaviness.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
