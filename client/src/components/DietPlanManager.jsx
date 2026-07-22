import React, { useState, useEffect } from 'react';
import { Target, Award, Calendar, ChevronRight, Zap, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config';

const DietPlanManager = ({ user, setAlert, onAuthFailure }) => {
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    goal: 'maintenance',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days default
  });

  const fetchActivePlan = async () => {
    setLoading(true);
    const token = localStorage.getItem('nutrition_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/diet-plans/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        onAuthFailure();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setActivePlan(data);
        if (data) {
          // Pre-populate name based on goal if they want
          setFormData(prev => ({
            ...prev,
            name: data.name,
            goal: data.goal,
            startDate: data.startDate.split('T')[0],
            endDate: data.endDate.split('T')[0],
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching active diet plan:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('nutrition_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/diet-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        onAuthFailure();
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setAlert({ type: 'success', message: 'New diet plan created successfully!' });
        fetchActivePlan();
      } else {
        throw new Error(data.message || 'Failed to create diet plan');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  // Autocomplete Name based on Goal Selection
  const handleGoalChange = (e) => {
    const goalVal = e.target.value;
    let nameVal = '';
    if (goalVal === 'weight_loss') nameVal = 'Cut & Shred Diet';
    else if (goalVal === 'maintenance') nameVal = 'Daily Balance Diet';
    else if (goalVal === 'muscle_gain') nameVal = 'Lean Bulk Diet';

    setFormData({
      ...formData,
      goal: goalVal,
      name: nameVal,
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Diet Plan Creation</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure goals, duration, and calculate metabolic targets.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Analyzing metabolic metrics...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
          
          {/* Left panel: Create diet plan form */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <RefreshCw size={20} style={{ color: 'var(--primary)' }} /> Configure New Plan
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Goal</label>
                <select
                  name="goal"
                  className="glass-input"
                  value={formData.goal}
                  onChange={handleGoalChange}
                >
                  <option value="weight_loss">Weight Loss (Caloric Deficit)</option>
                  <option value="maintenance">Maintenance (Energy Balance)</option>
                  <option value="muscle_gain">Muscle Gain (Caloric Surplus)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Plan Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Fit Summer 2026"
                  className="glass-input"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Start Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-dark)' }} />
                    <input
                      type="date"
                      name="startDate"
                      className="glass-input"
                      style={{ paddingLeft: '44px' }}
                      value={formData.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>End Date</label>
                  <div style={{ position: 'relative' }}>
                    <Calendar size={16} style={{ position: 'absolute', left: '16px', top: '14px', color: 'var(--text-dark)' }} />
                    <input
                      type="date"
                      name="endDate"
                      className="glass-input"
                      style={{ paddingLeft: '44px' }}
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>
                <Zap size={18} /> Activate & Calculate Targets
              </button>
            </form>
          </div>

          {/* Right panel: Active plan targets card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '32px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} style={{ color: 'var(--warning)' }} /> Active Plan Targets
                </h3>
                {activePlan && (
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', background: 'var(--success-glow)', border: '1px solid var(--success)', color: 'var(--success)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                    Active
                  </span>
                )}
              </div>

              {activePlan ? (
                <div>
                  <h4 style={{ fontSize: '1.4rem', color: 'white', marginBottom: '4px' }}>{activePlan.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>
                    Goal: <span style={{ textTransform: 'capitalize', color: 'var(--primary)', fontWeight: '600' }}>{activePlan.goal.replace('_', ' ')}</span>
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Calorie target display */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recommended Daily Budget</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: '4px 0', color: 'white' }}>{activePlan.targets.calories} <span style={{ fontSize: '1.2rem', fontWeight: '500', color: 'var(--text-muted)' }}>kcal</span></div>
                    </div>

                    {/* Macro targets breakdown */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div style={{ background: 'rgba(6, 182, 212, 0.05)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(6, 182, 212, 0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Carbohydrates</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--info)' }}>{activePlan.targets.carbohydrates}g</div>
                      </div>
                      <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Protein</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--success)' }}>{activePlan.targets.proteins}g</div>
                      </div>
                      <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.1)', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Fats</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--warning)' }}>{activePlan.targets.fats}g</div>
                      </div>
                    </div>

                    {/* Timeline dates */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px solid var(--border-glass)', paddingTop: '16px' }}>
                      <span>Start: <strong>{new Date(activePlan.startDate).toLocaleDateString()}</strong></span>
                      <span>End: <strong>{new Date(activePlan.endDate).toLocaleDateString()}</strong></span>
                    </div>

                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No active plan has been set up yet. Use the configuration form to generate your targets!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default DietPlanManager;
