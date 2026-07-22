import React, { useState, useEffect } from 'react';
import { Calendar, Target, Award, Info, PlusCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Dashboard = ({ user, setActivePage, setAlert, selectedDate, setSelectedDate, onAuthFailure }) => {
  const [dailyTotals, setDailyTotals] = useState({ calories: 0, carbs: 0, protein: 0, fat: 0 });
  const [targets, setTargets] = useState({ calories: 2000, carbohydrates: 250, proteins: 100, fats: 65 });
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch active diet plan and daily logs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem('nutrition_token');
      if (!token) return;

      try {
        // Fetch active plan
        const planRes = await fetch(`${API_BASE_URL}/api/diet-plans/active`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (planRes.status === 401) {
          onAuthFailure();
          return;
        }

        if (planRes.ok) {
          const planData = await planRes.json();
          if (planData) {
            setDietPlan(planData);
            setTargets({
              calories: planData.targets.calories,
              carbohydrates: planData.targets.carbohydrates,
              proteins: planData.targets.proteins,
              fats: planData.targets.fats,
            });
          } else {
            setDietPlan(null);
          }
        }

        // Fetch daily meals
        const mealsRes = await fetch(`${API_BASE_URL}/api/meals/daily?date=${selectedDate}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (mealsRes.status === 401) {
          onAuthFailure();
          return;
        }

        if (mealsRes.ok) {
          const mealsData = await mealsRes.json();

          let calSum = 0;
          let carbSum = 0;
          let protSum = 0;
          let fatSum = 0;

          mealsData.forEach((meal) => {
            if (meal.nutritionFact) {
              calSum += meal.nutritionFact.calories;
              carbSum += meal.nutritionFact.carbohydrates;
              protSum += meal.nutritionFact.proteins;
              fatSum += meal.nutritionFact.fats;
            }
          });

          setDailyTotals({
            calories: calSum,
            carbs: Math.round(carbSum * 10) / 10,
            protein: Math.round(protSum * 10) / 10,
            fat: Math.round(fatSum * 10) / 10,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setAlert({ type: 'error', message: 'Failed to load dashboard data' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate, setAlert]);

  // Handle circular progress calculation
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = targets.calories > 0 ? Math.min(dailyTotals.calories / targets.calories, 1) : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Percentage calculations
  const caloriesPercent = Math.round((dailyTotals.calories / targets.calories) * 100) || 0;
  const carbsPercent = Math.round((dailyTotals.carbs / targets.carbohydrates) * 100) || 0;
  const proteinPercent = Math.round((dailyTotals.protein / targets.proteins) * 100) || 0;
  const fatPercent = Math.round((dailyTotals.fat / targets.fats) * 100) || 0;

  // Generate personalized advice/tips
  const getRecommendation = () => {
    if (loading) return "Analyzing your daily logs...";
    if (dailyTotals.calories === 0) {
      return "Start logging your breakfast, lunch, or snack for today to see live suggestions!";
    }

    const advice = [];
    if (proteinPercent < 50 && dailyTotals.calories > 0) {
      advice.push("Your protein intake is currently low. Consider logging some Salmon, Chicken Breast, Eggs, or Greek Yogurt to meet your targets.");
    }
    if (caloriesPercent > 95 && caloriesPercent < 110) {
      advice.push("You are right at your calorie budget target! Splendid tracking today.");
    } else if (caloriesPercent >= 110) {
      advice.push("You have exceeded your daily calorie target. Try choosing lighter options like Spinach or Broccoli for the rest of the day.");
    }
    if (carbsPercent > 90 && dietPlan?.goal === 'weight_loss') {
      advice.push("Carbs are close to your limit. Try prioritizing lean protein sources for snacks.");
    }

    if (advice.length === 0) {
      return "Excellent distribution of nutrients today. Keep up the balanced logging!";
    }
    return advice[0];
  };

  return (
    <div>
      {/* Upper header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user.username}! Track your biological targets here.</p>
        </div>

        {/* Date Selector */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 16px', borderRadius: 'var(--radius-sm)' }}>
          <Calendar size={18} style={{ color: 'var(--primary)' }} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              outline: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Calculating BMR and loading log data...</p>
        </div>
      ) : (
        <div className="grid-dashboard">
          {/* Left panel: Calorie circular ring & macro progress list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div className="dashboard-hero glass-panel">
              {/* Circular SVG Calorie Progress */}
              <div className="circle-progress-container">
                <svg className="circle-svg">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--secondary)" />
                    </linearGradient>
                  </defs>
                  <circle className="circle-bg" cx="110" cy="110" r={radius} />
                  <circle
                    className="circle-fill"
                    cx="110"
                    cy="110"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <div className="circle-text-center">
                  <span className="circle-calories">{dailyTotals.calories}</span>
                  <span className="circle-label">of {targets.calories} kcal</span>
                </div>
              </div>

              {/* Progress percentage and Quick status */}
              <div>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Daily Summary</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.95rem' }}>
                  {caloriesPercent}% of daily budget logged.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: caloriesPercent > 100 ? 'var(--danger)' : 'var(--success)' }}></div>
                    <span style={{ fontSize: '0.9rem' }}>
                      {caloriesPercent > 100
                        ? `Over budget by ${dailyTotals.calories - targets.calories} kcal`
                        : `${targets.calories - dailyTotals.calories} kcal remaining`}
                    </span>
                  </div>
                  <button
                    onClick={() => setActivePage('meals')}
                    className="btn btn-primary"
                    style={{ padding: '10px 16px', fontSize: '0.9rem', width: 'fit-content', marginTop: '8px' }}
                  >
                    <PlusCircle size={16} /> Log Meal
                  </button>
                </div>
              </div>
            </div>

            {/* Macro breakdown progress cards */}
            <div className="glass-panel" style={{ padding: '32px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} style={{ color: 'var(--secondary)' }} /> Macronutrient Balance
              </h3>

              <div className="macro-progress-list">
                {/* Carbs */}
                <div className="macro-bar-container">
                  <div className="macro-bar-labels">
                    <span className="macro-name">Carbohydrates</span>
                    <span className="macro-values">{dailyTotals.carbs}g / {targets.carbohydrates}g ({carbsPercent}%)</span>
                  </div>
                  <div className="macro-track">
                    <div className="macro-bar" style={{ width: `${Math.min(carbsPercent, 100)}%`, background: 'var(--info)' }}></div>
                  </div>
                </div>

                {/* Protein */}
                <div className="macro-bar-container">
                  <div className="macro-bar-labels">
                    <span className="macro-name">Protein</span>
                    <span className="macro-values">{dailyTotals.protein}g / {targets.proteins}g ({proteinPercent}%)</span>
                  </div>
                  <div className="macro-track">
                    <div className="macro-bar" style={{ width: `${Math.min(proteinPercent, 100)}%`, background: 'var(--success)' }}></div>
                  </div>
                </div>

                {/* Fat */}
                <div className="macro-bar-container">
                  <div className="macro-bar-labels">
                    <span className="macro-name">Fats</span>
                    <span className="macro-values">{dailyTotals.fat}g / {targets.fats}g ({fatPercent}%)</span>
                  </div>
                  <div className="macro-track">
                    <div className="macro-bar" style={{ width: `${Math.min(fatPercent, 100)}%`, background: 'var(--warning)' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Goals, suggestions, recommendations and info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Active Diet Plan Target Details */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={18} style={{ color: 'var(--warning)' }} /> Active Diet Plan
              </h3>
              {dietPlan ? (
                <div>
                  <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginBottom: '6px' }}>{dietPlan.name}</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>
                    Goal: <span style={{ textTransform: 'capitalize', color: 'var(--primary)' }}>{dietPlan.goal.replace('_', ' ')}</span>
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Target Calories:</span>
                      <span style={{ fontWeight: '700' }}>{targets.calories} kcal</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Target Carbs:</span>
                      <span style={{ fontWeight: '700' }}>{targets.carbohydrates} g</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Target Protein:</span>
                      <span style={{ fontWeight: '700' }}>{targets.proteins} g</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Target Fats:</span>
                      <span style={{ fontWeight: '700' }}>{targets.fats} g</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>No active diet plan found.</p>
                  <button onClick={() => setActivePage('plans')} className="btn btn-secondary" style={{ width: '100%', padding: '8px 16px', fontSize: '0.85rem' }}>
                    Create Diet Plan <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Smart Recommendations */}
            <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(15, 23, 42, 0.65) 100%)', borderLeft: '3px solid var(--primary)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} style={{ color: 'var(--primary)' }} /> Live Guidance
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-main)' }}>
                {getRecommendation()}
              </p>
            </div>

            {/* Medical Disclaimer */}
            <div className="glass-panel" style={{ padding: '20px', borderLeft: '3px solid var(--warning)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <ShieldAlert size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '4px', color: 'var(--warning)' }}>Medical Disclaimer</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    This assistant offers nutritional calculations and guidance. It should complement, not replace, professional medical or dietary advice. Consult qualified healthcare providers before starting any new health program.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animation spins CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
