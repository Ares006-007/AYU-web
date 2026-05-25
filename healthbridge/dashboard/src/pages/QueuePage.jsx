import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';
import { Users, Clock, CheckCircle, SkipForward, ChevronRight, RefreshCw } from 'lucide-react';

const REFRESH_INTERVAL = 10_000; // 10 seconds

export default function QueuePage() {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [queueRes, statsRes, doctorRes] = await Promise.all([
        api.get('/queue/today', { params: { doctorId: selectedDoctor || undefined } }),
        api.get('/queue/stats'),
        api.get('/doctors'),
      ]);
      setQueue(queueRes.data.queue);
      setStats(statsRes.data.stats);
      setDoctors(doctorRes.data.doctors);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Queue fetch failed:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  const advanceToken = async (tokenId) => {
    setActionLoading(tokenId);
    try {
      await api.patch(`/queue/${tokenId}/advance`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to advance token');
    } finally {
      setActionLoading(null);
    }
  };

  const skipToken = async (tokenId) => {
    if (!confirm('Mark this patient as skipped (not present)?')) return;
    setActionLoading(tokenId);
    try {
      await api.patch(`/queue/${tokenId}/skip`);
      await fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to skip token');
    } finally {
      setActionLoading(null);
    }
  };

  const statusOrder = { 'in_progress': 0, 'waiting': 1, 'called': 2, 'completed': 3, 'skipped': 4 };
  const sortedQueue = [...queue].sort((a, b) =>
    (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99) || a.token_number - b.token_number
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Live Queue</h2>
          <p>Today's OPD queue — auto-refreshes every 10 seconds</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Last updated: {lastRefresh.toLocaleTimeString('en-IN')}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={fetchData} id="queue-refresh-btn">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Waiting</div>
                <div className="stat-value">{stats.waiting || 0}</div>
              </div>
              <div className="stat-icon amber"><Clock size={22} /></div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">In Consultation</div>
                <div className="stat-value">{stats.in_progress || 0}</div>
              </div>
              <div className="stat-icon blue"><Users size={22} /></div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completed || 0}</div>
              </div>
              <div className="stat-icon green"><CheckCircle size={22} /></div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-label">Avg Consult Time</div>
                <div className="stat-value">{stats.avg_consult_min || '—'}</div>
                <div className="stat-sub">minutes</div>
              </div>
              <div className="stat-icon green"><Clock size={22} /></div>
            </div>
          </div>
        )}

        {/* Filter by doctor */}
        <div className="filters-row">
          <select
            id="queue-doctor-filter"
            className="form-select"
            style={{ width: 240 }}
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.full_name} — {d.specialty}</option>
            ))}
          </select>
        </div>

        {/* Queue Table */}
        <div className="card">
          <div className="card-header" style={{ padding: '20px 24px' }}>
            <span className="card-title">Today's Queue ({sortedQueue.length} patients)</span>
          </div>
          <div className="table-wrap">
            {loading ? (
              <div className="loading-screen"><div className="spinner" /></div>
            ) : sortedQueue.length === 0 ? (
              <div className="empty-state">
                <Users className="icon" />
                <h3>No patients in queue</h3>
                <p>Queue is empty or appointments haven't started yet.</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Patient</th>
                    <th>Health ID</th>
                    <th>Doctor</th>
                    <th>Complaint</th>
                    <th>Alert Sent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedQueue.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <span className={`token-number ${row.status}`}>
                          #{row.token_number}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{row.patient_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.booking_phone}</div>
                      </td>
                      <td><span className="health-id">{row.health_id}</span></td>
                      <td>
                        <div>{row.doctor_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.specialty}</div>
                      </td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row.chief_complaint || <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        <span style={{ fontSize: 12 }}>
                          {row.alert_sent ? '✅ Sent' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${row.status?.replace('_', '-')}`}>
                          {row.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        {(row.status === 'waiting' || row.status === 'in_progress' || row.status === 'called') && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button
                              id={`advance-${row.id}`}
                              className="btn btn-success btn-sm"
                              onClick={() => advanceToken(row.id)}
                              disabled={actionLoading === row.id}
                            >
                              <ChevronRight size={14} />
                              Done
                            </button>
                            {row.status === 'waiting' && (
                              <button
                                id={`skip-${row.id}`}
                                className="btn btn-ghost btn-sm"
                                onClick={() => skipToken(row.id)}
                                disabled={actionLoading === row.id}
                              >
                                <SkipForward size={14} />
                                Skip
                              </button>
                            )}
                          </div>
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
    </>
  );
}
