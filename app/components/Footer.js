import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.brand}>
            <div className={styles.logo}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
              <span className={styles.logoText}>ayu</span>
            </div>
            <p className={styles.desc}>
              Healthcare access and coordination, right inside WhatsApp. Built to make the journey from consultation to prescription to medicine simpler.
            </p>
          </div>

          <div className={styles.links}>
            <h4>Connect</h4>
            <ul>
              <li>
                <a href="#" className={styles.link}>Investor Pitch Deck</a>
              </li>
              <li>
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className={styles.link}>
                  WhatsApp (+91 98765 43210)
                </a>
              </li>
              <li>
                <a href="mailto:hello@ayuhealth.in" className={styles.link}>
                  hello@ayuhealth.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            &copy; {new Date().getFullYear()} Ayu Health. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
