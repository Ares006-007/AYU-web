import styles from './Stakeholders.module.css';

export default function Stakeholders() {
  return (
    <section className={styles.stakeholders}>
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <span className="eyebrow">Who it serves</span>
          <h2 className="heading-section">
            Built for every side of the clinic.
          </h2>
        </div>

        <div className={styles.grid}>
          {/* Featured card — Patients */}
          <div className={`${styles.card} ${styles.cardFeatured} reveal`}>
            <div className={styles.cardInner}>
              <div className={styles.cardTag}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Patients
              </div>
              <h3 className={styles.cardTitle}>
                Healthcare without the runaround
              </h3>
              <p className={styles.cardBody}>
                No new apps to install. Patients book appointments, receive and understand lab reports, get medicine reminders, and maintain a unified health profile — all through WhatsApp messages.
              </p>
              <div className={styles.cardHighlight}>
                <span className={styles.highlightLabel}>Before Ayu:</span> 3+ trips for a routine checkup cycle
              </div>
              <div className={styles.cardHighlight}>
                <span className={styles.highlightLabel}>After Ayu:</span> 1 visit, rest managed digitally
              </div>
            </div>
          </div>

          {/* Doctors */}
          <div className={`${styles.card} reveal`} style={{ transitionDelay: '0.1s' }}>
            <div className={styles.cardInner}>
              <div className={styles.cardTag}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                Doctors
              </div>
              <h3 className={styles.cardTitle}>
                Less admin, more medicine
              </h3>
              <p className={styles.cardBody}>
                Consolidated patient history, automated token management, digital prescriptions that flow directly to pharmacies. Doctors focus on clinical decisions, not paperwork.
              </p>
            </div>
          </div>

          {/* Pharmacies */}
          <div className={`${styles.card} reveal`} style={{ transitionDelay: '0.2s' }}>
            <div className={styles.cardInner}>
              <div className={styles.cardTag}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Pharmacies
              </div>
              <h3 className={styles.cardTitle}>
                Prescriptions on arrival
              </h3>
              <p className={styles.cardBody}>
                Digital prescriptions arrive before the patient walks in. No handwriting to decipher, no phone tag with doctors. Real-time demand visibility and zero transcription errors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
