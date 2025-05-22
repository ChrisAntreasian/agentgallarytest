// src/components/Header.js
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header() {
  const pages = [
    { name: 'Home', path: '/' },
    { name: 'Checkers', path: '/checkers' },
    { name: 'Cube', path: '/cube' },
    { name: 'Drawing App', path: '/drawing-app' },
    { name: 'Game', path: '/game' },
    { name: 'HiHo', path: '/hiHo' },
    { name: 'Roots', path: '/roots' },
    { name: 'Todo', path: '/todo' },
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {pages.map((page) => (
            <li key={page.name} className={styles.navItem}>
              <Link href={page.path} className={styles.navLink}>
                {page.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}