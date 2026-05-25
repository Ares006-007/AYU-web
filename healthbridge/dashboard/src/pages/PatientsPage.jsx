import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { Search, User } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => fetchPatients(), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patients', { params: { search: search || undefined, limit: 50 } });
      setPatients(res.data.patients);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h2>Patients</h2>
          <p>Search and view patient records for your hospital</p>
        </div>
      </div>

      <div className="page-body">
        <div className="filters-row">
          <div className="search-bar" style={{ flex: 1, maxWidth: 400 }}>
            <Search className="icon" size={16} />
            <input
              id="patient-search"
              placeholder="Search by name or Health ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="card">
          <div className="table-wrap">
            {loading ? (
              <div className="loading-screen"><div className="spinner" /></div>
            ) : patients.length === 0 ? (
              <div className="empty-state">
                <User className="icon" />
                <h3>No patients found</h3>
                <p>Try a different search term</p>
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Health ID</th>
                    <th>Name</th>
                    <th>City</th>
                    <th>Visits</th>
                    <th>Last Visit</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr key={p.id}>
                      <td><span className="health-id">{p.health_id}</span></td>
                      <td><span style={{ fontWeight: 600 }}>{p.full_name}</span></td>
                      <td>{p.city || '—'}</td>
                      <td>{p.visit_count}</td>
                      <td>{p.last_visit ? new Date(p.last_visit).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        <Link id={`view-patient-${p.id}`} to={`/patients/${p.id}`} className="btn btn-ghost btn-sm">
                          View
                        </Link>
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
