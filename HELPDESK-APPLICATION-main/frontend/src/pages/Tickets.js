import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate, getStatusBadgeClass, getPriorityBadgeClass } from '../utils/helpers';

const Tickets = () => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const fetchTickets = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      
      const response = await api.get(`/tickets?${params.toString()}`);
      setTickets(response.data.tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return <div className="container main-content">Loading...</div>;
  }

  return (
    <div className="container main-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Tickets</h1>
        {user.role === 'user' && (
          <Link to="/tickets/new" className="btn btn-primary">
            Create New Ticket
          </Link>
        )}
      </div>

      <div className="card">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={filters.priority} onChange={handleFilterChange}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
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
                <th>Assigned To</th>
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
                  <td>{ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</td>
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

export default Tickets;

