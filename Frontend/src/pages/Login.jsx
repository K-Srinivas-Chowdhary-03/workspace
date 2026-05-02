import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top left, #0f3460 0%, #16213e 40%, #1a1a2e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      {/* Animated background blobs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,195,247,0.08), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08), transparent 70%)' }} />
      </div>

      <div style={{
        width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
        background: 'rgba(30,42,58,0.85)', borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)', padding: '40px 36px'
      }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(79,195,247,0.3)'
          }}>
            <FaGraduationCap size={30} color="white" />
          </div>
          <h2 className="fw-bold mb-1" style={{ background: 'linear-gradient(90deg, #4fc3f7, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.8rem' }}>
            Welcome Back
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>Sign in to WorkSpace</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Email Address</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRight: 'none', color: '#4fc3f7' }}>
                <FaEnvelope size={14} />
              </span>
              <input type="email" className="form-control" placeholder="you@university.edu"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: 'none', color: 'white', borderRadius: '0 10px 10px 0' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Password</label>
            <div className="input-group">
              <span className="input-group-text" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRight: 'none', color: '#4fc3f7' }}>
                <FaLock size={14} />
              </span>
              <input type={showPass ? 'text' : 'password'} className="form-control" placeholder="••••••••"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 0 }}
              />
              <button type="button" className="input-group-text" onClick={() => setShowPass(!showPass)}
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', borderLeft: 'none', borderRadius: '0 10px 10px 0', cursor: 'pointer' }}>
                {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn w-100 fw-semibold py-2" disabled={loading}
            style={{ background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.95rem', letterSpacing: '0.3px' }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Signing in...</> : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
          Don't have an account? {' '}
          <Link to="/register" style={{ color: '#4fc3f7', textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
