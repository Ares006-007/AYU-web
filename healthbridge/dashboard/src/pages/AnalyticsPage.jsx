import { useState, useEffect } from 'react';
import api from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Calendar, CreditCard } from 'lucide-react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch today's stats (queue + payments)
    Promise.all([
      api.get('/queue/stats'),
      api.get('/payments/summary'),
    ]).then(([queueRes, payRes]) => {
      setStats({ queue: queueRes.data.stats, payments: payRes.data.today });
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Mock weekly trend data for V1 visualization
  const weeklyData = [
    { day: 'Mon', patients: 32, payments: 18400 },
    { day: 'Tue', patients: 41, payments: 24600 },
    { day: 'Wed', patients: 28, payments: 15200 },
    { day: 'Thu', patients: 55, payments: 33100 },
    { day: 'Fri', patients: 48, payments: 28800 },
    { day: 'Sat', patients: 62, payments: 38200 },
    { day: 'Today', patients: parseInt(stats?.queue?.completed || 0) + parseInt(stats?.queue?.waiting || 0), payments: parseInt(stats?.payments?.totalCollected?.replace('₹','') || 0) * 100 },
  ];

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <>
      <div className="page-header">
        <div><h2>Analytics</h2><p>OPD performance overview — Phase 1</p></div>
      </div>

      <div className="page-body">
        {/* Today's quick stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Total OPD Today</div>
              <div className="stat-value">
                {(parseInt(stats?.queue?.waiting||0) + parseInt(stats?.queue?.in_progress||0) + parseInt(stats?.queue?.completed||0))}
              </div>
            </div>
            <div className="stat-icon blue"><Users size={22} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Completed</div>
              <div className="stat-value">{stats?.queue?.completed || 0}</div>
            </div>
            <div className="stat-icon green"><Calendar size={22} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Avg Consult Time</div>
              <div className="stat-value">{stats?.queue?.avg_consult_min || '—'}</div>
              <div className="stat-sub">minutes</div>
            </div>
            <div className="stat-icon blue"><TrendingUp size={22} /></div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Collected Today</div>
              <div className="stat-value">{stats?.payments?.totalCollected || '₹0'}</div>
            </div>
            <div className="stat-icon green"><CreditCard size={22} /></div>
          </div>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header"><span className="card-title">Weekly Patient Volume</span></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="patients" fill="#2563EB" radius={[4,4,0,0]} name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">Weekly Revenue (₹)</span></div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/100).toFixed(0)}`} />
                  <Tooltip formatter={(v) => [`₹${(v/100).toFixed(0)}`, 'Revenue']} />
                  <Line type="monotone" dataKey="payments" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="alert alert-info" style={{ marginTop: 20 }}>
          📊 <strong>Phase 1 Analytics</strong> — Advanced analytics with historical trends, department-wise breakdown, and conversion metrics are coming in Phase 2.
        </div>
      </div>
    </>
  );
}
