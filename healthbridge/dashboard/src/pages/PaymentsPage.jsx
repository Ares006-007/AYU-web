import { useState, useEffect } from 'react';
import api from '../api/client';
import { CreditCard, Send, X } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ appointmentId: '', amountPaise: '', description: '' });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { fetchData(); }, [statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, sumRes] = await Promise.all([
        api.get('/payments', { params: { status: statusFilter || undefined } }),
        api.get('/payments/summary'),
      ]);
      setPayments(payRes.data.payments);
      setSummary(sumRes.data.today);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const createPaymentLink = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const amount = Math.round(parseFloat(form.amountPaise) * 100); // convert ₹ to paise
      await api.post('/payments/create-link', {
        appointmentId: form.appointmentId,
        amountPaise: amount,
        description: form.description || undefined,
      });
      setMessage({ type: 'success', text: 'Payment link created and sent to patient via WhatsApp!' });
      setShowModal(false);
      setForm({ appointmentId: '', amountPaise: '', description: '' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create payment link' });
    } finally { setSending(false); }
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Payments</h2><p>Send payment links and track collections</p></div>
        <button id="create-payment-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Send size={16} /> Send Payment Link
        </button>
      </div>

      <div className="page-body">
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
            <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>
          </div>
        )}

        {summary && (
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <div className="stat-card">
              <div className="stat-info"><div className="stat-label">Collected Today</div><div className="stat-value">{summary.totalCollected}</div></div>
              <div className="stat-icon green"><CreditCard size={22} /></div>
            </div>
            <div className="stat-card">
              <div className="stat-info"><div className="stat-label">Paid Today</div><div className="stat-value">{summary.paidCount}</div></div>
              <div className="stat-icon green"><CreditCard size={22} /></div>
            </div>
            <div className="stat-card">
              <div className="stat-info"><div className="stat-label">Pending Amount</div><div className="stat-value">{summary.pendingAmount}</div></div>
              <div className="stat-icon amber"><CreditCard size={22} /></div>
            </div>
            <div className="stat-card">
              <div className="stat-info"><div className="stat-label">Pending Count</div><div className="stat-value">{summary.pendingCount}</div></div>
              <div className="stat-icon amber"><CreditCard size={22} /></div>
            </div>
          </div>
        )}

        <div className="filters-row">
          <select id="status-filter" className="form-select" style={{ width: 180 }}
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="link_sent">Link Sent</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        <div className="card">
          <div className="table-wrap">
            {loading ? <div className="loading-screen"><div className="spinner" /></div>
            : payments.length === 0 ? (
              <div className="empty-state"><CreditCard className="icon" /><h3>No payments found</h3></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Amount</th><th>Status</th><th>Sent</th><th>Paid</th></tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{p.patient_name}</div>
                        <span className="health-id">{p.health_id}</span>
                      </td>
                      <td>{p.doctor_name}</td>
                      <td>{new Date(p.appointment_date).toLocaleDateString('en-IN')}</td>
                      <td style={{ fontWeight: 700 }}>₹{(p.amount_paise / 100).toFixed(0)}</td>
                      <td><span className={`badge ${p.status?.replace('_','-')}`}>{p.status?.replace('_',' ')}</span></td>
                      <td>{p.link_sent_at ? new Date(p.link_sent_at).toLocaleDateString('en-IN') : '—'}</td>
                      <td>{p.paid_at ? new Date(p.paid_at).toLocaleDateString('en-IN') : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Send Payment Link</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={createPaymentLink}>
              <div className="form-group">
                <label className="form-label">Appointment ID (UUID)</label>
                <input id="pay-appointment-id" className="form-input" placeholder="Appointment UUID" required
                  value={form.appointmentId} onChange={(e) => setForm({ ...form, appointmentId: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input id="pay-amount" className="form-input" type="number" min="1" step="1" placeholder="e.g. 500" required
                  value={form.amountPaise} onChange={(e) => setForm({ ...form, amountPaise: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input id="pay-description" className="form-input" placeholder="e.g. Consultation Fee"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={sending}>
                  <Send size={14} /> {sending ? 'Sending...' : 'Send Link via WhatsApp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
