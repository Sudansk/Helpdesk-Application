import React, { useState, useEffect } from 'react';
import '../styles/SuperAdminDashboard.css';
import api from '../services/api';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [slas, setSLAs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSLA, setNewSLA] = useState({
    name: '',
    responseTimeHours: '',
    resolutionTimeHours: '',
    priority: 'medium'
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, healthRes, slasRes, usersRes] = await Promise.all([
        api.get('/superadmin/stats'),
        api.get('/superadmin/health'),
        api.get('/superadmin/slas'),
        api.get('/superadmin/users')
      ]);

      setSystemStats(statsRes.data);
      setSystemHealth(healthRes.data);
      setSLAs(slasRes.data.slas);
      setUsers(usersRes.data.users);
    } catch (error) {
      alert('Error fetching dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSLA = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/superadmin/slas', newSLA);
      setSLAs([response.data.sla, ...slas]);
      setNewSLA({
        name: '',
        responseTimeHours: '',
        resolutionTimeHours: '',
        priority: 'medium'
      });
      alert('SLA created successfully');
    } catch (error) {
      alert('Error creating SLA: ' + error.message);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/superadmin/users', newUser);
      setUsers([response.data.user, ...users]);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'agent'
      });
      alert('User created successfully');
    } catch (error) {
      alert('Error creating user: ' + error.message);
    }
  };

  const handleDeleteSLA = async (id) => {
    if (!window.confirm('Are you sure you want to delete this SLA?')) return;
    try {
      await api.delete(`/superadmin/slas/${id}`);
      setSLAs(slas.filter(sla => sla.id !== id));
      alert('SLA deleted successfully');
    } catch (error) {
      alert('Error deleting SLA: ' + error.message);
    }
  };

  const handleDeactivateUser = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await api.put(`/superadmin/users/${id}`, { isActive: false });
      setUsers(users.map(u => u.id === id ? { ...u, isActive: false } : u));
      alert('User deactivated successfully');
    } catch (error) {
      alert('Error deactivating user: ' + error.message);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="superadmin-dashboard">
      <div className="container">
        <h1>SuperAdmin Dashboard</h1>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            System Overview
          </button>
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`tab-btn ${activeTab === 'slas' ? 'active' : ''}`}
            onClick={() => setActiveTab('slas')}
          >
            SLA Management
          </button>
        </div>

        {/* System Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="stats-grid">
              {systemStats && (
                <>
                  <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-number">{systemStats.users.total}</p>
                    <small>Active: {systemStats.users.active}</small>
                  </div>
                  <div className="stat-card">
                    <h3>Total Tickets</h3>
                    <p className="stat-number">{systemStats.tickets.total}</p>
                  </div>
                </>
              )}
            </div>

            <h2>System Health</h2>
            {systemHealth && (
              <div className="health-container">
                <div className={`health-item ${systemHealth.health.status}`}>
                  <span>System Status: {systemHealth.health.status.toUpperCase()}</span>
                </div>
                <div className="health-metrics">
                  <div>Unassigned Tickets: <strong>{systemHealth.health.unassignedTickets}</strong></div>
                  <div>Overdue Tickets: <strong>{systemHealth.health.overdueTickets}</strong></div>
                  <div>Urgent Tickets: <strong>{systemHealth.health.urgentTickets}</strong></div>
                  <div>Inactive Agents: <strong>{systemHealth.health.inactiveAgents}</strong></div>
                </div>
              </div>
            )}

            <h2>Users by Role</h2>
            {systemStats && (
              <div className="role-breakdown">
                {systemStats.users.byRole.map((item) => (
                  <div key={item.role} className="role-item">
                    <span>{item.role.charAt(0).toUpperCase() + item.role.slice(1)}:</span>
                    <strong>{item.count}</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="tab-content">
            <h2>Create New User</h2>
            <form className="form-container" onSubmit={handleCreateUser}>
              <input
                type="text"
                placeholder="Full Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="user">User</option>
                <option value="agent">Agent</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="superadmin">SuperAdmin</option>
              </select>
              <button type="submit" className="btn-primary">Create User</button>
            </form>

            <h2>All Users</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                      <td>
                        {user.isActive && (
                          <button
                            className="btn-danger"
                            onClick={() => handleDeactivateUser(user.id)}
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SLA Management Tab */}
        {activeTab === 'slas' && (
          <div className="tab-content">
            <h2>Create New SLA</h2>
            <form className="form-container" onSubmit={handleCreateSLA}>
              <input
                type="text"
                placeholder="SLA Name"
                value={newSLA.name}
                onChange={(e) => setNewSLA({ ...newSLA, name: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Response Time (hours)"
                value={newSLA.responseTimeHours}
                onChange={(e) => setNewSLA({ ...newSLA, responseTimeHours: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Resolution Time (hours)"
                value={newSLA.resolutionTimeHours}
                onChange={(e) => setNewSLA({ ...newSLA, resolutionTimeHours: e.target.value })}
                required
              />
              <select
                value={newSLA.priority}
                onChange={(e) => setNewSLA({ ...newSLA, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <button type="submit" className="btn-primary">Create SLA</button>
            </form>

            <h2>All SLAs</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Response Time (h)</th>
                    <th>Resolution Time (h)</th>
                    <th>Priority</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slas.map((sla) => (
                    <tr key={sla.id}>
                      <td>{sla.name}</td>
                      <td>{sla.responseTimeHours}</td>
                      <td>{sla.resolutionTimeHours}</td>
                      <td>{sla.priority}</td>
                      <td>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteSLA(sla.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
