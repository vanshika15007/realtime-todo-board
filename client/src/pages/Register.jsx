import React, { useState } from 'react';
import axios from '../axios';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('/auth/register', { name, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="login-logo" role="img" aria-label="logo">📸</div>
        <h2>Sign Up</h2>
        {error && <div className="login-error-message">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="input-group">
            <input
              type="text"
              placeholder="Name"
              value={name}
              required
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit">Register</button>
        </form>
        <div className="auth-divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>
        <div style={{ marginTop: '0.7rem' }}>
          Already have an account?{' '}
          <span className="toggle-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Login</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
