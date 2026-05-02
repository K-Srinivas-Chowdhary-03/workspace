import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { FaPaperPlane, FaArrowLeft, FaUserCircle, FaCircle, FaCheck, FaCheckDouble, FaChevronLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './Messages.css';

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
    try {
      const { data } = await API.get('/auth/users');
      setUsers(data.filter(u => u._id !== user._id));
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data } = await API.get('/messages');
      if (selectedUser) {
        const filtered = data.filter(m => 
          (m.sender._id === selectedUser._id && m.recipient._id === user._id) ||
          (m.sender._id === user._id && m.recipient._id === selectedUser._id)
        );
        setMessages(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
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
    <div className="messenger-wrapper">
      <div className="messenger-container">
        {/* Header */}
        <div className="messenger-header p-3 d-flex align-items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn text-white p-0 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
            <FaArrowLeft /> <span className="d-none d-sm-inline">Back</span>
          </button>
          <h5 className="text-white mb-0 fw-bold mx-auto">Team Messenger</h5>
          <div style={{ width: '60px' }} className="d-sm-none"></div> {/* Spacer for symmetry */}
        </div>

        <div className="d-flex flex-grow-1 overflow-hidden position-relative">
          {/* Users List */}
          <div className={`users-sidebar col-md-3 ${selectedUser ? 'd-none d-md-block' : 'col-12'}`}>
            {users.map(u => (
              <div 
                key={u._id} 
                onClick={() => setSelectedUser(u)}
                className="user-item p-3 d-flex align-items-center gap-3"
                style={{ 
                  background: selectedUser?._id === u._id ? 'rgba(79,195,247,0.1)' : 'transparent',
                }}
              >
                <div className="user-avatar">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <p className="text-white mb-0 small fw-bold">{u.name}</p>
                  <p className="text-muted mb-0 small" style={{ fontSize: '0.7rem' }}>{u.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Area */}
          <div className={`chat-area flex-grow-1 ${selectedUser ? 'd-flex' : 'd-none d-md-flex'}`}>
            {selectedUser ? (
              <>
                <div className="chat-header p-3 border-bottom border-white-5 d-flex align-items-center gap-2">
                  <button 
                    className="btn text-white p-0 d-md-none me-2" 
                    onClick={() => setSelectedUser(null)}
                  >
                    <FaChevronLeft />
                  </button>
                  <FaCircle size={8} className="text-success" />
                  <span className="text-white fw-bold small">{selectedUser.name}</span>
                </div>
                <div className="messages-list flex-grow-1 p-3 p-md-4 overflow-auto d-flex flex-column gap-3">
                  {messages.map(m => (
                    <div key={m._id} className={`d-flex ${m.sender._id === user._id ? 'justify-content-end' : 'justify-content-start'}`}>
                      <div className={`message-bubble ${m.sender._id === user._id ? 'sent' : 'received'}`}>
                        {m.content}
                        <div className="message-meta">
                          <span className="time">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {m.sender._id === user._id && (
                            <span className="read-status">
                              {m.read ? <FaCheckDouble /> : <FaCheck />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
                <form onSubmit={handleSend} className="input-area p-2 px-3">
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control bg-dark border-0 text-white shadow-none" 
                      placeholder="Type a message..." 
                      style={{ borderRadius: '10px 0 0 10px', fontSize: '16px', padding: '10px 15px' }}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                    <button className="btn btn-info px-4" style={{ borderRadius: '0 10px 10px 0' }}><FaPaperPlane size={14} /></button>
                  </div>
                </form>
              </>
            ) : (
              <div className="m-auto text-center text-muted p-5">
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

