import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE, setAuth } from '../auth.js';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    try {
      setLoading(true);
      const { data: token } = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      // fetch profile for role
      const { data: profile } = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token.access_token}` }
      });
      setAuth(token.access_token, profile.role);
      navigate(profile.role === 'provider' ? '/dashboard' : '/my-bookings');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="w-100" style={{ maxWidth: 420 }}>
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-4 p-md-5">
            <h2 className="h3 mb-2 text-center fw-semibold">Welcome back</h2>
            <p className="text-muted text-center mb-4">
              Sign in to manage your ShaadiBazaarHub account.
            </p>

            {error && <div className="alert alert-danger small mb-4">{error}</div>}

            <form onSubmit={onSubmit} className="d-grid gap-3">
              <div>
                <label className="form-label small text-uppercase text-muted mb-1">Email</label>
                <input
                  type="email"
                  className="form-control form-control-lg"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="form-label small text-uppercase text-muted mb-1">Password</label>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                className="btn btn-primary btn-lg w-100 mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}



