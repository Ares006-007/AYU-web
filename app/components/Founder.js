import styles from './Founder.module.css';

export default function Founder() {
  return (
    <section className={styles.founder} id="founder">
      <div className="container">
        <div className={styles.layout}>
          <div className={`${styles.imageCol} reveal`}>
            <div className={styles.imageWrapper}>
              {/* Placeholder for founder photo */}
              <svg className={styles.placeholderIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" width="64" height="64">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
          </div>
          
          <div className={`${styles.content} reveal`} style={{ transitionDelay: '0.2s' }}>
            <div>
              <div className={styles.role}>Founder & Builder</div>
              <h2 className={styles.name}>Shaik Mohammad Ajhaj</h2>
            </div>
            
            <p className={styles.bio}>
              I built Ayu from the ground up because I saw how broken the communication was between patients, doctors, and pharmacies. Before Ayu, I spent my time organizing hackathons and building communities as the Event Operation Lead for Hack Club India and the H2O Lead for YSWS. 
            </p>
            <p className={styles.bio}>
              I believe in building things that solve real, immediate problems. Ayu is my answer to the friction in everyday healthcare.
            </p>

            <div className={styles.actions}>
              <a 
                href="https://my-portfolio-one-zeta-11.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn--outline"
              >
                View Personal Portfolio
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
