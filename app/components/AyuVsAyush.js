import styles from './AyuVsAyush.module.css';

export default function AyuVsAyush() {
  return (
    <section className={styles.ayuVs}>
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <span className="section-label">Ayu & Ayush</span>
          <h2 className="section-heading">Platform vs Co-pilot</h2>
          <p className="section-desc" style={{ margin: '0 auto' }}>
            We often get asked about the difference between Ayu and Ayush. Here is how they work together.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Ayu Card */}
          <div className={`${styles.box} ${styles.boxAyu} reveal`}>
            <div className={styles.boxHeader}>
              <div className={styles.icon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3 className={styles.name}>Ayu</h3>
            </div>
            <p className={styles.desc}>
              The platform and operating layer. This is the infrastructure that connects patients, doctors, and pharmacies.
            </p>
            <div className={styles.list}>
              <div className={styles.listItem}>
                <svg className={styles.listIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>Handles bookings, reminders, and prescriptions</p>
              </div>
              <div className={styles.listItem}>
                <svg className={styles.listIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>Delivers the WhatsApp experience to patients</p>
              </div>
              <div className={styles.listItem}>
                <svg className={styles.listIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>Provides dashboards for providers</p>
              </div>
            </div>
          </div>

          {/* Ayush Card */}
          <div className={`${styles.box} ${styles.boxAyush} reveal`} style={{ transitionDelay: '0.15s' }}>
            <div className={styles.boxHeader}>
              <div className={styles.icon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
                  <path d="M4 10a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" />
                  <path d="M20 10a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" />
                  <path d="M12 16a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" />
                  <line x1="12" y1="8" x2="12" y2="16" />
                  <line x1="6" y1="12" x2="18" y2="12" />
                </svg>
              </div>
              <h3 className={styles.name}>Ayush</h3>
            </div>
            <p className={styles.desc}>
              The AI co-pilot built inside Ayu. It reads records and supports doctors, but never replaces their judgment.
            </p>
            <div className={styles.list}>
              <div className={styles.listItem}>
                <svg className={styles.listIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>Summarizes complex patient history instantly</p>
              </div>
              <div className={styles.listItem}>
                <svg className={styles.listIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>Highlights critical lab report anomalies</p>
              </div>
              <div className={styles.listItem}>
                <svg className={styles.listIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p>Helps doctors prepare before the patient enters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
