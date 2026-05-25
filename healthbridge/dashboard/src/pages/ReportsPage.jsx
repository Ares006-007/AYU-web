import { useState, useEffect } from 'react';
import api from '../api/client';
import { Upload, Send, FileText, X } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadData, setUploadData] = useState({ patientId: '', reportName: '', reportType: 'lab', sendToPatient: true });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data.reports);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('report', file);
      form.append('patientId', uploadData.patientId);
      form.append('reportName', uploadData.reportName);
      form.append('reportType', uploadData.reportType);
      form.append('sendToPatient', uploadData.sendToPatient ? 'true' : 'false');

      await api.post('/reports/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage({ type: 'success', text: `Report uploaded${uploadData.sendToPatient ? ' and sent to patient!' : '!'}` });
      setShowUpload(false);
      setFile(null);
      setUploadData({ patientId: '', reportName: '', reportType: 'lab', sendToPatient: true });
      fetchReports();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Upload failed' });
    } finally { setUploading(false); }
  };

  const sendReport = async (reportId) => {
    try {
      await api.post(`/reports/${reportId}/send`);
      setMessage({ type: 'success', text: 'Report sent to patient via WhatsApp!' });
      fetchReports();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Send failed' });
    }
  };

  return (
    <>
      <div className="page-header">
        <div><h2>Reports</h2><p>Upload and send patient reports via WhatsApp</p></div>
        <button id="upload-report-btn" className="btn btn-primary" onClick={() => setShowUpload(true)}>
          <Upload size={16} /> Upload Report
        </button>
      </div>

      <div className="page-body">
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
            <button onClick={() => setMessage(null)} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer' }}><X size={14} /></button>
          </div>
        )}

        <div className="card">
          <div className="table-wrap">
            {loading ? <div className="loading-screen"><div className="spinner" /></div>
            : reports.length === 0 ? (
              <div className="empty-state"><FileText className="icon" /><h3>No reports yet</h3><p>Upload a report to get started.</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Report</th><th>Patient</th><th>Type</th><th>Status</th><th>Uploaded</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.report_name}</td>
                      <td>
                        <div>{r.patient_name}</div>
                        <span className="health-id">{r.health_id}</span>
                      </td>
                      <td>{r.report_type}</td>
                      <td><span className={`badge ${r.status}`}>{r.status}</span></td>
                      <td>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                      <td>
                        {r.status !== 'sent' && (
                          <button
                            id={`send-report-${r.id}`}
                            className="btn btn-primary btn-sm"
                            onClick={() => sendReport(r.id)}
                          >
                            <Send size={12} /> Send on WhatsApp
                          </button>
                        )}
                        {r.status === 'sent' && (
                          <span style={{ fontSize: 12, color: 'var(--brand-accent)' }}>✅ Sent {r.sent_at && `· ${new Date(r.sent_at).toLocaleDateString('en-IN')}`}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Upload Report</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowUpload(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label className="form-label">Patient ID (UUID)</label>
                <input id="upload-patient-id" className="form-input" placeholder="Patient UUID from patient profile" required
                  value={uploadData.patientId} onChange={(e) => setUploadData({ ...uploadData, patientId: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Report Name</label>
                <input id="upload-report-name" className="form-input" placeholder="e.g. CBC Blood Test Results" required
                  value={uploadData.reportName} onChange={(e) => setUploadData({ ...uploadData, reportName: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Report Type</label>
                <select id="upload-report-type" className="form-select"
                  value={uploadData.reportType} onChange={(e) => setUploadData({ ...uploadData, reportType: e.target.value })}>
                  <option value="lab">Lab Report</option>
                  <option value="radiology">Radiology / X-Ray</option>
                  <option value="prescription">Prescription</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">File (PDF or Image, max 20MB)</label>
                <input id="upload-file" type="file" accept=".pdf,image/*" required
                  onChange={(e) => setFile(e.target.files[0])} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <input id="send-to-patient" type="checkbox" checked={uploadData.sendToPatient}
                  onChange={(e) => setUploadData({ ...uploadData, sendToPatient: e.target.checked })} />
                <label htmlFor="send-to-patient" style={{ fontSize: 13 }}>Send to patient via WhatsApp immediately</label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={uploading}>
                  <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
