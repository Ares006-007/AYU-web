import styles from './Founder.module.css';

export default function Founder() {
  return (
    <section className={styles.founder} id="founder">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <span className="text-mono">The Architect</span>
          </div>
          <div className={styles.right}>
            <div className={styles.letter}>
              <h2 className="text-h2" style={{ marginBottom: '2rem' }}>
                Why we built this.
              </h2>
              
              <div className="text-body-lg" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <p>
                  I built Ayu because I watched patients make three separate trips for what should be a single checkup cycle. One to book, one to consult, one to collect medicines. 
                </p>
                <p>
                  That's broken, and it's fixable. But it won't be fixed by forcing clinics to learn complex new software, or by forcing patients to download yet another app they will use once a year.
                </p>
                <p>
                  It gets fixed by meeting people where they already are. In India, that's WhatsApp. We built an operating system that lives quietly in the background, connecting the tools clinics use with the app patients already love.
                </p>
              </div>

              <div className={styles.signature}>
                <div className={styles.monogram}>SA</div>
                <div className={styles.authorMeta}>
                  <span className={styles.authorName}>Shaik Mohammad Ajhaj</span>
                  <span className={styles.authorTitle}>Founder, Ayu Health</span>
                  <a href="https://my-portfolio-one-zeta-11.vercel.app/" target="_blank" rel="noopener noreferrer" className="link-strict" style={{ marginTop: '0.5rem', display: 'inline-block', fontSize: '0.875rem' }}>
                    View Portfolio
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
