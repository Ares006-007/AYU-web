import styles from './Stakeholders.module.css';

export default function Stakeholders() {
  return (
    <section className={styles.mechanism} id="mechanism">
      <div className="container">
        <div className={styles.header}>
          <span className="text-mono">The Mechanism</span>
          <h2 className="text-h2" style={{ marginTop: '1rem', maxWidth: '640px' }}>
            Ayu gives each stakeholder the right tool, then connects them behind the scenes.
          </h2>
        </div>

        <div className={styles.blocks}>
          {/* Patients Block */}
          <div className={styles.block}>
            <div className={styles.blockNum}>01</div>
            <div className={styles.blockContent}>
              <h3 className="text-h3">For Patients: WhatsApp</h3>
              <p className="text-body-lg">
                Patients book and get reports where they already chat. No app downloads required. Appointments, lab reports explained in plain language, and medicine reminders all happen natively in WhatsApp.
              </p>
              <a href="#" className="link-strict">View the patient flow</a>
            </div>
          </div>

          {/* Doctors Block */}
          <div className={`${styles.block} ${styles.blockOffset}`}>
            <div className={styles.blockNum}>02</div>
            <div className={styles.blockContent}>
              <h3 className="text-h3">For Doctors: The Command Center</h3>
              <p className="text-body-lg">
                A fast admin dashboard that removes the front desk bottleneck. It consolidates patient history, manages the token queue, and generates digital prescriptions that flow directly to pharmacies.
              </p>
              <a href="#" className="link-strict">Explore the dashboard</a>
            </div>
          </div>

          {/* Pharmacies Block */}
          <div className={styles.block}>
            <div className={styles.blockNum}>03</div>
            <div className={styles.blockContent}>
              <h3 className="text-h3">For Pharmacies: Partner App</h3>
              <p className="text-body-lg">
                Prescriptions arrive digitally before the patient walks in. No handwriting to decipher, no phone tag with doctors. Pharmacies see demand in real-time and fulfill orders with zero transcription errors.
              </p>
              <a href="#" className="link-strict">See pharmacy integration</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
