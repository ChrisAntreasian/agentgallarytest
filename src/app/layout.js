"use client";

import { useState } from 'react';
import "./globals.css";
import Link from 'next/link';
import Head from 'next/head';

export default function RootLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closePopup = () => {
    setMenuOpen(false);
  };

  const startDrawing = () => {
    closePopup();
    // Add your drawing logic here
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <html lang="en">
      <Head>
        <title>Vibe Coding Experiments</title>
      </Head>
      <body>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem",
            backgroundColor: "#f5a623",
            color: "white",
          }}
        >
          <h1 style={{ margin: 0 }}>Vibe Coding Experiments</h1>
          <button
            onClick={toggleMenu}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ☰
          </button>
        </header>
        {menuOpen && (
          <nav
            style={{
              position: "absolute",
              top: "3rem",
              right: "1rem",
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "1rem",
            }}
          >
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/checkers">Checkers</Link></li>
              <li><Link href="/cube">Cube</Link></li>
              <li><Link href="/drawing-app">Drawing App</Link></li>
              <li><Link href="/game">Game</Link></li>
            </ul>
          </nav>
        )}
        <main>
          <button onClick={startDrawing}>Start Drawing</button>
          {children}
        </main>
        <footer
          style={{
            position: "fixed",
            bottom: 0,
            width: "100%",
            textAlign: "center",
            padding: "1rem",
            backgroundColor: "#4a90e2",
            color: "white",
          }}
        >
          <p>Cecily and Gladdy are the best</p>
          <p>{today}</p>
        </footer>
      </body>
    </html>
  );
}
