import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  return (
    <section className={styles.reality} id="reality">
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.left}>
            <span className="text-mono">The Reality</span>
          </div>
          <div className={styles.right}>
            <h2 className="text-h2">
              Right now, your patients make three separate trips for a single checkup cycle.
            </h2>
            <div className={styles.body}>
              <p className="text-body-lg">
                One trip to book the appointment. A second to consult the doctor and get lab tests. A third to collect medicines and discuss the report. That is broken.
              </p>
              <p className="text-body-lg">
                Ayu reduces that to one visit. We connect the booking, the consultation, the lab report, and the pharmacy fulfillment into a single digital thread on WhatsApp.
              </p>
            </div>
            
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statNum}>300+</span>
                <span className={styles.statLabel}>Active patients</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>67</span>
                <span className={styles.statLabel}>Healthcare partners</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNum}>4</span>
                <span className={styles.statLabel}>Languages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
