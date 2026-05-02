import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel, type = 'danger' }) => {
  if (!show) return null;

  const colors = {
    danger: { bg: '#ef5350', light: 'rgba(239,83,80,0.1)' },
    warning: { bg: '#ffa726', light: 'rgba(255,167,38,0.1)' },
    success: { bg: '#66bb6a', light: 'rgba(102,187,106,0.1)' },
  };

  const theme = colors[type] || colors.danger;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div className="fade-in-up" style={{
        width: '100%', maxWidth: '400px',
        background: 'linear-gradient(145deg, #1a2332, #1e2d40)',
        borderRadius: '24px', border: `1px solid ${theme.bg}44`,
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)', overflow: 'hidden'
      }}>
        {/* Header Icon Section */}
        <div style={{ background: theme.light, padding: '32px 24px', textAlign: 'center' }}>
          <div style={{
            width: '60px', height: '60px', borderRadius: '50%', background: theme.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
            boxShadow: `0 8px 24px ${theme.bg}44`
          }}>
            <FaExclamationTriangle color="white" size={24} />
          </div>
        </div>

        <div className="p-4 pt-3 text-center">
          <h5 className="text-white fw-bold mb-2">{title}</h5>
          <p className="text-muted mb-4" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{message}</p>

          <div className="d-flex gap-2">
            <button className="btn flex-grow-1" onClick={onCancel}
              style={{ background: 'rgba(255,255,255,0.06)', color: '#aaa', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px' }}>
              Cancel
            </button>
            <button className="btn flex-grow-1 fw-bold" onClick={onConfirm}
              style={{ background: theme.bg, color: 'white', border: 'none', borderRadius: '12px', padding: '10px' }}>
              {type === 'danger' ? 'Delete' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
