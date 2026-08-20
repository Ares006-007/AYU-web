import styles from './Contact.module.css';

export default function Contact() {
  return (
    <section className={styles.contact} id="contact">
      <div className="container">
        <div className={styles.content}>
          <h2 className="text-h1" style={{ color: '#ffffff' }}>
            Ready to modernize your clinic?
          </h2>
          
          <p className="text-body-lg" style={{ color: '#a3a3a3', marginTop: '1.5rem', maxWidth: '600px' }}>
            We onboard new clinics in under 48 hours. No hardware installation required.
          </p>

          <div className={styles.actions}>
            <a
              href="https://wa.me/919876543210?text=Hi%20Ayu%2C%20I%20want%20to%20modernize%20my%20clinic."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaBtn}
            >
              Message us on WhatsApp
            </a>
            <a href="mailto:hello@ayuhealth.in" className={styles.secondaryBtn}>
              Email sales
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
