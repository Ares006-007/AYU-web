import styles from './Stakeholder.module.css';

export default function ForDoctors() {
  return (
    <section className={styles.stakeholder} id="for-doctors">
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <div className={`${styles.icon} ${styles['icon--doctor']}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="platform-tag platform-tag--dashboard" style={{ marginBottom: '1rem' }}>Admin Dashboard</span>
          <h2 className="section-heading">For Doctors & Clinics</h2>
        </div>

        <div className={styles.layout}>
          <div className={`${styles.content} reveal`}>
            <div className={styles.problem}>
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                The Problem
              </h3>
              <p className={styles.text}>
                Doctors deal with fragmented patient info, repetitive documentation, and no visibility into what happens after a prescription is given. Front desks are overwhelmed with calls and manual token management.
              </p>
            </div>
            
            <div className={styles.solution}>
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>
                How Ayu Solves It
              </h3>
              <p className={styles.text}>
                Ayu keeps patient records organized in one place. It makes patient history easy to pull up mid-consultation, connects diagnosis to prescription to pharmacy in one flow, and completely removes the repetitive admin work from the front desk.
              </p>
            </div>
          </div>

          <div className={`${styles.value} reveal`} style={{ transitionDelay: '0.2s', alignSelf: 'center' }}>
            <p className={styles.valueText}>
              "Doctors spend more time on clinical decisions and less time managing information."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
