import React, { useState } from 'react';
import axios from '../axios'; // or '../services/axios' if that’s the path
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="login-logo" role="img" aria-label="logo">📸</div>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="input-group">
            <input
              type="email"
              id="login-email"
              placeholder=" "
              value={email}
              required
              autoComplete="username"
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="login-email">Email</label>
          </div>
          <div className="input-group">
            <input
              type="password"
              id="login-password"
              placeholder=" "
              value={password}
              required
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="login-password">Password</label>
          </div>
          <button type="submit">Login</button>
          {error && <div className="login-error-message">{error}</div>}
        </form>
        <div className="auth-divider">
          <span></span>
          <p>OR</p>
          <span></span>
        </div>
        <div style={{ marginTop: '0.7rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="toggle-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
