'use client';

import { useState, useEffect } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#work', label: 'Work' },
    { href: '#about', label: 'About' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`} role="navigation" aria-label="Main navigation">
      <div className={styles.inner}>
        <a href="#" className={styles.brand} aria-label="Ayu — back to top">
          <div className={styles.logoMark}>A</div>
          <span className={styles.logoText}>ayu</span>
        </a>

        <ul className={styles.links} role="list">
          {navLinks.map(link => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <a
            href="https://wa.me/919876543210?text=Hi%20AYU"
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn--primary btn--sm ${styles.ctaBtn}`}
          >
            Try on WhatsApp
          </a>

          <button
            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        role="dialog"
        aria-label="Mobile navigation"
      >
        <div className={styles.drawerLinks}>
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={styles.drawerLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
        <a
          href="https://wa.me/919876543210?text=Hi%20AYU"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn--primary btn--lg"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={() => setMenuOpen(false)}
        >
          Try on WhatsApp
        </a>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </nav>
  );
}
