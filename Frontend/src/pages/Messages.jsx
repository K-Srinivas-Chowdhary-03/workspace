import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaArrowLeft, FaUserCircle, FaCircle, FaCheck, FaCheckDouble } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const scrollRef = useRef();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      markAsRead();
      const interval = setInterval(() => {
        fetchMessages();
        markAsRead();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  const markAsRead = async () => {
    if (selectedUser) {
      await API.put('/messages/read', { senderId: selectedUser._id });
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchUsers = async () => {
    const { data } = await API.get('/auth/users');
    setUsers(data.filter(u => u._id !== user._id));
  };

  const fetchMessages = async () => {
    const { data } = await API.get('/messages');
    if (selectedUser) {
      const filtered = data.filter(m => 
        (m.sender._id === selectedUser._id && m.recipient._id === user._id) ||
        (m.sender._id === user._id && m.recipient._id === selectedUser._id)
      );
      setMessages(filtered);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !selectedUser) return;
    try {
      await API.post('/messages', { recipientId: selectedUser._id, content });
      setContent('');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '40px 0'
    }}>
      {/* Centered Messenger Container */}
      <div className="container" style={{ 
        maxWidth: '1200px', 
        width: '75%', 
        height: '85vh',
        background: '#0f172a',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto'
      }}>
        {/* Header */}
        <div className="p-3 d-flex align-items-center gap-3" style={{ background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => navigate(-1)} className="btn text-white p-0 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
            <FaArrowLeft /> Back
          </button>
          <h5 className="text-white mb-0 fw-bold mx-auto">Team Messenger</h5>
        </div>

        <div className="d-flex flex-grow-1 overflow-hidden">
          {/* Users List */}
          <div className="col-4 col-md-3 border-end border-white-5" style={{ background: '#111827', overflowY: 'auto' }}>
          {users.map(u => (
            <div 
              key={u._id} 
              onClick={() => setSelectedUser(u)}
              className="p-3 d-flex align-items-center gap-3 cursor-pointer hover-bg-white-5"
              style={{ 
                background: selectedUser?._id === u._id ? 'rgba(79,195,247,0.1)' : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #4fc3f7, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="d-none d-md-block">
                <p className="text-white mb-0 small fw-bold">{u.name}</p>
                <p className="text-muted mb-0 small" style={{ fontSize: '0.7rem' }}>{u.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-grow-1 d-flex flex-column" style={{ background: '#0f172a' }}>
          {selectedUser ? (
            <>
              <div className="p-3 border-bottom border-white-5 d-flex align-items-center gap-2">
                <FaCircle size={8} className="text-success" />
                <span className="text-white fw-bold small">{selectedUser.name}</span>
              </div>
              <div className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-3">
                {messages.map(m => (
                  <div key={m._id} className={`d-flex ${m.sender._id === user._id ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div style={{
                      position: 'relative',
                      maxWidth: '75%',
                      minWidth: '100px', // Ensure space for time/ticks
                      padding: '10px 16px',
                      paddingBottom: '24px', 
                      borderRadius: '18px',
                      background: m.sender._id === user._id ? 'linear-gradient(135deg, #4fc3f7, #29b6f6)' : 'rgba(255,255,255,0.06)',
                      color: m.sender._id === user._id ? '#000' : '#fff',
                      fontSize: '0.95rem',
                      lineHeight: '1.4',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      border: m.sender._id === user._id ? 'none' : '1px solid rgba(255,255,255,0.05)',
                      wordBreak: 'break-word'
                    }}>
                      {m.content}
                      <div style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '12px',
                        fontSize: '0.65rem',
                        color: m.sender._id === user._id ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        pointerEvents: 'none'
                      }}>
                        <span style={{ fontWeight: '500' }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {m.sender._id === user._id && (
                          <span style={{ fontSize: '0.8rem' }}>
                            {m.read ? <FaCheckDouble /> : <FaCheck />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
              <form onSubmit={handleSend} className="p-2 px-3" style={{ background: '#1e293b', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control bg-dark border-0 text-white shadow-none" 
                    placeholder="Type a message..." 
                    style={{ borderRadius: '10px 0 0 10px', fontSize: '0.9rem', padding: '10px 15px' }}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <button className="btn btn-info px-4" style={{ borderRadius: '0 10px 10px 0' }}><FaPaperPlane size={14} /></button>
                </div>
              </form>
            </>
          ) : (
            <div className="m-auto text-center text-muted">
              <FaPaperPlane size={48} className="mb-3 opacity-25" />
              <p>Select a teammate to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};

export default Messages;
