import styles from './Traction.module.css';

export default function Traction() {
  return (
    <section className={`${styles.traction} section--alt`} id="traction">
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <span className="section-label">Traction</span>
          <h2 className="section-heading">Where we are right now</h2>
          <p className={styles.text}>
            Ayu has completed open beta testing and is currently actively validating the platform in the real world. We aren't a massive corporate entity yet; we are a startup building tools that people actually use.
          </p>
        </div>

        <div className={styles.grid}>
          <div className={`${styles.card} reveal`} style={{ transitionDelay: '0.1s' }}>
            <div className={styles.number}>300+</div>
            <div className={styles.label}>Active Users</div>
          </div>
          <div className={`${styles.card} reveal`} style={{ transitionDelay: '0.2s' }}>
            <div className={styles.number}>30</div>
            <div className={styles.label}>Local Clinics</div>
          </div>
          <div className={`${styles.card} reveal`} style={{ transitionDelay: '0.3s' }}>
            <div className={styles.number}>15</div>
            <div className={styles.label}>Diagnostic Labs</div>
          </div>
          <div className={`${styles.card} reveal`} style={{ transitionDelay: '0.4s' }}>
            <div className={styles.number}>22</div>
            <div className={styles.label}>Pharmacies</div>
          </div>
        </div>
      </div>
    </section>
  );
}
