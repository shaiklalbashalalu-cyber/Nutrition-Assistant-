import React, { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, User, Activity, Scale, MoveUp } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Auth = ({ onAuthSuccess, setAlert }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    age: '',
    weight: '',
    height: '',
    gender: 'male',
    activityLevel: 'moderately_active',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          age: Number(formData.age) || 25,
          weight: Number(formData.weight) || 70,
          height: Number(formData.height) || 170,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
        };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      localStorage.setItem('nutrition_token', data.token);
      localStorage.setItem('nutrition_user', JSON.stringify({
        _id: data._id,
        username: data.username,
        email: data.email,
        age: data.age,
        weight: data.weight,
        height: data.height,
        gender: data.gender,
        activityLevel: data.activityLevel,
      }));

      setAlert({ type: 'success', message: isLogin ? 'Successfully logged in!' : 'Successfully registered!' });
      onAuthSuccess();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <div className="brand-logo">
              <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>N</span>
            </div>
            <span className="brand-name text-gradient">NUTRITION</span>
          </div>
          <h2 className="auth-title text-gradient">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="auth-subtitle">
            {isLogin ? 'Log in to track your meals' : 'Register to get personalized targets'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-dark)' }} />
                <input
                  type="text"
                  name="username"
                  className="glass-input"
                  style={{ paddingLeft: '48px' }}
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-dark)' }} />
              <input
                type="email"
                name="email"
                className="glass-input"
                style={{ paddingLeft: '48px' }}
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-dark)' }} />
              <input
                type="password"
                name="password"
                className="glass-input"
                style={{ paddingLeft: '48px' }}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Age</label>
                  <input
                    type="number"
                    name="age"
                    className="glass-input"
                    placeholder="25"
                    value={formData.age}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    className="glass-input"
                    placeholder="70"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    className="glass-input"
                    placeholder="170"
                    value={formData.height}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gender</label>
                  <select
                    name="gender"
                    className="glass-input"
                    value={formData.gender}
                    onChange={handleChange}
                    style={{ appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Activity</label>
                  <select
                    name="activityLevel"
                    className="glass-input"
                    value={formData.activityLevel}
                    onChange={handleChange}
                    style={{ appearance: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Light Active</option>
                    <option value="moderately_active">Moderate</option>
                    <option value="very_active">Very Active</option>
                    <option value="extra_active">Extra Active</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary)',
                fontWeight: '600',
                marginLeft: '6px',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
