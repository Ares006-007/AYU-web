import styles from './Stakeholder.module.css';

export default function ForPatients() {
  return (
    <section className={`${styles.stakeholder} section--alt`} id="for-patients">
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <div className={`${styles.icon} ${styles['icon--patient']}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <span className="platform-tag platform-tag--whatsapp" style={{ marginBottom: '1rem', marginRight: '0.5rem' }}>WhatsApp</span>
          <span className="platform-tag platform-tag--app" style={{ marginBottom: '1rem' }}>App</span>
          <h2 className="section-heading">For Patients</h2>
        </div>

        <div className={styles.layout}>
          <div className={`${styles.content} reveal`}>
            <div className={styles.problem}>
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                The Problem
              </h3>
              <p className={styles.text}>
                Patients struggle to find the right doctor, track their prescriptions and reports over time, understand their treatment, and get medicines conveniently without repeat trips.
              </p>
            </div>
            
            <div className={styles.solution}>
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>
                How Ayu Solves It
              </h3>
              <p className={styles.text}>
                Ayu gives patients one centralized health profile. It keeps prescriptions and documents organized, connects those prescriptions directly to pharmacies, and treats each visit as part of one ongoing journey, not a one-off event.
              </p>
            </div>
          </div>

          <div className={`${styles.value} reveal`} style={{ transitionDelay: '0.2s', alignSelf: 'center' }}>
            <p className={styles.valueText}>
              "Healthcare becomes more organized, accessible, and continuous."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
