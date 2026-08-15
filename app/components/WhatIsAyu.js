import styles from './WhatIsAyu.module.css';

export default function WhatIsAyu() {
  return (
    <section className={`${styles.whatIs} section--alt`} id="what-is-ayu">
      <div className="container">
        <div className="reveal">
          <span className="section-label">What is Ayu</span>
          <div className={styles.content}>
            <p className={styles.text}>
              Ayu is a healthcare platform built entirely on WhatsApp. It removes the wasted travel,
              waiting, and repeat trips patients face for basic checkups and reports. Instead of forcing
              patients to download a new app, we bring the hospital's services to the app they already
              use every day.
            </p>
            <p className={styles.text}>
              It also acts as the <span className={styles.highlight}>operating layer</span> for doctors, clinics,
              hospitals, labs, and pharmacies to coordinate faster — managing nurse assignments, patient
              prioritization, and reducing the front-desk load.
            </p>
          </div>
        </div>

        <div className={styles.features}>
          <div className={`${styles.feature} reveal`} style={{ transitionDelay: '0.1s' }}>
            <div className={styles.icon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className={styles.title}>OPD Bookings</h3>
            <p className={styles.desc}>Book appointments and manage tokens directly through WhatsApp. No standing in line.</p>
          </div>
          
          <div className={`${styles.feature} reveal`} style={{ transitionDelay: '0.2s' }}>
            <div className={styles.icon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <h3 className={styles.title}>Lab Reports</h3>
            <p className={styles.desc}>Receive and understand diagnostic reports without making a second trip to the clinic.</p>
          </div>

          <div className={`${styles.feature} reveal`} style={{ transitionDelay: '0.3s' }}>
            <div className={styles.icon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className={styles.title}>Medicine Reminders</h3>
            <p className={styles.desc}>Automated follow-ups and pill reminders sent exactly when patients need them.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
