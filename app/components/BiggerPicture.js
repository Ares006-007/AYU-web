import styles from './BiggerPicture.module.css';

export default function BiggerPicture() {
  const Arrow = () => (
    <svg className={styles.flowIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );

  return (
    <section className={styles.bigger}>
      <div className="container">
        <div className="reveal">
          <span className={styles.label}>The Architecture</span>
          <h2 className={styles.heading}>It's not three separate products.</h2>
          
          <p className={styles.text}>
            The real value of Ayu is the connection between doctors, patients, and pharmacies. Instead of each part of healthcare working in isolation, Ayu creates one connected workflow.
          </p>

          <div className={styles.flow}>
            <span>Doctor</span> <Arrow /> 
            <span>Prescription</span> <Arrow /> 
            <span>Patient</span> <Arrow /> 
            <span>Pharmacy</span> <Arrow /> 
            <span>Medicine</span> <Arrow /> 
            <span>Treatment</span>
          </div>

          <div className={styles.closing}>
            "Ayu is a healthcare platform that connects doctors, patients, and pharmacies — making the journey from consultation to prescription to medicine simpler, more organized, and more connected."
          </div>
        </div>
      </div>
    </section>
  );
}
