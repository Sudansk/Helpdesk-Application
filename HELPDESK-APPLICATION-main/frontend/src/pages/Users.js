import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDate } from '../utils/helpers';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  };

  const handleUpdate = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}`, formData);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', role: '', isActive: true });
  };

  if (loading) {
    return <div className="container main-content">Loading...</div>;
  }

  return (
    <div className="container main-content">
      <h1>User Management</h1>
      <div className="card">
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: '100%', padding: '5px' }}
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        style={{ width: '100%', padding: '5px' }}
                      >
                        <option value="user">User</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className="badge" style={{ backgroundColor: user.role === 'admin' ? '#dc3545' : user.role === 'agent' ? '#17a2b8' : '#6c757d' }}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingUser === user.id ? (
                      <select
                        value={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                        style={{ width: '100%', padding: '5px' }}
                      >
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    ) : (
                      <span className={`badge ${user.isActive ? 'badge-resolved' : 'badge-closed'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    {editingUser === user.id ? (
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          onClick={() => handleUpdate(user.id)}
                          className="btn btn-success"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(user)}
                        className="btn btn-primary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                      >
                        Edit
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
  );
};

export default Users;

