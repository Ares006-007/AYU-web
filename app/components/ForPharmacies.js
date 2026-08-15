import styles from './Stakeholder.module.css';

export default function ForPharmacies() {
  return (
    <section className={styles.stakeholder} id="for-pharmacies">
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <div className={`${styles.icon} ${styles['icon--pharmacy']}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="12" y1="8" x2="12" y2="16" />
              <line x1="8" y1="12" x2="16" y2="12" />
            </svg>
          </div>
          <span className="platform-tag platform-tag--app" style={{ marginBottom: '1rem' }}>App</span>
          <h2 className="section-heading">For Pharmacies</h2>
        </div>

        <div className={styles.layout}>
          <div className={`${styles.content} reveal`}>
            <div className={styles.problem}>
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                The Problem
              </h3>
              <p className={styles.text}>
                Pharmacies deal with manual prescriptions, unclear medicine availability, and disconnected communication with patients and doctors. They wait for walk-ins instead of connecting digitally with patients who need medicines.
              </p>
            </div>
            
            <div className={styles.solution}>
              <h3>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>
                How Ayu Solves It
              </h3>
              <p className={styles.text}>
                Ayu sends prescriptions digitally to pharmacies, connecting them with patients exactly when they need medicines. It manages prescription-based orders, provides visibility into demand, and links the prescription directly to fulfillment.
              </p>
            </div>
          </div>

          <div className={`${styles.value} reveal`} style={{ transitionDelay: '0.2s', alignSelf: 'center' }}>
            <p className={styles.valueText}>
              "Pharmacies get more efficient fulfillment and more relevant customers."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
