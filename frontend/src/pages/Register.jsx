import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [address, setAddress] = useState('');
  const [preferences, setPreferences] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        fullName,
        email,
        password,
        phone,
        passportNumber,
        address,
        preferences,
        role: 'guest'
      });

      if (response.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        navigate('/dashboard');
      } else {
        setError('Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try using a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ padding: '4rem 2rem' }}>
      <div className="grain-overlay"></div>
      <div className="background-blobs">
        <div className="blob blob-pink" style={{ top: '-10%', left: '10%' }}></div>
        <div className="blob blob-purple" style={{ bottom: '-10%', right: '10%' }}></div>
      </div>

      <div className="auth-card" style={{ maxWidth: '600px' }}>
        <h2 className="auth-title">create your profile</h2>
        <p className="auth-subtitle">Register to reserve rooms, request premium room services, and view invoices.</p>

        {error && (
          <div style={{ background: '#ffe8e6', color: '#a8332a', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Eleanor Vance"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="eleanor@example.com"
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 012-3456"
                required 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Passport / National ID</label>
              <input 
                type="text" 
                className="form-input"
                value={passportNumber}
                onChange={(e) => setPassportNumber(e.target.value)}
                placeholder="US-123456789"
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Home Address</label>
              <input 
                type="text" 
                className="form-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Cozy Lane, Seattle, WA"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Room & Sleep Preferences (Optional)</label>
            <textarea 
              className="form-textarea"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. Feather pillow, quiet forest side, extra towels, decaf tea..."
              rows={3}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'creating account...' : 'register & start stay'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
