"use client";

import Image from 'next/image';
import { useState } from 'react';
import styles from './page.module.css';
import { Canvas } from '@react-three/fiber';
import { Box } from '@react-three/drei';

const images = [
  '/images/20220329_105355.jpg',
  '/images/20231213_203508.jpg',
  '/images/20240831_133435.jpg',
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <main className={styles.main}>
      <div className={styles.carousel}>
        <button onClick={handlePrev} className={styles.navButton}>Previous</button>
        <Image
          src={images[currentIndex]}
          alt={`Carousel image ${currentIndex + 1}`}
          width={500}
          height={300}
          className={styles.image}
        />
        <button onClick={handleNext} className={styles.navButton}>Next</button>
      </div>
    </main>
  );
}

export function CubePage() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <Canvas>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box>
          <meshStandardMaterial attach="material" color="orange" />
        </Box>
      </Canvas>
    </div>
  );
}
