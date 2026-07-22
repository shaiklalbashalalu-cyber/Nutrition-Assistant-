import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ChevronDown, BookOpen, ChefHat, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../config';

const MealLogger = ({ selectedDate, setAlert, onAuthFailure }) => {
  const [meals, setMeals] = useState([]);
  const [foods, setFoods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [logMealType, setLogMealType] = useState('Breakfast');
  const [loading, setLoading] = useState(false);

  // Custom Food Form State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFood, setCustomFood] = useState({
    name: '',
    calories: '',
    carbohydrates: '',
    proteins: '',
    fats: '',
    servingSize: 100,
  });

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  // Fetch logged meals for current date
  const fetchMeals = async () => {
    const token = localStorage.getItem('nutrition_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/meals/daily?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        onAuthFailure();
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setMeals(data);
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [selectedDate]);

  // Handle food search (with manual search trigger or trigger on change)
  useEffect(() => {
    const searchFoods = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      const token = localStorage.getItem('nutrition_token');
      try {
        const response = await fetch(`${API_BASE_URL}/api/foods?search=${searchTerm}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 401) {
          onAuthFailure();
          return;
        }
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data);
        }
      } catch (error) {
        console.error('Error searching foods:', error);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      searchFoods();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Log food to a meal
  const handleLogFoodSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFood) return;

    const token = localStorage.getItem('nutrition_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/meals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          mealType: logMealType,
          foodId: selectedFood._id,
          quantity: Number(quantity),
        }),
      });

      if (response.status === 401) {
        onAuthFailure();
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setAlert({ type: 'success', message: `Logged ${selectedFood.name} to ${logMealType}!` });
        setSelectedFood(null);
        setSearchTerm('');
        setSearchResults([]);
        setQuantity(1);
        fetchMeals();
      } else {
        throw new Error(data.message || 'Failed to log meal item');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  // Remove meal item
  const handleRemoveItem = async (mealId, itemId) => {
    const token = localStorage.getItem('nutrition_token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/meals/${mealId}/item/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        onAuthFailure();
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setAlert({ type: 'success', message: 'Meal item removed successfully' });
        fetchMeals();
      } else {
        throw new Error(data.message || 'Failed to remove meal item');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  // Create custom food
  const handleCustomFoodSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('nutrition_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/foods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: customFood.name,
          calories: Number(customFood.calories),
          carbohydrates: Number(customFood.carbohydrates),
          proteins: Number(customFood.proteins),
          fats: Number(customFood.fats),
          servingSize: Number(customFood.servingSize) || 100,
        }),
      });

      if (response.status === 401) {
        onAuthFailure();
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setAlert({ type: 'success', message: `Custom food ${customFood.name} registered!` });
        setShowCustomModal(false);
        setCustomFood({ name: '', calories: '', carbohydrates: '', proteins: '', fats: '', servingSize: 100 });
        // Set newly created food as selected
        setSelectedFood(data);
      } else {
        throw new Error(data.message || 'Failed to create food');
      }
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Food Consumption Logger</h1>
          <p style={{ color: 'var(--text-muted)' }}>Search and record meals consumed on {selectedDate}.</p>
        </div>

        <button onClick={() => setShowCustomModal(true)} className="btn btn-secondary">
          <Sparkles size={16} style={{ color: 'var(--secondary)' }} /> Add Custom Food
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Log food panel */}
        <div className="glass-panel" style={{ padding: '24px', position: 'sticky', top: '40px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ChefHat size={18} style={{ color: 'var(--primary)' }} /> Log Food
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Search Database</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-dark)' }} />
                <input
                  type="text"
                  placeholder="e.g. Chicken Breast, Egg, Banana"
                  className="glass-input"
                  style={{ paddingLeft: '40px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Search Dropdown list */}
              {searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((food) => (
                    <div
                      key={food._id}
                      className="search-item"
                      onClick={() => {
                        setSelectedFood(food);
                        setSearchTerm('');
                        setSearchResults([]);
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600' }}>{food.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {food.servingSize}g serving size
                        </div>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>
                        {food.calories} kcal
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Food Logging Form */}
            {selectedFood ? (
              <form onSubmit={handleLogFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-glass)', padding: '16px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.01)' }}>
                <div>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '4px' }}>{selectedFood.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Nutrition facts per serving ({selectedFood.servingSize}g):
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Cal: <strong>{selectedFood.calories}</strong></span>
                    <span>Carbs: <strong>{selectedFood.carbohydrates}g</strong></span>
                    <span>Prot: <strong>{selectedFood.proteins}g</strong></span>
                    <span>Fat: <strong>{selectedFood.fats}g</strong></span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Meal Category</label>
                  <select
                    className="glass-input"
                    value={logMealType}
                    onChange={(e) => setLogMealType(e.target.value)}
                  >
                    {mealTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Quantity (Servings)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="range"
                      min="0.25"
                      max="10"
                      step="0.25"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--primary)' }}
                    />
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      className="glass-input"
                      style={{ width: '80px', padding: '6px 8px', textAlign: 'center' }}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                    Log {quantity} Serving{quantity > 1 ? 's' : ''}
                  </button>
                  <button type="button" onClick={() => setSelectedFood(null)} className="btn btn-secondary" style={{ padding: '10px' }}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', border: '2px dashed var(--border-glass)', borderRadius: 'var(--radius-sm)' }}>
                <p style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>Select a food item to log</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Logged meals sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {mealTypes.map((mealType) => {
            const matchedMeal = meals.find((m) => m.mealType === mealType);
            const items = matchedMeal ? matchedMeal.items : [];
            const fact = matchedMeal ? matchedMeal.nutritionFact : { calories: 0, carbohydrates: 0, proteins: 0, fats: 0 };

            return (
              <div key={mealType} className="meal-section-card glass-panel">
                <div className="meal-section-header">
                  <div className="meal-section-title">
                    <h3 style={{ fontSize: '1.2rem' }}>{mealType}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  {fact.calories > 0 && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>C: <strong style={{ color: 'var(--info)' }}>{Math.round(fact.carbohydrates)}g</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>P: <strong style={{ color: 'var(--success)' }}>{Math.round(fact.proteins)}g</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>F: <strong style={{ color: 'var(--warning)' }}>{Math.round(fact.fats)}g</strong></span>
                      <span style={{ fontSize: '1rem', fontWeight: '800', borderLeft: '1px solid var(--border-glass)', paddingLeft: '12px' }}>
                        {fact.calories} kcal
                      </span>
                    </div>
                  )}
                </div>

                {items.length > 0 ? (
                  <div className="meal-list">
                    {items.map((item) => {
                      if (!item.food) return null;
                      return (
                        <div key={item._id} className="meal-item-row">
                          <div className="meal-item-info">
                            <div className="meal-item-name">{item.food.name}</div>
                            <div className="meal-item-serving">
                              Qty: {item.quantity} serving{item.quantity !== 1 ? 's' : ''} ({Math.round(item.food.servingSize * item.quantity)}g)
                            </div>
                            <div className="meal-item-macros">
                              <span>C: {Math.round(item.food.carbohydrates * item.quantity)}g</span>
                              <span>P: {Math.round(item.food.proteins * item.quantity)}g</span>
                              <span>F: {Math.round(item.food.fats * item.quantity)}g</span>
                            </div>
                          </div>
                          
                          <div className="meal-item-actions">
                            <div className="meal-item-calories">
                              {Math.round(item.food.calories * item.quantity)} kcal
                            </div>
                            <button
                              onClick={() => handleRemoveItem(matchedMeal._id, item._id)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', transition: 'var(--transition)' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-dark)', fontSize: '0.9rem', textAlign: 'center', padding: '16px 0' }}>
                    No meals logged yet.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Food Creation Modal */}
      {showCustomModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} style={{ color: 'var(--secondary)' }} /> Add Custom Food Database Item
            </h3>
            
            <form onSubmit={handleCustomFoodSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Food Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oatmeal with Chia Seeds"
                  className="glass-input"
                  value={customFood.name}
                  onChange={(e) => setCustomFood({ ...customFood, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150"
                    className="glass-input"
                    value={customFood.calories}
                    onChange={(e) => setCustomFood({ ...customFood, calories: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Serving Size (g/ml)</label>
                  <input
                    type="number"
                    required
                    placeholder="100"
                    className="glass-input"
                    value={customFood.servingSize}
                    onChange={(e) => setCustomFood({ ...customFood, servingSize: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="0"
                    className="glass-input"
                    value={customFood.carbohydrates}
                    onChange={(e) => setCustomFood({ ...customFood, carbohydrates: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="0"
                    className="glass-input"
                    value={customFood.proteins}
                    onChange={(e) => setCustomFood({ ...customFood, proteins: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fats (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="0"
                    className="glass-input"
                    value={customFood.fats}
                    onChange={(e) => setCustomFood({ ...customFood, fats: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Item
                </button>
                <button type="button" onClick={() => setShowCustomModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealLogger;
