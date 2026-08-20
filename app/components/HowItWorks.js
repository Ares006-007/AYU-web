import styles from './HowItWorks.module.css';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      platform: 'WhatsApp',
      title: 'Patients book, track, and manage — on WhatsApp',
      body: 'No app downloads. Patients book OPD tokens, receive lab reports explained in plain language, and get medicine reminders in the chat app they already use daily.',
      detail: 'Supports Hindi, Telugu, Tamil, and English natively.',
    },
    {
      number: '02',
      platform: 'Dashboard',
      title: 'Doctors get a clinical command center',
      body: 'A fast admin dashboard that consolidates patient history, manages appointment queues, generates digital prescriptions, and connects diagnosis directly to pharmacy fulfillment.',
      detail: 'Reduces front-desk load and documentation time.',
    },
    {
      number: '03',
      platform: 'Partner App',
      title: 'Pharmacies receive prescriptions instantly',
      body: 'Digital prescriptions flow directly from doctor to pharmacy — no manual entry, no phone calls. Pharmacies see demand in real-time and fulfill orders precisely.',
      detail: 'Eliminates prescription transcription errors.',
    },
  ];

  return (
    <section className={`${styles.howItWorks} section--border`} id="work">
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <span className="eyebrow">How it works</span>
          <h2 className="heading-section">
            Three interfaces. One connected workflow.
          </h2>
          <p className="text-large" style={{ maxWidth: '560px' }}>
            Ayu gives each stakeholder the right tool — then connects them behind the scenes so nothing falls through the cracks.
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`${styles.step} ${i % 2 !== 0 ? styles.stepReversed : ''} reveal`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className={styles.stepContent}>
                <div className={styles.stepMeta}>
                  <span className={styles.stepNumber}>{step.number}</span>
                  <span className={styles.stepPlatform}>{step.platform}</span>
                </div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
                <p className={styles.stepDetail}>{step.detail}</p>
              </div>
              <div className={styles.stepVisual}>
                <StepIllustration type={step.platform} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StepIllustration({ type }) {
  if (type === 'WhatsApp') {
    return (
      <div className={styles.mockChat}>
        <div className={styles.chatBubbleIn}>
          <span className={styles.chatText}>I need an appointment for today</span>
          <span className={styles.chatTime}>2:30 PM</span>
        </div>
        <div className={styles.chatBubbleOut}>
          <span className={styles.chatText}>Dr. Reddy is available at 4:30 PM. Token #12 confirmed ✓</span>
          <span className={styles.chatTime}>2:30 PM</span>
        </div>
        <div className={styles.chatBubbleIn}>
          <span className={styles.chatText}>Can you send my lab report?</span>
          <span className={styles.chatTime}>2:31 PM</span>
        </div>
        <div className={styles.chatBubbleOut}>
          <span className={styles.chatText}>Here's your CBC report. Key finding: Hemoglobin is normal at 14.2 g/dL ✓</span>
          <span className={styles.chatTime}>2:31 PM</span>
        </div>
      </div>
    );
  }

  if (type === 'Dashboard') {
    return (
      <div className={styles.mockDash}>
        <div className={styles.dashHeader}>
          <div className={styles.dashDot} />
          <div className={styles.dashDot} />
          <div className={styles.dashDot} />
        </div>
        <div className={styles.dashBody}>
          <div className={styles.dashSidebar}>
            <div className={styles.sidebarItem} style={{ width: '70%' }} />
            <div className={styles.sidebarItem} style={{ width: '50%' }} />
            <div className={styles.sidebarItem} style={{ width: '85%' }} />
            <div className={styles.sidebarItem} style={{ width: '60%' }} />
          </div>
          <div className={styles.dashMain}>
            <div className={styles.dashRow} style={{ width: '100%' }} />
            <div className={styles.dashRow} style={{ width: '80%' }} />
            <div className={styles.dashRow} style={{ width: '65%' }} />
            <div className={styles.dashCard} />
            <div className={styles.dashCard} />
          </div>
        </div>
      </div>
    );
  }

  // Partner App
  return (
    <div className={styles.mockApp}>
      <div className={styles.appStatusBar} />
      <div className={styles.appCard}>
        <div className={styles.appCardHeader}>
          <div className={styles.appAvatar} />
          <div>
            <div className={styles.appLine} style={{ width: '100px' }} />
            <div className={styles.appLine} style={{ width: '60px', opacity: 0.5 }} />
          </div>
        </div>
        <div className={styles.appPills}>
          <span className={styles.appPill}>Paracetamol 500mg</span>
          <span className={styles.appPill}>Amoxicillin</span>
        </div>
      </div>
      <div className={styles.appCard}>
        <div className={styles.appCardHeader}>
          <div className={styles.appAvatar} />
          <div>
            <div className={styles.appLine} style={{ width: '80px' }} />
            <div className={styles.appLine} style={{ width: '50px', opacity: 0.5 }} />
          </div>
        </div>
        <div className={styles.appPills}>
          <span className={styles.appPill}>Metformin 500mg</span>
        </div>
      </div>
    </div>
  );
}
