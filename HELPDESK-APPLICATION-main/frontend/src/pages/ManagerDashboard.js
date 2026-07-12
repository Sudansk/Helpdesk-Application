import React, { useState, useEffect } from 'react';
import '../styles/ManagerDashboard.css';
import api from '../services/api';

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [teamSummary, setTeamSummary] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [priorityReport, setPriorityReport] = useState([]);
  const [statusReport, setStatusReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerData();
  }, []);

  const fetchManagerData = async () => {
    try {
      setLoading(true);
      const [summaryRes, performanceRes, workloadRes, priorityRes, statusRes] = await Promise.all([
        api.get('/manager/summary'),
        api.get('/manager/performance'),
        api.get('/manager/workload'),
        api.get('/manager/report/priority'),
        api.get('/manager/report/status')
      ]);

      setTeamSummary(summaryRes.data.summary);
      setTeamPerformance(performanceRes.data.performanceData);
      setWorkload(workloadRes.data.workload);
      setPriorityReport(priorityRes.data.priorityReport);
      setStatusReport(statusRes.data.statusReport);
    } catch (error) {
      alert('Error fetching manager data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="manager-dashboard">
      <div className="container">
        <h1>Manager Dashboard</h1>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            Team Summary
          </button>
          <button
            className={`tab-btn ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={`tab-btn ${activeTab === 'workload' ? 'active' : ''}`}
            onClick={() => setActiveTab('workload')}
          >
            Workload
          </button>
          <button
            className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>

        {/* Team Summary Tab */}
        {activeTab === 'summary' && teamSummary && (
          <div className="tab-content">
            <div className="summary-grid">
              <div className="summary-card">
                <h3>Team Members</h3>
                <p className="summary-number">{teamSummary.totalMembers}</p>
              </div>
              <div className="summary-card">
                <h3>Total Tickets</h3>
                <p className="summary-number">{teamSummary.totalTickets}</p>
              </div>
              <div className="summary-card">
                <h3>Resolved</h3>
                <p className="summary-number">{teamSummary.resolved}</p>
              </div>
              <div className="summary-card">
                <h3>Open</h3>
                <p className="summary-number">{teamSummary.open}</p>
              </div>
              <div className="summary-card">
                <h3>In Progress</h3>
                <p className="summary-number">{teamSummary.inProgress}</p>
              </div>
              <div className="summary-card">
                <h3>Urgent</h3>
                <p className="summary-number" style={{ color: '#e74c3c' }}>
                  {teamSummary.urgent}
                </p>
              </div>
              <div className="summary-card">
                <h3>Resolution Rate</h3>
                <p className="summary-number">{teamSummary.resolutionRate}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="tab-content">
            <h2>Team Member Performance</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Team Member</th>
                    <th>Assigned</th>
                    <th>Resolved</th>
                    <th>Active</th>
                    <th>Resolution Rate</th>
                    <th>Avg Resolution Time (h)</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.map((member) => (
                    <tr key={member.id}>
                      <td>{member.name}</td>
                      <td>{member.assignedTickets}</td>
                      <td>{member.resolvedTickets}</td>
                      <td>{member.activeTickets}</td>
                      <td>
                        <span className={`badge ${member.resolutionRate > 70 ? 'success' : 'warning'}`}>
                          {member.resolutionRate}%
                        </span>
                      </td>
                      <td>{member.avgResolutionHours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Workload Tab */}
        {activeTab === 'workload' && (
          <div className="tab-content">
            <h2>Agent Workload Distribution</h2>
            <div className="workload-container">
              {workload.map((agent) => (
                <div key={agent.agentId} className="workload-card">
                  <h3>{agent.agentName}</h3>
                  <div className="workload-bar">
                    <div
                      className={`workload-fill ${agent.openTickets > 5 ? 'overloaded' : ''}`}
                      style={{ width: `${Math.min((agent.openTickets / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="workload-count">{agent.openTickets} Open Tickets</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="tab-content">
            <div className="reports-grid">
              <div className="report-section">
                <h2>Tickets by Priority</h2>
                <div className="report-table">
                  {priorityReport.map((item) => (
                    <div key={item.priority} className="report-row">
                      <span>{item.priority.toUpperCase()}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="report-section">
                <h2>Tickets by Status</h2>
                <div className="report-table">
                  {statusReport.map((item) => (
                    <div key={item.status} className="report-row">
                      <span>{item.status.toUpperCase()}</span>
                      <strong>{item.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;
