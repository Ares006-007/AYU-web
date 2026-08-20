import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.left}>
            <span className={styles.brand}>AYU</span>
            <span className={styles.copy}>
              &copy; {new Date().getFullYear()} Ayu Health. Built in India.
            </span>
          </div>

          <nav className={styles.links} aria-label="Footer navigation">
            <a href="#reality" className="link-strict">The Reality</a>
            <a href="#mechanism" className="link-strict">The Mechanism</a>
            <a href="#founder" className="link-strict">Founder</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
