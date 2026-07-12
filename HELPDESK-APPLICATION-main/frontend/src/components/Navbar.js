import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          Helpdesk System
        </Link>
        <div className="navbar-menu">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/tickets" className="navbar-link">
            Tickets
          </Link>
          {user.role === 'user' && (
            <Link to="/tickets/new" className="navbar-link">
              New Ticket
            </Link>
          )}
          {user.role === 'admin' && (
            <>
              <Link to="/admin" className="navbar-link">
                Admin Dashboard
              </Link>
              <Link to="/admin/users" className="navbar-link">
                Users
              </Link>
            </>
          )}
          {user.role === 'manager' && (
            <Link to="/manager" className="navbar-link">
              Manager Dashboard
            </Link>
          )}
          {user.role === 'superadmin' && (
            <>
              <Link to="/superadmin" className="navbar-link">
                SuperAdmin Control
              </Link>
            </>
          )}
          <NotificationCenter />
          <div className="navbar-user">
            <span className="navbar-user-name">{user.name}</span>
            <span className="navbar-user-role">({user.role})</span>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

