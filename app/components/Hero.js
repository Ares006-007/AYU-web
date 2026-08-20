import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section className={styles.hero} id="hero">
      <div className="container">
        <div className={styles.content}>
          <h1 className="text-display">
            Run your clinic<br />entirely on WhatsApp.
          </h1>

          <p className="text-body-lg" style={{ marginTop: '2rem', maxWidth: '640px' }}>
            Ayu connects your doctors, patients, and local pharmacies without asking anyone to download a new app.
          </p>

          <div className={styles.actions}>
            <a href="#mechanism" className="btn btn-primary">
              See the clinic dashboard
            </a>
            <a
              href="https://wa.me/919876543210?text=Hi%20AYU"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Try the patient experience
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
