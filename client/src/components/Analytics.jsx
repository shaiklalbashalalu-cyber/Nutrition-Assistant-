import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, BarChart3, Calendar, Award } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Analytics = ({ setAlert, onAuthFailure }) => {
  const [data, setData] = useState([]);
  const [targets, setTargets] = useState({ calories: 2000, carbohydrates: 250, proteins: 100, fats: 65 });
  const [dietPlanInfo, setDietPlanInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default range: Last 7 days
  const getPastDateStr = (daysAgo) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
  };

  const [dateRange, setDateRange] = useState({
    startDate: getPastDateStr(6), // 7 days including today
    endDate: getPastDateStr(0),
  });

  const fetchProgressData = async () => {
    setLoading(true);
    const token = localStorage.getItem('nutrition_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/diet-plans/progress?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        onAuthFailure();
        return;
      }

      if (response.ok) {
        const resData = await response.json();
        setDietPlanInfo(resData.dietPlanInfo);
        setTargets(resData.targets);

        // Format dailyIntake data for recharts
        const chartData = Object.keys(resData.dailyIntake).sort().map((dateStr) => {
          const intake = resData.dailyIntake[dateStr];
          
          // Format date for chart labels (e.g. "Jun 30")
          const parsedDate = new Date(dateStr);
          const formattedLabel = parsedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

          return {
            date: dateStr,
            name: formattedLabel,
            Calories: intake.calories,
            Carbohydrates: Math.round(intake.carbohydrates),
            Protein: Math.round(intake.proteins),
            Fats: Math.round(intake.fats),
            TargetCalories: resData.targets.calories,
            TargetCarbs: resData.targets.carbohydrates,
            TargetProtein: resData.targets.proteins,
            TargetFats: resData.targets.fats,
          };
        });

        setData(chartData);
      } else {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to load progress details');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [dateRange]);

  const handleRangeChange = (e) => {
    const val = Number(e.target.value);
    setDateRange({
      startDate: getPastDateStr(val - 1),
      endDate: getPastDateStr(0),
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Reporting & Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Visualize calorie logs and macro adherence over time.</p>
        </div>

        {/* Date Interval Dropdown */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}>
          <Calendar size={18} style={{ color: 'var(--primary)' }} />
          <select
            onChange={handleRangeChange}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Generating progress visualizations...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Main Calorie Intake chart */}
          <div className="glass-panel" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} style={{ color: 'var(--primary)' }} /> Calorie Intake vs Daily Budget
            </h3>

            <div style={{ width: '100%', height: 350 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: '0.85rem' }} />
                  <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.85rem' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid var(--border-glass)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-main)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '0.9rem', paddingTop: '10px' }} />
                  <Bar dataKey="Calories" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Logged Calories (kcal)" />
                  <Bar dataKey="TargetCalories" fill="rgba(16, 185, 129, 0.25)" stroke="var(--success)" strokeWidth={1} radius={[4, 4, 0, 0]} name="Target Budget (kcal)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Macronutrients line chart split */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            
            {/* Left Line Chart: Macros breakdown */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={18} style={{ color: 'var(--secondary)' }} /> Macronutrient Daily Trends
              </h3>

              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" style={{ fontSize: '0.85rem' }} />
                    <YAxis stroke="var(--text-muted)" style={{ fontSize: '0.85rem' }} />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(15, 23, 42, 0.95)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-main)',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '0.9rem', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Carbohydrates" stroke="var(--info)" strokeWidth={2} name="Carbs (g)" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Protein" stroke="var(--success)" strokeWidth={2} name="Protein (g)" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Fats" stroke="var(--warning)" strokeWidth={2} name="Fats (g)" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right Card: Performance Metrics summary */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} style={{ color: 'var(--warning)' }} /> Goal Adherence
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {dietPlanInfo ? (
                  <div>
                    <h4 style={{ fontWeight: '700', marginBottom: '4px' }}>{dietPlanInfo.name}</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
                      Active since {new Date(dietPlanInfo.startDate).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>No active diet plan configured.</p>
                )}

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Target Calories:</span>
                    <span style={{ fontWeight: '700' }}>{targets.calories} kcal</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Target Carbs:</span>
                    <span style={{ fontWeight: '700', color: 'var(--info)' }}>{targets.carbohydrates}g</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Target Protein:</span>
                    <span style={{ fontWeight: '700', color: 'var(--success)' }}>{targets.proteins}g</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Target Fats:</span>
                    <span style={{ fontWeight: '700', color: 'var(--warning)' }}>{targets.fats}g</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
