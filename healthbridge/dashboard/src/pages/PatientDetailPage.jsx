import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, FileText, CreditCard, Upload } from 'lucide-react';

export default function PatientDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('visits');

  useEffect(() => {
    api.get(`/patients/${id}`).then((res) => {
      setData(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!data) return <div className="page-body"><p>Patient not found.</p></div>;

  const { patient, visits, reports } = data;

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/patients" className="btn btn-ghost btn-sm"><ArrowLeft size={14} /></Link>
          <div>
            <h2>{patient.full_name}</h2>
            <p style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="health-id">{patient.health_id}</span>
              {patient.city && <span>· {patient.city}</span>}
              {patient.primary_phone && <span>· {patient.primary_phone}</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
          {['visits', 'reports'].map((tab) => (
            <button
              key={tab}
              id={`tab-${tab}`}
              className="btn btn-ghost btn-sm"
              style={{
                borderRadius: '8px 8px 0 0',
                borderBottom: activeTab === tab ? '2px solid var(--brand-primary)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--brand-primary)' : undefined,
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'visits' && (
          <div className="card">
            <div className="table-wrap">
              {visits.length === 0 ? (
                <div className="empty-state"><p>No visits recorded yet.</p></div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Date</th><th>Doctor</th><th>Token</th><th>Complaint</th>
                      <th>Diagnosis</th><th>Payment</th><th>Follow-up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((v) => (
                      <tr key={v.id}>
                        <td>{new Date(v.appointment_date).toLocaleDateString('en-IN')}</td>
                        <td>
                          <div style={{ fontWeight: 600 }}>{v.doctor_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.specialty}</div>
                        </td>
                        <td>#{v.token_number}</td>
                        <td>{v.chief_complaint || '—'}</td>
                        <td>{v.diagnosis_notes || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                        <td>
                          {v.payment_status ? (
                            <span className={`badge ${v.payment_status}`}>{v.payment_status}</span>
                          ) : '—'}
                        </td>
                        <td>{v.follow_up_date ? new Date(v.follow_up_date).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Reports ({reports.length})</span>
              <Link to={`/reports?patientId=${id}`} className="btn btn-primary btn-sm">
                <Upload size={14} /> Upload Report
              </Link>
            </div>
            <div className="table-wrap">
              {reports.length === 0 ? (
                <div className="empty-state"><FileText className="icon" /><p>No reports uploaded yet.</p></div>
              ) : (
                <table>
                  <thead>
                    <tr><th>Report</th><th>Type</th><th>Status</th><th>Date</th></tr>
                  </thead>
                  <tbody>
                    {reports.map((r) => (
                      <tr key={r.id}>
                        <td style={{ fontWeight: 600 }}>{r.report_name}</td>
                        <td>{r.report_type}</td>
                        <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                        <td>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
