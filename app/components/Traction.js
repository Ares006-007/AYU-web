import styles from './Traction.module.css';

export default function Traction() {
  return (
    <section className={styles.traction} id="traction">
      <div className="container">
        <div className={styles.layout}>
          <div className={`${styles.content} reveal`}>
            <span className="eyebrow">Traction</span>
            <h2 className="heading-section">
              Real usage,<br />not vanity metrics.
            </h2>
            <p className="text-large" style={{ marginTop: '1rem' }}>
              Ayu has completed open beta and is actively deployed with real clinics in India. These numbers come from daily usage, not a demo environment.
            </p>
          </div>

          <div className={`${styles.metrics} reveal`} style={{ transitionDelay: '0.1s' }}>
            <div className={styles.metric}>
              <span className={styles.metricNumber}>300+</span>
              <span className={styles.metricLabel}>Active patients</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricNumber}>30</span>
              <span className={styles.metricLabel}>Local clinics</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricNumber}>15</span>
              <span className={styles.metricLabel}>Diagnostic labs</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricNumber}>22</span>
              <span className={styles.metricLabel}>Pharmacies</span>
            </div>
          </div>
        </div>

        <div className={`${styles.milestones} reveal`} style={{ transitionDelay: '0.2s' }}>
          <div className={styles.milestone}>
            <div className={styles.milestoneIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div>
              <span className={styles.milestoneTitle}>Open beta completed</span>
              <span className={styles.milestoneDesc}>Validated core workflows with real healthcare providers</span>
            </div>
          </div>
          <div className={styles.milestone}>
            <div className={styles.milestoneIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div>
              <span className={styles.milestoneTitle}>Multi-language support</span>
              <span className={styles.milestoneDesc}>Hindi, Telugu, Tamil, and English — serving diverse patient populations</span>
            </div>
          </div>
          <div className={styles.milestone}>
            <div className={styles.milestoneIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" aria-hidden="true">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div>
              <span className={styles.milestoneTitle}>End-to-end workflow live</span>
              <span className={styles.milestoneDesc}>Booking → consultation → prescription → pharmacy fulfillment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
