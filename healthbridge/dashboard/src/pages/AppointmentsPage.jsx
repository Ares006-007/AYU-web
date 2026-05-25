import { useState, useEffect } from 'react';
import api from '../api/client';
import { Calendar, Clock, Search } from 'lucide-react';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedDoctor]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apptRes, docRes] = await Promise.all([
        api.get('/appointments', { params: { date: selectedDate, doctorId: selectedDoctor || undefined } }),
        api.get('/doctors'),
      ]);
      setAppointments(apptRes.data.appointments);
      setDoctors(docRes.data.doctors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await api.post(`/appointments/${id}/cancel`, { reason: 'Cancelled by staff' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel');
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Appointments</h2>
          <p>View and manage scheduled appointments</p>
        </div>
      </div>

      <div className="page-body">
        <div className="filters-row">
          <input
            id="date-filter"
            type="date"
            className="form-input"
            style={{ width: 180 }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <select
            id="doctor-filter"
            className="form-select"
            style={{ width: 240 }}
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
          >
            <option value="">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.full_name}</option>
            ))}
          </select>
          <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading-screen"><div className="spinner" /></div>
            ) : appointments.length === 0 ? (
              <div className="empty-state">
                <Calendar className="icon" />
                <h3>No appointments for this date</h3>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Token</th><th>Patient</th><th>Doctor</th>
                    <th>Complaint</th><th>Queue</th><th>Payment</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id}>
                      <td><span className={`token-number ${a.queue_status || 'waiting'}`}>#{a.token_number}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.patient_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.health_id}</div>
                      </td>
                      <td>
                        <div>{a.doctor_name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{a.specialty}</div>
                      </td>
                      <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.chief_complaint || '—'}
                      </td>
                      <td>
                        {a.queue_status ? <span className={`badge ${a.queue_status?.replace('_','-')}`}>{a.queue_status}</span> : '—'}
                      </td>
                      <td>
                        {a.payment_status ? <span className={`badge ${a.payment_status}`}>{a.payment_status}</span> : '—'}
                      </td>
                      <td><span className={`badge ${a.status?.replace('_','-')}`}>{a.status}</span></td>
                      <td>
                        {!['cancelled','completed'].includes(a.status) && (
                          <button
                            id={`cancel-appt-${a.id}`}
                            className="btn btn-ghost btn-sm"
                            onClick={() => cancelAppointment(a.id)}
                          >
                            Cancel
                          </button>
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
