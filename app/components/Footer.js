import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.brand}>
            <div className={styles.logoMark}>A</div>
            <span className={styles.logoText}>ayu</span>
          </div>

          <nav className={styles.links} aria-label="Footer navigation">
            <a href="#work">Work</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          </nav>

          <p className={styles.copy}>
            &copy; {new Date().getFullYear()} Ayu Health
          </p>
        </div>
      </div>
    </footer>
  );
}
