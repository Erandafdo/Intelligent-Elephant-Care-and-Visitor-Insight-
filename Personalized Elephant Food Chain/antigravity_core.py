import pandas as pd

def calculate_bmr_food(weight_kg):
    """
    Base food requirement estimation.
    Elephants eat approx 4-6% of body weight in wet fodder/forage.
    """
    return weight_kg * 0.05

def get_activity_modifier(activity_level, activity_score=None):
    """
    activity_level: Baseline (Low, Medium, High)
    activity_score: Dynamic daily score (0.0 - 2.0). If None, uses baseline defaults.
    """
    if activity_score is not None:
        # Dynamic Antigravity adjustment
        # Normal range ~1.0. High > 1.2. Low < 0.8
        return max(0.8, min(1.5, activity_score)) 
    
    # Fallback/Baseline Logic (Gravity)
    modifiers = {
        "Low": 0.9,
        "Medium": 1.0,
        "High": 1.2
    }
    return modifiers.get(activity_level, 1.0)

def get_weather_modifier(temp_c):
    """
    Cold weather requiring more energy.
    Hot weather might reduce appetite or need for metabolic heat.
    """
    if temp_c < 15:
        return 1.10 # +10% for cold
    elif temp_c > 30:
        return 0.95 # -5% for heat
    return 1.0

def get_health_modifier(health_status):
    """
    Adjust for health.
    """
    if health_status == 'Weak':
        return 0.85 # Reduce bulk, increase quality (handled in remarks)
    elif health_status == 'Recovering':
        return 0.95
    return 1.0

def recommend_food(elephant, daily_data):
    """
    Core Antigravity Function.
    
    elephant: dict or row {weight_kg, activity_level, ...}
    daily_data: dict {temperature_c, activity_score, health_status, ...}
    
    Returns: dict {morning_kg, evening_kg, total_kg, remark}
    """
    
    # Base
    base_kg = calculate_bmr_food(elephant['weight_kg'])
    
    # Multipliers
    act_mod = get_activity_modifier(elephant.get('activity_level'), daily_data.get('activity_score'))
    weather_mod = get_weather_modifier(daily_data.get('temperature_c', 25))
    health_mod = get_health_modifier(daily_data.get('health_status', 'Healthy'))
    
    # Total Calculation
    total_kg = base_kg * act_mod * weather_mod * health_mod
    
    # Split
    morning_kg = total_kg * 0.60
    evening_kg = total_kg * 0.40
    
    # Generate Remark
    reasons = []
    if act_mod > 1.1: reasons.append("High activity")
    elif act_mod < 0.9: reasons.append("Low activity")
    
    if weather_mod > 1.05: reasons.append("Cold weather compensation")
    
    if health_mod < 1.0: reasons.append(f"Reduced for health ({daily_data.get('health_status')})")
    
    if not reasons:
        remark = "Stable intake"
    else:
        remark = ", ".join(reasons)
        
    return {
        "morning_kg": round(morning_kg, 1),
        "evening_kg": round(evening_kg, 1),
        "total_kg": round(total_kg, 1),
        "remark": remark
    }
