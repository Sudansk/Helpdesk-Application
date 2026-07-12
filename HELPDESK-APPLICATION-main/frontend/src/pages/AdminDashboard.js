import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container main-content">Loading...</div>;
  }

  if (!stats) {
    return <div className="container main-content">Error loading statistics</div>;
  }

  return (
    <div className="container main-content">
      <h1>Admin Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Total Tickets</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.tickets.total}</p>
        </div>
        <div className="card">
          <h3>Open</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#ffc107' }}>{stats.tickets.open}</p>
        </div>
        <div className="card">
          <h3>In Progress</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#17a2b8' }}>{stats.tickets.inProgress}</p>
        </div>
        <div className="card">
          <h3>Resolved</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>{stats.tickets.resolved}</p>
        </div>
        <div className="card">
          <h3>Closed</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#6c757d' }}>{stats.tickets.closed}</p>
        </div>
        <div className="card">
          <h3>Unassigned</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>{stats.tickets.unassigned}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Tickets by Priority</h3>
          <div style={{ marginTop: '15px' }}>
            <p>Low: {stats.ticketsByPriority.low || 0}</p>
            <p>Medium: {stats.ticketsByPriority.medium || 0}</p>
            <p>High: {stats.ticketsByPriority.high || 0}</p>
            <p>Urgent: {stats.ticketsByPriority.urgent || 0}</p>
          </div>
        </div>

        <div className="card">
          <h3>Tickets by Status</h3>
          <div style={{ marginTop: '15px' }}>
            <p>Open: {stats.ticketsByStatus.open || 0}</p>
            <p>In Progress: {stats.ticketsByStatus.in_progress || 0}</p>
            <p>Resolved: {stats.ticketsByStatus.resolved || 0}</p>
            <p>Closed: {stats.ticketsByStatus.closed || 0}</p>
          </div>
        </div>

        <div className="card">
          <h3>User Statistics</h3>
          <div style={{ marginTop: '15px' }}>
            <p>Total Users: {stats.users.total}</p>
            <p>Agents: {stats.users.agents}</p>
            <p>Admins: {stats.users.admins}</p>
          </div>
        </div>

        <div className="card">
          <h3>Performance Metrics</h3>
          <div style={{ marginTop: '15px' }}>
            <p>Average Resolution Time: {stats.averageResolutionHours.toFixed(2)} hours</p>
            <p>Recent Tickets (7 days): {stats.tickets.recent}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

