import React, { useState } from 'react';
import { User, Mail, Scale, MoveUp, Activity, Check, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../config';

const UserProfile = ({ user, onUserUpdate, setAlert, onAuthFailure }) => {
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    age: user.age || 25,
    weight: user.weight || 70,
    height: user.height || 170,
    gender: user.gender || 'male',
    activityLevel: user.activityLevel || 'moderately_active',
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem('nutrition_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          age: Number(formData.age),
          weight: Number(formData.weight),
          height: Number(formData.height),
          gender: formData.gender,
          activityLevel: formData.activityLevel,
        }),
      });

      if (response.status === 401) {
        onAuthFailure();
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setAlert({ type: 'success', message: 'Profile updated successfully!' });
        localStorage.setItem('nutrition_user', JSON.stringify(data));
        onUserUpdate(data);
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Profile Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>Keep your biological and activity metrics up to date to get accurate target recommendations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Panel: Profile settings form */}
        <div className="glass-panel" style={{ padding: '32px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} style={{ color: 'var(--primary)' }} /> Biological Details
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Account Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-dark)' }} />
                  <input
                    type="text"
                    name="username"
                    className="glass-input"
                    style={{ paddingLeft: '44px' }}
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-dark)' }} />
                  <input
                    type="email"
                    name="email"
                    className="glass-input"
                    style={{ paddingLeft: '44px' }}
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Core Stats (Age, Weight, Height) */}
            <div className="profile-grid">
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Age (Years)</label>
                <input
                  type="number"
                  name="age"
                  className="glass-input"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    className="glass-input"
                    value={formData.weight}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Height (cm)</label>
                  <input
                    type="number"
                    name="height"
                    className="glass-input"
                    value={formData.height}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Gender and Activity Level selectors */}
            <div className="profile-grid">
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Gender</label>
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
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Activity Level</label>
                <select
                  name="activityLevel"
                  className="glass-input"
                  value={formData.activityLevel}
                  onChange={handleChange}
                  style={{ appearance: 'none', WebkitAppearance: 'none' }}
                >
                  <option value="sedentary">Sedentary (Little/no exercise)</option>
                  <option value="lightly_active">Lightly Active (1-3 days/week exercise)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/week exercise)</option>
                  <option value="very_active">Very Active (6-7 days/week exercise)</option>
                  <option value="extra_active">Extra Active (Hard physical work/sports)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '12px' }} disabled={saving}>
              {saving ? 'Saving...' : <><Check size={18} /> Save Settings</>}
            </button>
          </form>
        </div>

        {/* Right Panel: Informational stats / BMR explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Metrics display */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', color: 'var(--text-main)' }}>Your Biological Metrics</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><Scale size={16} /> Weight:</span>
                <span style={{ fontWeight: '700' }}>{formData.weight} kg</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><MoveUp size={16} /> Height:</span>
                <span style={{ fontWeight: '700' }}>{formData.height} cm</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={16} /> Activity Level:</span>
                <span style={{ fontWeight: '700', textTransform: 'capitalize' }}>{formData.activityLevel.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Target guidelines */}
          <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(15, 23, 42, 0.65) 100%)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} style={{ color: 'var(--primary)' }} /> Biological Formulas
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              Nutrition targets are calculated using the Mifflin-St Jeor equation to compute your Basal Metabolic Rate (BMR), adjusted for your activity multiplier to get your TDEE (Total Daily Energy Expenditure). Adjusting your profile metrics updates this metabolic baseline.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserProfile;
