import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/dashboard');
      } else {
        setError('Login failed. Please check credentials.');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="grain-overlay"></div>
      <div className="background-blobs">
        <div className="blob blob-pink" style={{ top: '-10%', left: '10%' }}></div>
        <div className="blob blob-purple" style={{ bottom: '-10%', right: '10%' }}></div>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">welcome back</h2>
        <p className="auth-subtitle">Enter your credentials to access the LuxuryStay system.</p>

        {error && (
          <div style={{ background: '#ffe8e6', color: '#a8332a', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. guest@luxurystay.com"
              required 
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'signing in...' : 'sign in'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Reserve and Register</Link>
        </div>

        <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(41,37,36,0.08)', paddingTop: '1rem', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', display: 'block', marginBottom: '0.5rem' }}>Demo Accounts (Password: password123)</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
            <div>Guest: <code>guest@luxurystay.com</code></div>
            <div>Reception: <code>reception@luxurystay.com</code></div>
            <div>Housekeeper: <code>housekeep@luxurystay.com</code></div>
            <div>Technician: <code>repair@luxurystay.com</code></div>
            <div>Admin: <code>admin@luxurystay.com</code></div>
            <div>Manager: <code>manager@luxurystay.com</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}
