import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGraduationCap, FaUser, FaSignOutAlt, FaTachometerAlt, FaBell, FaEnvelope } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const { data } = await API.get('/notifications/unread');
      setUnreadCount(data.count);
    } catch (err) {
      // console.error('Navbar badge fetch failed:', err.response?.status);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div className="container-fluid px-4">
        <Link className="navbar-brand d-flex align-items-center gap-2 fw-bold" to="/dashboard" style={{ fontSize: '1.3rem' }}>
          <img 
            src="https://img.freepik.com/premium-photo/white-gold-w-wordmark-logo-design-black-background_872941-1607.jpg?semt=ais_hybrid&w=740&q=80" 
            alt="WorkSpace Logo" 
            onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3665/3665939.png'; }}
            style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '10px' }}
          />
          <span style={{ background: 'linear-gradient(90deg, #4fc3f7, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WorkSpace
          </span>
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto ms-3">
            <li className="nav-item">
              <Link className={`nav-link d-flex align-items-center gap-1 ${isActive('/dashboard')}`} to="/dashboard">
                <FaTachometerAlt size={14} /> Dashboard
              </Link>
            </li>
          </ul>

          {user && (
            <div className="d-flex align-items-center gap-3">
              {/* Notifications & Messages */}
              <div className="d-flex align-items-center gap-2 me-2">
                <Link to="/messages" className="btn btn-link p-2 position-relative text-white opacity-75 hover-opacity-100" title="Messages">
                  <FaEnvelope size={18} />
                </Link>
                <Link to="/notifications" className="btn btn-link p-2 position-relative text-white opacity-75 hover-opacity-100" title="Notifications">
                  <FaBell size={18} />
                  {unreadCount > 0 && (
                    <span className="position-absolute translate-middle badge rounded-pill bg-danger" 
                      style={{ 
                        top: '8px', 
                        right: '-6px', 
                        fontSize: '10px', 
                        padding: '4px 6px',
                        border: '2px solid #1e293b',
                        boxShadow: '0 0 15px rgba(255, 65, 54, 0.8)',
                        zIndex: 10
                      }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </div>

              <div className="dropdown">
                <button className="btn btn-sm d-flex align-items-center gap-2 text-white" type="button" data-bs-toggle="dropdown"
                  style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50px', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 14px' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-sm-inline">{user.name}</span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark mt-2" style={{ minWidth: '180px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px' }}>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2" to="/profile">
                      <FaUser size={13} /> My Profile
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider opacity-25" /></li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={handleLogout}>
                      <FaSignOutAlt size={13} /> Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
