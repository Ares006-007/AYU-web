'use client';

import { useTheme } from './ThemeProvider';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.inner}>
        <div className={styles.left}>
          <a href="#" className={styles.brand}>
            AYU
          </a>
        </div>

        <div className={styles.right}>
          <a href="#reality" className={styles.link}>The Reality</a>
          <a href="#mechanism" className={styles.link}>How it Works</a>
          <a href="#founder" className={styles.link}>Founder</a>
          
          {mounted && (
            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          )}

          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            Message us
          </a>
        </div>
      </div>
    </nav>
  );
}
