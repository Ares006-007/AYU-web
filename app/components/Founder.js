import styles from './Founder.module.css';

export default function Founder() {
  return (
    <section className={styles.founder} id="about">
      <div className="container">
        <div className={styles.layout}>
          <div className={`${styles.photoCol} reveal`}>
            <div className={styles.photoFrame}>
              <div className={styles.monogram}>
                <span>SA</span>
              </div>
            </div>
          </div>

          <div className={`${styles.content} reveal`} style={{ transitionDelay: '0.15s' }}>
            <span className="eyebrow">Founder</span>
            <h2 className={styles.name}>Shaik Mohammad Ajhaj</h2>

            <div className={styles.bioBlock}>
              <p className={styles.bio}>
                I built Ayu because I watched patients make three separate trips for what should be a single checkup cycle — one to book, one to consult, one to collect medicines. That's broken, and it's fixable.
              </p>
              <p className={styles.bio}>
                Before Ayu, I organized hackathons and built communities as the Event Operations Lead for Hack Club India and the H2O Lead for YSWS. I believe in building things that solve real, immediate problems.
              </p>
            </div>

            <div className={styles.credentials}>
              <span className={styles.tag}>Hack Club India</span>
              <span className={styles.tag}>YSWS — H2O Lead</span>
              <span className={styles.tag}>Healthcare Tech</span>
            </div>

            <div className={styles.actions}>
              <a
                href="https://my-portfolio-one-zeta-11.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline"
              >
                Personal portfolio
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
                  <line x1="7" y1="17" x2="17" y2="7"/>
                  <polyline points="7 7 17 7 17 17"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
