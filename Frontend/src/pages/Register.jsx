import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaGraduationCap, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'member' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!form.role) return toast.error('Please select your role');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Please sign in 🎓');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    color: 'white', borderRadius: '10px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top right, #0f3460 0%, #16213e 40%, #1a1a2e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.08), transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,195,247,0.07), transparent 70%)' }} />
      </div>

      <div style={{
        width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1,
        background: 'rgba(30,42,58,0.85)', borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)', padding: '40px 36px'
      }}>
        <div className="text-center mb-4">
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px', margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #a78bfa, #4fc3f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(167,139,250,0.3)'
          }}>
            <FaGraduationCap size={30} color="white" />
          </div>
          <h2 className="fw-bold mb-1" style={{ background: 'linear-gradient(90deg, #a78bfa, #4fc3f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '1.8rem' }}>
            Create Account
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: '0.88rem' }}>Join WorkSpace today</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. Jane Smith', icon: <FaUser size={14} /> },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'you@university.edu', icon: <FaEnvelope size={14} /> },
          ].map((f) => (
            <div className="mb-3" key={f.name}>
              <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>{f.label}</label>
              <div className="input-group">
                <span className="input-group-text" style={{ ...inputStyle, borderRight: 'none', borderRadius: '10px 0 0 10px', color: '#a78bfa' }}>{f.icon}</span>
                <input type={f.type} className="form-control" placeholder={f.placeholder}
                  value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} required
                  style={{ ...inputStyle, borderLeft: 'none', borderRadius: '0 10px 10px 0' }}
                />
              </div>
            </div>
          ))}

          <div className="mb-3">
            <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Password</label>
            <div className="input-group">
              <span className="input-group-text" style={{ ...inputStyle, borderRight: 'none', borderRadius: '10px 0 0 10px', color: '#a78bfa' }}><FaLock size={14} /></span>
              <input type={showPass ? 'text' : 'password'} className="form-control" placeholder="Min. 6 characters"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                style={{ ...inputStyle, borderLeft: 'none', borderRadius: '0' }}
              />
              <button type="button" className="input-group-text" onClick={() => setShowPass(!showPass)}
                style={{ ...inputStyle, borderLeft: 'none', borderRadius: '0 10px 10px 0', cursor: 'pointer', color: '#aaa' }}>
                {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Confirm Password</label>
            <input type="password" className="form-control" placeholder="Repeat password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required
              style={inputStyle}
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Select Role</label>
            <div className="input-group">
              <span className="input-group-text" style={{ ...inputStyle, borderRight: 'none', borderRadius: '10px 0 0 10px', color: '#a78bfa' }}><FaUser size={12} /></span>
              <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ ...inputStyle, borderLeft: 'none', borderRadius: '0 10px 10px 0' }}>
                <option value="member">Team Member</option>
                <option value="lead">Team Lead</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn w-100 fw-semibold py-2" disabled={loading}
            style={{ background: 'linear-gradient(135deg, #a78bfa, #4fc3f7)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.95rem' }}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2" />Creating account...</> : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-3 mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a78bfa', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
