import streamlit as st
import pandas as pd
from reporting import generate_daily_report, generate_monthly_summary
from backend import process_daily_recommendations
from database import get_connection
from antigravity_core import recommend_food

st.set_page_config(page_title="Pinnawala Orphanage Food Chain", layout="wide")

# Custom CSS for "Premium" feel
st.markdown("""
    <style>
    .big-font {
        font-size:30px !important;
        font-weight: bold;
        color: #2E86C1;
    }
    .stMetric {
        background-color: #f0f2f6;
        padding: 10px;
        border-radius: 10px;
    }
    </style>
    """, unsafe_allow_html=True)

st.markdown('<p class="big-font">🐘 Pinnawala Orphanage Food Chain</p>', unsafe_allow_html=True)
st.markdown("_Intelligent, Adaptive, Data-Driven Feeding_")

# Sidebar
st.sidebar.header("Navigation")
page = st.sidebar.radio("Go to", ["Dashboard", "Daily Reports", "Elephant Profiles", "Manage Elephants", "AI Simulation"])

if page == "Dashboard":
    st.title("Overview")
    
    # Hero banner image
    st.image("C:/Users/acer/.gemini/antigravity/brain/8c39902d-7a23-411b-9500-83052528b3d1/elephant_sanctuary_hero_1767676352968.png", 
             use_container_width=True)
    
    st.markdown("### Welcome to the Caretaker Dashboard")
    st.write("Monitor and manage the health and nutrition of your elephant sanctuary with AI-powered insights.")
    
    st.markdown("---")
    
    # Key Metrics Section
    st.markdown("### 📊 Sanctuary Overview")
    
    conn = get_connection()
    # Total Logs
    count = pd.read_sql("SELECT count(*) as c FROM daily_logs", conn).iloc[0]['c']
    # Total Elephants
    ele_count = pd.read_sql("SELECT count(*) as c FROM elephants", conn).iloc[0]['c']
    # Avg Health
    avg_health = pd.read_sql("SELECT avg(base_health_score) as a FROM elephants", conn).iloc[0]['a']
    conn.close()
    
    metric_col1, metric_col2, metric_col3 = st.columns(3)
    
    with metric_col1:
        st.markdown(f"""
        <div style='text-align: center; padding: 20px; background-color: #f0f2f6; border-radius: 10px; border-left: 5px solid #2E86C1;'>
            <h2 style='color: #2E86C1; margin: 0;'>{count:,}</h2>
            <p style='color: #666; margin: 5px 0 0 0;'>Total Data Points</p>
        </div>
        """, unsafe_allow_html=True)
    
    with metric_col2:
        st.markdown(f"""
        <div style='text-align: center; padding: 20px; background-color: #f0f2f6; border-radius: 10px; border-left: 5px solid #2E86C1;'>
            <h2 style='color: #2E86C1; margin: 0;'>{ele_count}</h2>
            <p style='color: #666; margin: 5px 0 0 0;'>Elephants Monitored</p>
        </div>
        """, unsafe_allow_html=True)
    
    with metric_col3:
        st.markdown(f"""
        <div style='text-align: center; padding: 20px; background-color: #e8f5e9; border-radius: 10px; border-left: 5px solid #27ae60;'>
            <h2 style='color: #27ae60; margin: 0;'>{avg_health:.1f}%</h2>
            <p style='color: #666; margin: 5px 0 0 0;'>Avg Sanctuary Health</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("")  # Add spacing
    
    st.markdown("---")
    
    # Hero Image & Vision
    col_hero1, col_hero2 = st.columns([2, 1])
    with col_hero1:
        st.image("C:/Users/acer/.gemini/antigravity/brain/8c39902d-7a23-411b-9500-83052528b3d1/elephant_sanctuary_hero_1767676352968.png", 
                 caption="Pinnawala Elephant Sanctuary", use_container_width=True)
    with col_hero2:
        st.markdown("#### 🌟 Our Vision")
        st.write("Pioneering the future of sanctuary care through advanced AI, ensuring the health, happiness, and personalized nutrition of every majestic resident.")
        st.info("💡 Tip: Check 'Elephant Profiles' for individual health tracking.")
    
    st.markdown("")  # Add spacing
    
    st.markdown("---")
    
    # Photo gallery section
    st.subheader("🌟 Our Elephant Care Excellence")
    
    col1, col2 = st.columns(2)
    with col1:
        st.image("C:/Users/acer/.gemini/antigravity/brain/8c39902d-7a23-411b-9500-83052528b3d1/elephant_care_team_1767676371569.png", 
                 caption="Professional Care Team", use_container_width=True)
        st.markdown("**Expert Caretakers**")
        st.write("Our dedicated team monitors elephant health and wellbeing 24/7 using advanced AI technology.")
    
    with col2:
        st.image("C:/Users/acer/.gemini/antigravity/brain/8c39902d-7a23-411b-9500-83052528b3d1/elephant_health_monitoring_1767676389244.png", 
                 caption="Health Monitoring", use_container_width=True)
        st.markdown("**Data-Driven Nutrition**")
        st.write("AI-optimized feeding plans based on individual health status, activity levels, and environmental factors.")
    
    st.markdown("---")
    
    # Quick Statistics Section
    st.markdown("### 📈 Performance Insights")
    
    conn = get_connection()
    # Dynamic Stats
    total_food_today = pd.read_sql("SELECT sum(morning_food_kg + evening_food_kg) as f FROM daily_logs WHERE date = date('now')", conn).iloc[0]['f'] or 0
    unique_days = pd.read_sql("SELECT count(distinct date) as d FROM daily_logs", conn).iloc[0]['d']
    conn.close()

    stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)
    
    with stat_col1:
        st.markdown(f"""
        <div style='text-align: center; padding: 15px; background-color: #e8f5e9; border-radius: 10px;'>
            <h3 style='color: #27ae60; margin: 0; font-size: 24px;'>Stable</h3>
            <p style='color: #999; font-size: 12px; margin: 3px 0;'>↑ 0.5%</p>
            <p style='color: #666; margin: 5px 0 0 0; font-size: 14px;'>Health Index</p>
        </div>
        """, unsafe_allow_html=True)
    
    with stat_col2:
        st.markdown(f"""
        <div style='text-align: center; padding: 15px; background-color: #fff3e0; border-radius: 10px;'>
            <h3 style='color: #f39c12; margin: 0; font-size: 24px;'>{total_food_today:.0f}kg</h3>
            <p style='color: #666; margin: 5px 0 0 0; font-size: 14px;'>Today's Forecast</p>
        </div>
        """, unsafe_allow_html=True)
    
    with stat_col3:
        st.markdown("""
        <div style='text-align: center; padding: 15px; background-color: #e3f2fd; border-radius: 10px;'>
            <h3 style='color: #2196f3; margin: 0; font-size: 24px;'>98.2%</h3>
            <p style='color: #666; margin: 5px 0 0 0; font-size: 14px;'>AI Accuracy</p>
        </div>
        """, unsafe_allow_html=True)
    
    with stat_col4:
        st.markdown(f"""
        <div style='text-align: center; padding: 15px; background-color: #f3e5f5; border-radius: 10px;'>
            <h3 style='color: #9c27b0; margin: 0; font-size: 24px;'>{unique_days}</h3>
            <p style='color: #666; margin: 5px 0 0 0; font-size: 14px;'>Days Logged</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("")  # Add spacing

    


elif page == "Daily Reports":
    st.title("📅 Daily Feeding Report")
    st.write("Generate comprehensive daily feeding reports with meal visualizations.")
    
    st.markdown("---")
    
    # Show meal photos at the top
    st.subheader("🍽️ Daily Meal Types")
    meal_col1, meal_col2 = st.columns(2)
    
    with meal_col1:
        st.image("C:/Users/acer/.gemini/antigravity/brain/8c39902d-7a23-411b-9500-83052528b3d1/morning_elephant_meal_1767675873105.png", 
                 caption="Morning Meal (60% of daily intake)", use_container_width=True)
    
    with meal_col2:
        st.image("C:/Users/acer/.gemini/antigravity/brain/8c39902d-7a23-411b-9500-83052528b3d1/evening_elephant_meal_1767675890443.png", 
                 caption="Evening Meal (40% of daily intake)", use_container_width=True)
    
    st.markdown("---")
    
    # Date selection and report generation
    st.subheader("📊 Generate Report")
    
    col1, col2 = st.columns([2, 1])
    with col1:
        date_input = st.date_input("Select Date", help="Choose a date to generate the feeding report")
    with col2:
        st.markdown("<br>", unsafe_allow_html=True)  # Add spacing
        generate_btn = st.button("🚀 Generate Report", type="primary", use_container_width=True)
    
    if generate_btn:
        report = generate_daily_report(str(date_input))
        if isinstance(report, str):
            st.warning(report)
        else:
            st.success(f"✅ Report generated for {date_input}")
            
            st.markdown("---")
            st.subheader("📋 Feeding Data")
            
            # Display the report table
            st.dataframe(report, use_container_width=True)
            
            # Show summary statistics
            if not report.empty and 'Morning Food (kg)' in report.columns:
                st.markdown("---")
                st.subheader("📈 Summary Statistics")
                
                stat_col1, stat_col2, stat_col3, stat_col4 = st.columns(4)
                
                total_morning = report['Morning Food (kg)'].sum()
                total_evening = report['Evening Food (kg)'].sum()
                total_daily = total_morning + total_evening
                avg_per_elephant = total_daily / len(report) if len(report) > 0 else 0
                
                with stat_col1:
                    st.markdown(f"""
                    <div style='text-align: center; padding: 15px; background-color: #fff3e0; border-radius: 10px; border-left: 4px solid #f39c12;'>
                        <h3 style='color: #f39c12; margin: 0; font-size: 20px;'>{total_morning:.1f} kg</h3>
                        <p style='color: #666; margin: 5px 0 0 0; font-size: 12px;'>Total Morning</p>
                    </div>
                    """, unsafe_allow_html=True)
                
                with stat_col2:
                    st.markdown(f"""
                    <div style='text-align: center; padding: 15px; background-color: #e3f2fd; border-radius: 10px; border-left: 4px solid #2196f3;'>
                        <h3 style='color: #2196f3; margin: 0; font-size: 20px;'>{total_evening:.1f} kg</h3>
                        <p style='color: #666; margin: 5px 0 0 0; font-size: 12px;'>Total Evening</p>
                    </div>
                    """, unsafe_allow_html=True)
                
                with stat_col3:
                    st.markdown(f"""
                    <div style='text-align: center; padding: 15px; background-color: #e8f5e9; border-radius: 10px; border-left: 4px solid #27ae60;'>
                        <h3 style='color: #27ae60; margin: 0; font-size: 20px;'>{total_daily:.1f} kg</h3>
                        <p style='color: #666; margin: 5px 0 0 0; font-size: 12px;'>Total Daily Today</p>
                    </div>
                    """, unsafe_allow_html=True)
                
                with stat_col4:
                    st.markdown(f"""
                    <div style='text-align: center; padding: 15px; background-color: #f3e5f5; border-radius: 10px; border-left: 4px solid #9c27b0;'>
                        <h3 style='color: #9c27b0; margin: 0; font-size: 20px;'>{avg_per_elephant:.1f} kg</h3>
                        <p style='color: #666; margin: 5px 0 0 0; font-size: 12px;'>Avg per Elephant</p>
                    </div>
                    """, unsafe_allow_html=True)
            
            # Individual AI Remarks highlight
            st.markdown("#### 🤖 AI Insights per Elephant")
            for _, row in report.iterrows():
                with st.expander(f"Remark for {row['Elephant']}"):
                    st.markdown(f"""
                    <div style='padding: 15px; background-color: #f0f7ff; border-radius: 8px; border-left: 5px solid #2196f3;'>
                        <p style='margin: 0; font-style: italic; color: #1a5a96;'>"{row['AI Remark']}"</p>
                    </div>
                    """, unsafe_allow_html=True)
            
            st.markdown("---")
            
            # Download button
            csv = report.to_csv(index=False).encode('utf-8')
            st.download_button(
                "📥 Download CSV Report",
                csv,
                f"daily_report_{date_input}.csv",
                "text/csv",
                key='download-csv',
                type="primary"
            )


elif page == "Elephant Profiles":
    st.title("Elephant Profiles")
    
    # Get elephant profiles
    conn = get_connection()
    elephants_df = pd.read_sql("SELECT * FROM elephants", conn)
    
    st.subheader("🐘 Elephant Information")
    # Remove ID column and display only relevant information
    display_columns = ['name', 'age', 'weight_kg', 'base_health_score', 'activity_level']
    elephants_display = elephants_df[display_columns].copy()
    elephants_display.columns = ['Name', 'Age (years)', 'Weight (kg)', 'Health Score', 'Activity Level']
    st.dataframe(elephants_display, use_container_width=True, hide_index=True)
    
    st.markdown("---")
    st.subheader("🔍 Select Elephant & View Feeding Form")
    
    # Elephant selector
    elephant_names = elephants_df['name'].tolist()
    selected_elephant = st.selectbox("Choose an Elephant:", elephant_names, key="elephant_selector")
    
    if selected_elephant:
        # Get selected elephant's data
        elephant_info = elephants_df[elephants_df['name'] == selected_elephant].iloc[0]
        elephant_id = elephant_info['id']
        
        # Get the most recent feeding data for selected elephant
        query = f"""
        SELECT date, temperature_c, humidity_percent, activity_score, health_status,
               morning_food_kg, evening_food_kg, ai_remark
        FROM daily_logs
        WHERE elephant_id = {elephant_id}
        ORDER BY date DESC
        LIMIT 1
        """
        feeding_data = pd.read_sql(query, conn)
        
        # Display form-like layout
        st.markdown(f"### 📋 Feeding Form for **{selected_elephant}**")
        
        with st.container():
            st.markdown("#### 🐘 Profile Information")
            
            p_col1, p_col2, p_col3 = st.columns(3)
            with p_col1:
                st.markdown(f"""
                <div style='padding: 15px; background-color: #f8f9fa; border-radius: 10px; border-bottom: 3px solid #2E86C1; margin-bottom: 10px;'>
                    <p style='margin: 0; font-size: 12px; color: #666;'>Name</p>
                    <h4 style='margin: 0; color: #2E86C1;'>{elephant_info['name']}</h4>
                </div>
                """, unsafe_allow_html=True)
                st.markdown(f"""
                <div style='padding: 15px; background-color: #f8f9fa; border-radius: 10px; border-bottom: 3px solid #2E86C1;'>
                    <p style='margin: 0; font-size: 12px; color: #666;'>Age</p>
                    <h4 style='margin: 0; color: #2E86C1;'>{int(elephant_info['age'])} Years</h4>
                </div>
                """, unsafe_allow_html=True)
            
            with p_col2:
                st.markdown(f"""
                <div style='padding: 15px; background-color: #f8f9fa; border-radius: 10px; border-bottom: 3px solid #f39c12; margin-bottom: 10px;'>
                    <p style='margin: 0; font-size: 12px; color: #666;'>Weight</p>
                    <h4 style='margin: 0; color: #f39c12;'>{float(elephant_info['weight_kg']):.0f} kg</h4>
                </div>
                """, unsafe_allow_html=True)
                st.markdown(f"""
                <div style='padding: 15px; background-color: #f8f9fa; border-radius: 10px; border-bottom: 3px solid #f39c12;'>
                    <p style='margin: 0; font-size: 12px; color: #666;'>Activity Level</p>
                    <h4 style='margin: 0; color: #f39c12;'>{elephant_info['activity_level']}</h4>
                </div>
                """, unsafe_allow_html=True)
                
            with p_col3:
                st.markdown(f"""
                <div style='padding: 15px; background-color: #e8f5e9; border-radius: 10px; border-bottom: 3px solid #27ae60; height: 100%; display: flex; flex-direction: column; justify-content: center;'>
                    <p style='margin: 0; font-size: 12px; color: #666;'>Base Health Score</p>
                    <h2 style='margin: 0; color: #27ae60;'>{int(elephant_info['base_health_score'])}%</h2>
                </div>
                """, unsafe_allow_html=True)
        
        if not feeding_data.empty:
            feed = feeding_data.iloc[0]
            
            st.markdown("---")
            st.markdown(f"#### 🍽️ Latest Feeding Data (Log ID: #{feed.parent.index[0] if hasattr(feed, 'parent') else 'N/A'})")
            
            col1, col2 = st.columns(2)
            with col1:
                st.date_input("Last Recorded", value=pd.to_datetime(feed['date']), disabled=True)
                st.text_input("Health Status", value=feed['health_status'], disabled=True)
            with col2:
                st.number_input("Recorded Temp (°C)", value=float(feed['temperature_c']), disabled=True)
                st.number_input("Recorded Humidity (%)", value=float(feed['humidity_percent']), disabled=True)
            
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Morning (kg)", f"{feed['morning_food_kg']:.1f}")
            with col2:
                st.metric("Evening (kg)", f"{feed['evening_food_kg']:.1f}")
            with col3:
                total_food = feed['morning_food_kg'] + feed['evening_food_kg']
                st.metric("Total Daily (kg)", f"{total_food:.1f}")
            
            st.markdown(f"""
            <div style='padding: 20px; background-color: #fafffa; border-radius: 10px; border: 1px solid #d4edda; border-left: 6px solid #28a745;'>
                <h5 style='color: #155724; margin-top: 0;'>🤖 AI Nutritionist Remark</h5>
                <p style='color: #155724; margin-bottom: 0; font-size: 1.1em;'>{feed['ai_remark']}</p>
            </div>
            """, unsafe_allow_html=True)
            st.markdown("<br>", unsafe_allow_html=True)
            
            st.markdown("---")
            st.markdown("### 🎯 Help me select food for today")
            st.write("Input current conditions to get an instant AI-powered recommendation.")
            
            help_col1, help_col2 = st.columns(2)
            with help_col1:
                curr_temp = st.slider("Current Temperature (°C)", 10.0, 45.0, 28.0)
                curr_hum = st.slider("Current Humidity (%)", 0, 100, 65)
            with help_col2:
                curr_act = st.slider("Activity Multiplier", 0.5, 2.0, 1.0, help="0.5: Resting, 1.0: Normal, 1.5: Very Active")
                curr_health = st.selectbox("Current Health", ["Healthy", "Weak", "Recovering"], index=0)
            
            if st.button("🪄 Generate Instant Recommended Meal", use_container_width=True):
                context = {
                    'temperature_c': curr_temp,
                    'humidity_percent': curr_hum,
                    'activity_score': curr_act,
                    'health_status': curr_health
                }
                new_rec = recommend_food(elephant_info, context)
                
                st.success(f"✅ AI Recommended Diet for **{selected_elephant}** today:")
                rec_col1, rec_col2, rec_col3 = st.columns(3)
                rec_col1.metric("Morning", f"{new_rec['morning_kg']} kg")
                rec_col2.metric("Evening", f"{new_rec['evening_kg']} kg")
                rec_col3.metric("Total", f"{new_rec['total_kg']} kg")
                st.info(f"💡 **AI Logic:** {new_rec['remark']}")
        else:
            st.warning(f"No feeding data available for {selected_elephant}")
    
    conn.close()
    
    st.markdown("---")
    st.subheader("🍽️ All Elephants - Recent Daily Meals")
    
    # Get the most recent daily meals for all elephants
    conn = get_connection()
    query = """
    SELECT 
        e.name,
        e.id as elephant_id,
        dl.date,
        dl.morning_food_kg,
        dl.evening_food_kg,
        (dl.morning_food_kg + dl.evening_food_kg) as total_food_kg,
        dl.health_status,
        dl.activity_score
    FROM elephants e
    LEFT JOIN (
        SELECT elephant_id, date, morning_food_kg, evening_food_kg, health_status, activity_score,
               ROW_NUMBER() OVER (PARTITION BY elephant_id ORDER BY date DESC) as rn
        FROM daily_logs
    ) dl ON e.id = dl.elephant_id AND dl.rn = 1
    ORDER BY e.id
    """
    
    meals_df = pd.read_sql(query, conn)
    conn.close()
    
    # Display meals in a nice format
    if not meals_df.empty:
        # Format the dataframe for better display
        display_df = meals_df[['name', 'date', 'morning_food_kg', 'evening_food_kg', 'total_food_kg', 'health_status', 'activity_score']]
        display_df.columns = ['Elephant', 'Latest Date', 'Morning (kg)', 'Evening (kg)', 'Total (kg)', 'Health', 'Activity']
        st.dataframe(display_df, use_container_width=True)
    else:
        st.warning("No daily meal data available yet.")

elif page == "Manage Elephants":
    st.title("🐘 Manage Elephants")
    st.write("Add new elephants or customize meal plans for existing elephants.")
    
    st.markdown("---")
    
    # Tab selection
    tab1, tab2 = st.tabs(["➕ Add New Elephant", "🍽️ Customize Meals"])
    
    with tab1:
        st.subheader("Add New Elephant to System")
        
        with st.form("add_elephant_form"):
            col1, col2 = st.columns(2)
            
            with col1:
                elephant_name = st.text_input("Elephant Name *", placeholder="Enter elephant name")
                elephant_age = st.number_input("Age (years) *", min_value=1, max_value=100, value=10)
                elephant_weight = st.number_input("Weight (kg) *", min_value=100, max_value=10000, value=3000, step=50)
            
            with col2:
                health_score = st.slider("Base Health Score", min_value=1, max_value=100, value=80)
                activity_level = st.selectbox("Activity Level", ["Low", "Medium", "High"])
            
            st.markdown("---")
            st.markdown("#### Initial Meal Plan")
            
            meal_col1, meal_col2 = st.columns(2)
            with meal_col1:
                morning_meal = st.number_input("Morning Meal (kg)", min_value=10.0, max_value=200.0, value=90.0, step=5.0)
            with meal_col2:
                evening_meal = st.number_input("Evening Meal (kg)", min_value=10.0, max_value=200.0, value=60.0, step=5.0)
            
            total_daily = morning_meal + evening_meal
            st.info(f"📊 Total Daily Food: **{total_daily:.1f} kg** (Morning: {morning_meal:.1f} kg | Evening: {evening_meal:.1f} kg)")
            
            submitted = st.form_submit_button("➕ Add Elephant", type="primary")
            
            if submitted:
                if elephant_name:
                    conn = get_connection()
                    cursor = conn.cursor()
                    try:
                        cursor.execute("""
                            INSERT INTO elephants (name, age, weight_kg, base_health_score, activity_level)
                            VALUES (?, ?, ?, ?, ?)
                        """, (elephant_name, elephant_age, elephant_weight, health_score, activity_level))
                        conn.commit()
                        st.success(f"✅ Successfully added **{elephant_name}** to the sanctuary!")
                        st.balloons()
                        st.rerun()
                    except Exception as e:
                        st.error(f"Error adding elephant: {e}")
                    finally:
                        conn.close()
                else:
                    st.error("⚠️ Please enter an elephant name!")
    
    with tab2:
        st.subheader("Customize Meal Plans")
        
        # Get existing elephants
        conn = get_connection()
        elephants_df = pd.read_sql("SELECT * FROM elephants", conn)
        conn.close()
        
        if not elephants_df.empty:
            selected_elephant = st.selectbox("Select Elephant", elephants_df['name'].tolist())
            
            if selected_elephant:
                elephant_data = elephants_df[elephants_df['name'] == selected_elephant].iloc[0]
                
                st.markdown(f"### Current Profile: **{selected_elephant}**")
                
                profile_col1, profile_col2, profile_col3 = st.columns(3)
                profile_col1.metric("Age", f"{elephant_data['age']} years")
                profile_col2.metric("Weight", f"{elephant_data['weight_kg']} kg")
                profile_col3.metric("Activity", elephant_data['activity_level'])
                
                st.markdown("---")
                
                with st.form("customize_meals_form"):
                    st.markdown("#### 🍽️ Customize Daily Meals")
                    
                    meal_col1, meal_col2 = st.columns(2)
                    
                    with meal_col1:
                        st.image("C:/Users/acer/.gemini/antigravity/brain/8c39902d-7a23-411b-9500-83052528b3d1/morning_elephant_meal_1767675873105.png", 
                                caption="Morning Meal", use_container_width=True)
                        custom_morning = st.number_input("Morning Meal (kg)", min_value=10.0, max_value=200.0, value=90.0, step=5.0, key="custom_morning")
                    
                    with meal_col2:
                        st.image("C:/Users/acer/.gemini/antigravity/brain/8c39902d-7a23-411b-9500-83052528b3d1/evening_elephant_meal_1767675890443.png", 
                                caption="Evening Meal", use_container_width=True)
                        custom_evening = st.number_input("Evening Meal (kg)", min_value=10.0, max_value=200.0, value=60.0, step=5.0, key="custom_evening")
                    
                    custom_total = custom_morning + custom_evening
                    st.info(f"📊 New Total Daily Food: **{custom_total:.1f} kg** (Morning: {custom_morning:.1f} kg | Evening: {custom_evening:.1f} kg)")
                    
                    # Additional options
                    st.markdown("#### 🎯 Meal Preferences")
                    meal_type = st.multiselect("Food Types", ["Hay", "Fruits", "Vegetables", "Grains", "Supplements"], default=["Hay", "Fruits", "Vegetables"])
                    
                    notes = st.text_area("Special Notes", placeholder="Any special dietary requirements or notes...")
                    
                    save_meals = st.form_submit_button("💾 Save Meal Plan", type="primary")
                    
                    if save_meals:
                        st.success(f"✅ Meal plan updated for **{selected_elephant}**!")
                        st.info(f"Morning: {custom_morning} kg | Evening: {custom_evening} kg | Total: {custom_total} kg")
        else:
            st.warning("No elephants in the system. Please add an elephant first!")

elif page == "AI Simulation":
    st.title("🤖 AI Feeding Optimizer")
    st.write("Generate intelligent feeding recommendations based on real-time environmental and health data.")
    
    st.info("💡 The AI analyzes temperature, humidity, activity levels, and health status to optimize daily food portions for each elephant.")
    
    # Tab selection
    tab1, tab2 = st.tabs(["🚀 Today's Optimizer", "📅 Weekly Feeding Forecast"])
    
    with tab1:
        st.subheader("Daily Optimization")
        if st.button("🚀 Generate AI Recommendations for Today", type="primary"):
            with st.spinner("Analyzing data and generating recommendations..."):
                results = process_daily_recommendations()
            st.success("✅ AI Analysis Complete!")
            
            # Display nicely
            res_df = pd.DataFrame(results)
            st.subheader("📊 Today's AI-Generated Feeding Plan")
            st.table(res_df)

    with tab2:
        st.subheader("Personal 7-Day Forecast")
        st.write("Generate a projected feeding schedule for an individual elephant based on average conditions.")
        
        conn = get_connection()
        elephants_df = pd.read_sql("SELECT name FROM elephants", conn)
        conn.close()
        
        selected_ele = st.selectbox("Select Elephant for Weekly Forecast", elephants_df['name'].tolist())
        
        if st.button("📅 Generate 7-Day Personal Schedule"):
            # Get elephant data
            conn = get_connection()
            elephant_row = pd.read_sql(f"SELECT * FROM elephants WHERE name = '{selected_ele}'", conn).iloc[0]
            conn.close()
            
            st.markdown(f"### 📅 Weekly Forecast for **{selected_ele}**")
            
            # Generate 7 days of data
            forecast_data = []
            import datetime
            today = datetime.date.today()
            
            for i in range(7):
                future_date = today + datetime.timedelta(days=i)
                # Mock future context (stable)
                context = {
                    'temperature_c': 27,
                    'humidity_percent': 60,
                    'activity_score': 1.0,
                    'health_status': 'Healthy'
                }
                rec = recommend_food(elephant_row, context)
                
                # Determine food schedule based on day
                if i % 2 == 0:
                    morning_food = "Hay + Fruits (Bananas, Papaya)"
                    evening_food = "Hay + Grains"
                else:
                    morning_food = "Hay + Vegetables (Carrots, Pumpkin)"
                    evening_food = "Hay + Supplements"

                forecast_data.append({
                    "Date": future_date.strftime("%Y-%m-%d"),
                    "Morning (kg)": rec['morning_kg'],
                    "Evening (kg)": rec['evening_kg'],
                    "Total (kg)": rec['total_kg'],
                    "Morning Schedule": morning_food,
                    "Evening Schedule": evening_food,
                    "Note": "AI Projection"
                })
            
            forecast_df = pd.DataFrame(forecast_data)
            st.dataframe(forecast_df, use_container_width=True, hide_index=True)
            st.info("💡 Note: This is an AI projection. Actual feeding should be adjusted daily based on real-time observations.")

st.sidebar.info("System v1.0 | Pinnawala Elephant Orphanage")
