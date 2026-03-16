import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../auth.js';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    role: 'customer',
    password: '',
    latitude: null,
    longitude: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === 'mobile') {
      const digitsOnly = String(value || '').replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({ ...prev, mobile: digitsOnly }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported in this browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (err) => {
          // If user denies or it fails, stop registration (location is required)
          reject(err || new Error('Unable to fetch current location.'));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const loc = await getLocation();
      const payload = { ...form, ...loc };
      await axios.post(`${API_BASE}/api/auth/register`, payload);
      setSuccess('Registration successful. Please login.');
      setTimeout(()=>navigate('/login'), 800);
    } catch (err) {
      const serverMsg = err.response?.data?.detail;
      const geoMsg =
        err?.code === 1
          ? 'Location permission is required to register. Please allow location access and try again.'
          : err?.message;
      setError(serverMsg || geoMsg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const setRole = (role) => {
    setForm(prev => ({ ...prev, role }));
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="w-100" style={{ maxWidth: 720 }}>
        <div className="card shadow-sm border-0 rounded-4">
          <div className="card-body p-4 p-md-5">
            <h2 className="h3 mb-2 text-center fw-semibold">Create your account</h2>
            <p className="text-muted text-center mb-4">
              Choose how you want to use ShaadiBazaarHub and fill in your details.
            </p>

            <div className="d-flex justify-content-center mb-4">
              <div className="btn-group" role="group" aria-label="Select user type">
                <button
                  type="button"
                  className={`btn ${form.role === 'customer' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setRole('customer')}
                >
                  I&apos;m a Customer
                </button>
                <button
                  type="button"
                  className={`btn ${form.role === 'provider' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setRole('provider')}
                >
                  I&apos;m a Service Provider
                </button>
              </div>
            </div>

            {error && <div className="alert alert-danger small mb-3">{error}</div>}
            {success && <div className="alert alert-success small mb-3">{success}</div>}

            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small text-uppercase text-muted mb-1">Name</label>
                  <input
                    className="form-control form-control-lg"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-uppercase text-muted mb-1">Email</label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    name="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-uppercase text-muted mb-1">Mobile</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    className="form-control form-control-lg"
                    name="mobile"
                    value={form.mobile}
                    onChange={onChange}
                    placeholder="Contact number"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-uppercase text-muted mb-1">Address</label>
                  <input
                    className="form-control form-control-lg"
                    name="address"
                    value={form.address}
                    onChange={onChange}
                    placeholder="City / locality"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small text-uppercase text-muted mb-1">Password</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    name="password"
                    value={form.password}
                    onChange={onChange}
                    placeholder="Create a strong password"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  className="btn btn-primary btn-lg w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}



