import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate, getStatusBadgeClass, getPriorityBadgeClass } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Redirect based on role
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'manager') {
      navigate('/manager');
    } else if (user?.role === 'superadmin') {
      navigate('/superadmin');
    } else {
      fetchTickets();
    }
  }, [user, navigate]);

  const fetchTickets = async () => {
    try {
      const response = await api.get('/tickets?limit=10');
      setTickets(response.data.tickets);
      
      // Calculate basic stats
      const allTickets = response.data.tickets;
      setStats({
        total: allTickets.length,
        open: allTickets.filter(t => t.status === 'open').length,
        inProgress: allTickets.filter(t => t.status === 'in_progress').length,
        resolved: allTickets.filter(t => t.status === 'resolved').length
      });
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect based on role
  if (user?.role === 'admin' || user?.role === 'manager' || user?.role === 'superadmin') {
    return null; // Navigation will handle the redirect
  }

  if (loading && user?.role === 'user') {
    return <div className="container main-content">Loading...</div>;
  }

  return (
    <div className="container main-content">
      <h1>Dashboard</h1>
      <p>Welcome, {user.name}!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Total Tickets</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total}</p>
        </div>
        <div className="card">
          <h3>Open</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>{stats.open}</p>
        </div>
        <div className="card">
          <h3>In Progress</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8' }}>{stats.inProgress}</p>
        </div>
        <div className="card">
          <h3>Resolved</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{stats.resolved}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Recent Tickets</h2>
          <Link to="/tickets" className="btn btn-primary">View All</Link>
        </div>
        {tickets.length === 0 ? (
          <p>No tickets found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.title}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>{formatDate(ticket.createdAt)}</td>
                  <td>
                    <Link to={`/tickets/${ticket.id}`} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
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
  );
};

export default Dashboard;

