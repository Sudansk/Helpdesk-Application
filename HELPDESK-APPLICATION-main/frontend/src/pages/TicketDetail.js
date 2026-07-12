import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { formatDate, getStatusBadgeClass, getPriorityBadgeClass, formatFileSize } from '../utils/helpers';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [agentId, setAgentId] = useState('');
  const [agents, setAgents] = useState([]);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTicket();
    if (user.role === 'admin') {
      fetchAgents();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await api.get(`/tickets/${id}`);
      setTicket(response.data.ticket);
      setStatus(response.data.ticket.status);
    } catch (error) {
      console.error('Error fetching ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await api.get('/admin/agents');
      setAgents(response.data.agents);
    } catch (error) {
      console.error('Error fetching agents:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/tickets/${id}/comments`, { content: comment });
      setComment('');
      fetchTicket();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleStatusChange = async () => {
    try {
      await api.post(`/tickets/${id}/status`, { status });
      fetchTicket();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAssign = async () => {
    try {
      await api.post(`/tickets/${id}/assign`, { agentId });
      fetchTicket();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to assign ticket');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/tickets/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFile(null);
      fetchTicket();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload file');
    }
  };

  const downloadFile = (attachment) => {
    window.open(`http://localhost:5000/uploads/${attachment.filename}`, '_blank');
  };

  if (loading) {
    return <div className="container main-content">Loading...</div>;
  }

  if (!ticket) {
    return <div className="container main-content">Ticket not found</div>;
  }

  const canEdit = ['admin', 'agent'].includes(user.role) || ticket.userId === user.id;

  return (
    <div className="container main-content">
      <button onClick={() => navigate('/tickets')} className="btn btn-secondary" style={{ marginBottom: '20px' }}>
        ← Back to Tickets
      </button>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <div>
            <h1>Ticket #{ticket.id}</h1>
            <p style={{ color: '#666', marginTop: '5px' }}>Created by {ticket.creator.name} on {formatDate(ticket.createdAt)}</p>
          </div>
          <div>
            <span className={`badge ${getStatusBadgeClass(ticket.status)}`} style={{ fontSize: '14px', padding: '8px 12px' }}>
              {ticket.status.replace('_', ' ')}
            </span>
            <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`} style={{ fontSize: '14px', padding: '8px 12px', marginLeft: '10px' }}>
              {ticket.priority}
            </span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h2>{ticket.title}</h2>
          <p style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{ticket.description}</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p><strong>Assigned To:</strong> {ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</p>
          {ticket.category && <p><strong>Category:</strong> {ticket.category}</p>}
          {ticket.dueDate && <p><strong>Due Date:</strong> {formatDate(ticket.dueDate)}</p>}
        </div>

        {canEdit && ['admin', 'agent'].includes(user.role) && (
          <div className="card" style={{ marginTop: '20px', backgroundColor: '#f8f9fa' }}>
            <h3>Ticket Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <button onClick={handleStatusChange} className="btn btn-primary" style={{ marginTop: '10px' }}>
                  Update Status
                </button>
              </div>
              {user.role === 'admin' && (
                <div className="form-group">
                  <label>Assign to Agent</label>
                  <select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
                    <option value="">Select Agent</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name}</option>
                    ))}
                  </select>
                  <button onClick={handleAssign} className="btn btn-primary" style={{ marginTop: '10px' }}>
                    Assign
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Attachments</h3>
          {ticket.attachments && ticket.attachments.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Uploaded By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ticket.attachments.map(attachment => (
                  <tr key={attachment.id}>
                    <td>{attachment.originalName}</td>
                    <td>{formatFileSize(attachment.fileSize)}</td>
                    <td>{attachment.uploadedBy.name}</td>
                    <td>
                      <button onClick={() => downloadFile(attachment)} className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '12px' }}>
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No attachments</p>
          )}
          {canEdit && (
            <form onSubmit={handleFileUpload} style={{ marginTop: '15px' }}>
              <div className="form-group">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                  Upload File
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="card" style={{ marginTop: '20px' }}>
          <h3>Comments</h3>
          {ticket.comments && ticket.comments.length > 0 ? (
            <div style={{ marginBottom: '20px' }}>
              {ticket.comments.map(comment => (
                <div key={comment.id} style={{ padding: '15px', borderBottom: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong>{comment.author.name}</strong>
                    <span style={{ color: '#666', fontSize: '12px' }}>{formatDate(comment.createdAt)}</span>
                  </div>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                  {comment.isInternal && (
                    <span className="badge" style={{ backgroundColor: '#ffc107', color: '#000', fontSize: '10px' }}>
                      Internal
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No comments yet</p>
          )}
          {canEdit && (
            <form onSubmit={handleAddComment}>
              <div className="form-group">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Add Comment
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;

