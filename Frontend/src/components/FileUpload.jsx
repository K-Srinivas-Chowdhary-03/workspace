import { useState, useRef } from 'react';
import { FaUpload, FaFile, FaTrash, FaDownload } from 'react-icons/fa';
import API from '../api/axiosInstance';
import { toast } from 'react-toastify';

const FileUpload = ({ projectId, files = [], onFilesUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await API.post(`/projects/${projectId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded!');
      onFilesUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      fileRef.current.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await API.delete(`/projects/${projectId}/files/${fileId}`);
      toast.success('File deleted');
      onFilesUpdate();
    } catch (err) {
      toast.error('Could not delete file');
    }
  };

  const getFileIcon = (name = '') => {
    const ext = name.split('.').pop().toLowerCase();
    const colors = { pdf: '#ef5350', doc: '#42a5f5', docx: '#42a5f5', xlsx: '#66bb6a', pptx: '#ffa726', zip: '#ab47bc', png: '#26c6da', jpg: '#26c6da', jpeg: '#26c6da' };
    return colors[ext] || '#90a4ae';
  };

  return (
    <div>
      <div
        style={{
          border: '2px dashed rgba(79,195,247,0.3)', borderRadius: '12px',
          padding: '24px', textAlign: 'center', cursor: 'pointer',
          background: 'rgba(79,195,247,0.04)', transition: 'all 0.2s ease',
        }}
        onClick={() => fileRef.current.click()}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(79,195,247,0.6)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(79,195,247,0.3)'}
      >
        <input ref={fileRef} type="file" hidden onChange={handleUpload} />
        {uploading ? (
          <div className="spinner-border spinner-border-sm text-info" />
        ) : (
          <>
            <FaUpload size={24} style={{ color: '#4fc3f7', marginBottom: '8px' }} />
            <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
              Click to upload file <span style={{ color: '#4fc3f7' }}>or drag & drop</span>
            </p>
            <p className="text-muted" style={{ fontSize: '0.72rem' }}>PDF, DOC, XLSX, Images up to 10MB</p>
          </>
        )}
      </div>

      {files.length > 0 && (
        <div className="mt-3 d-flex flex-column gap-2">
          {files.map((f) => (
            <div key={f._id} className="d-flex align-items-center justify-content-between p-2 px-3"
              style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="d-flex align-items-center gap-2">
                <FaFile size={14} style={{ color: getFileIcon(f.originalName) }} />
                <span className="text-white" style={{ fontSize: '0.82rem' }}>{f.originalName}</span>
              </div>
              <div className="d-flex gap-2">
                <a href={`http://localhost:5000${f.path}`} target="_blank" rel="noreferrer"
                  className="btn btn-sm" style={{ background: 'rgba(79,195,247,0.1)', color: '#4fc3f7', border: 'none', padding: '3px 8px', borderRadius: '6px' }}>
                  <FaDownload size={11} />
                </a>
                <button className="btn btn-sm" onClick={() => handleDelete(f._id)}
                  style={{ background: 'rgba(239,83,80,0.1)', color: '#ef5350', border: 'none', padding: '3px 8px', borderRadius: '6px' }}>
                  <FaTrash size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
