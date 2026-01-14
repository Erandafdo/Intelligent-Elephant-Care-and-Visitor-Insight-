"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  DollarSign,
  Users,
  BarChart3,
  Sparkles,
  LogOut,
  TrendingUp,
  Activity,
  MapPin,
  Zap,
  Bell,
  Settings,
  Calendar
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";

interface HeatmapPoint {
  time: string;
  location: string;
  intensity: number;
}
interface Suggestion {
  action: string;
  reason: string;
  confidence: number;
}
interface FinancialData {
  total_revenue: number;
  total_tickets: number;
}
interface Event {
  event_name: string;
  current_count: number;
}
interface ForecastRecord {
  date: string;
  hour: string;
  location: string;
  predicted_visitors: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [finance, setFinance] = useState<FinancialData | null>(null);
  const [totalLiveVisitors, setTotalLiveVisitors] = useState(0);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [tomorrowPieData, setTomorrowPieData] = useState<any[]>([]);
  const [todayPieData, setTodayPieData] = useState<any[]>([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_auth") === "true";
    if (!isAdmin) {
      router.push("/login");
      return;
    }

    async function fetchData() {
      try {
        const [resHeat, resSugg, resFin, resEvents, resFore] = await Promise.all([
          fetch("http://localhost:8000/admin/analytics/heatmap"),
          fetch("http://localhost:8000/admin/analytics/suggestions"),
          fetch("http://localhost:8000/admin/analytics/finance"),
          fetch("http://localhost:8000/events"),
          fetch("http://localhost:8000/admin/analytics/forecast")
        ]);

        const dataHeat = await resHeat.json();
        if (dataHeat.status === "success") setHeatmapData(dataHeat.data);

        const dataSugg = await resSugg.json();
        if (dataSugg.status === "success") setSuggestions(dataSugg.suggestions);

        const dataFin = await resFin.json();
        if (dataFin.status === "success") setFinance(dataFin.data);

        const dataEvents = await resEvents.json();
        if (dataEvents.status === "success") {
          const events: Event[] = dataEvents.daily_timetable;
          const total = events.reduce((sum, e) => sum + e.current_count, 0);
          setTotalLiveVisitors(total);
        }

        const dataFore = await resFore.json();
        if (dataFore.status === "success") {
          const raw: ForecastRecord[] = dataFore.data;
          if (raw.length > 0) {
            const grouped = new Map<string, any>();
            raw.forEach(r => {
              const key = `${r.date} ${r.hour}`;
              if (!grouped.has(key)) {
                grouped.set(key, { name: r.hour, fullDate: r.date, timestamp: key });
              }
              const entry = grouped.get(key);
              entry[r.location] = r.predicted_visitors;
            });
            setForecastData(Array.from(grouped.values()).slice(0, 168)); // 7 days * 24 hours

            // Tomorrow's forecast for pie chart
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            const tomorrowRecords = raw.filter(r => r.date === tomorrowStr);
            const locationMap = new Map<string, number>();
            tomorrowRecords.forEach(r => {
              locationMap.set(r.location, (locationMap.get(r.location) || 0) + r.predicted_visitors);
            });
            setTomorrowPieData(Array.from(locationMap.entries()).map(([name, value]) => ({ name, value })));

            // Today's forecast by time periods
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];
            const todayRecords = raw.filter(r => r.date === todayStr);
            const timePeriodMap = new Map<string, number>();
            todayRecords.forEach(r => {
              const hour = parseInt(r.hour.split(':')[0]);
              let period = '';
              if (hour >= 6 && hour < 12) period = 'Morning (6AM-12PM)';
              else if (hour >= 12 && hour < 17) period = 'Afternoon (12PM-5PM)';
              else if (hour >= 17 && hour < 21) period = 'Evening (5PM-9PM)';
              else period = 'Night (9PM-6AM)';
              timePeriodMap.set(period, (timePeriodMap.get(period) || 0) + r.predicted_visitors);
            });
            setTodayPieData(Array.from(timePeriodMap.entries()).map(([name, value]) => ({ name, value })));
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/login");
  };

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FEFAE0'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #D4A373',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          margin: '0 auto 20px',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ fontSize: '16px', fontWeight: '600', color: '#0D2B1A' }}>Loading Dashboard...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#FEFAE0' }}>
      {/* TOP NAVIGATION */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #FAEDCD',
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(13, 43, 26, 0.05)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #1A4D2E 0%, #276F43 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(26, 77, 46, 0.3)'
            }}>
              <LayoutDashboard style={{ width: '26px', height: '26px', color: 'white' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0D2B1A', margin: 0 }}>Pinnawala Admin</h1>
              <p style={{ fontSize: '13px', color: '#8B5E3C', margin: 0 }}>Analytics Dashboard</p>
            </div>
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button style={{
              padding: '12px',
              background: '#FAEDCD',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F5E6C8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FAEDCD'}
            >
              <Bell style={{ width: '20px', height: '20px', color: '#0D2B1A' }} />
              <span style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                background: '#EF4444',
                borderRadius: '50%',
                border: '2px solid white'
              }} />
            </button>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 16px',
              background: '#FAEDCD',
              borderRadius: '12px'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1A4D2E 0%, #276F43 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'white'
              }}>DS</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#0D2B1A' }}>System Admin</div>
                <div style={{ fontSize: '12px', color: '#8B5E3C' }}>Administrator</div>
              </div>
            </div>

            <button onClick={handleLogout} style={{
              padding: '12px',
              background: '#FEE2E2',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#FECACA'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#FEE2E2'}
            >
              <LogOut style={{ width: '20px', height: '20px', color: '#DC2626' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 30px' }}>

        {/* Page Header */}
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0D2B1A', margin: '0 0 10px 0' }}>Dashboard Overview</h2>
          <p style={{ fontSize: '15px', color: '#8B5E3C', margin: 0 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* STATS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* Revenue Card */}
          <div style={{
            background: 'linear-gradient(135deg, #D4A373 0%, #8B5E3C 100%)',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 8px 16px rgba(212, 163, 115, 0.25)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <DollarSign style={{ width: '28px', height: '28px' }} />
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)'
                }}>+12.5%</div>
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Revenue</div>
              <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '8px' }}>Rs. {finance?.total_revenue?.toLocaleString() ?? "0"}</div>
              <div style={{ fontSize: '13px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp style={{ width: '16px', height: '16px' }} /> vs last month
              </div>
            </div>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              transform: 'rotate(45deg)'
            }} />
          </div>

          {/* Live Visitors Card */}
          <div style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Users style={{ width: '28px', height: '28px' }} />
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Activity style={{ width: '14px', height: '14px' }} /> Live
                </div>
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Active Visitors</div>
              <div style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '8px' }}>{totalLiveVisitors}</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Currently in park</div>
            </div>
            <div style={{
              position: 'absolute',
              top: '-50%',
              right: '-20%',
              width: '200%',
              height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              transform: 'rotate(45deg)'
            }} />
          </div>

          {/* Tickets Sold Card */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(13, 43, 26, 0.08)',
            border: '1px solid #FAEDCD'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: '#FAEDCD',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 style={{ width: '28px', height: '28px', color: '#8B5E3C' }} />
              </div>
            </div>
            <div style={{ fontSize: '14px', color: '#8B5E3C', marginBottom: '8px', fontWeight: '600' }}>Tickets Sold</div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#0D2B1A', marginBottom: '8px' }}>{finance?.total_tickets?.toLocaleString() ?? "0"}</div>
            <div style={{ fontSize: '13px', color: '#8B5E3C' }}>This month</div>
          </div>

          {/* AI Status Card */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(13, 43, 26, 0.08)',
            border: '1px solid #FAEDCD'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'linear-gradient(135deg, #1A4D2E 0%, #276F43 100%)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles style={{ width: '28px', height: '28px', color: 'white' }} />
              </div>
              <div style={{
                padding: '6px 12px',
                background: '#D1FAE5',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#065F46'
              }}>Active</div>
            </div>
            <div style={{ fontSize: '14px', color: '#8B5E3C', marginBottom: '8px', fontWeight: '600' }}>AI Forecasting</div>
            <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#0D2B1A', marginBottom: '8px' }}>94%</div>
            <div style={{ fontSize: '13px', color: '#8B5E3C' }}>Accuracy rate</div>
          </div>
        </div>

        {/* TODAY'S & TOMORROW'S FORECAST PIE CHARTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>

          {/* TODAY'S FORECAST */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(13, 43, 26, 0.08)',
            border: '1px solid #FAEDCD'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Activity style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0D2B1A', margin: 0 }}>Today's Forecast</h3>
                <p style={{ fontSize: '13px', color: '#8B5E3C', margin: 0 }}>Visitor distribution by time period</p>
              </div>
            </div>

            <div style={{ height: '320px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {todayPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={todayPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#8B5E3C', strokeWidth: 1 }}
                    >
                      {todayPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444', '#6366F1'][index % 4]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        border: '1px solid #FAEDCD',
                        boxShadow: '0 4px 12px rgba(13,43,26,0.1)',
                        padding: '16px'
                      }}
                      itemStyle={{ color: '#0D2B1A', fontSize: '14px', fontWeight: 600 }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', color: '#8B5E3C' }}>
                  <Activity style={{ width: '64px', height: '64px', margin: '0 auto 20px', opacity: 0.3 }} />
                  <p style={{ fontSize: '16px', margin: 0 }}>No forecast data for today</p>
                </div>
              )}
            </div>
          </div>

          {/* TOMORROW'S FORECAST */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(13, 43, 26, 0.08)',
            border: '1px solid #FAEDCD'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0D2B1A', margin: 0 }}>Tomorrow's Forecast</h3>
                <p style={{ fontSize: '13px', color: '#8B5E3C', margin: 0 }}>Expected distribution by location</p>
              </div>
            </div>

            <div style={{ height: '320px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {tomorrowPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tomorrowPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#8B5E3C', strokeWidth: 1 }}
                    >
                      {tomorrowPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#276F43', '#D4A373', '#8B5E3C', '#10B981', '#F59E0B', '#1A4D2E'][index % 6]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        border: '1px solid #FAEDCD',
                        boxShadow: '0 4px 12px rgba(13,43,26,0.1)',
                        padding: '16px'
                      }}
                      itemStyle={{ color: '#0D2B1A', fontSize: '14px', fontWeight: 600 }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={60}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', color: '#8B5E3C' }}>
                  <TrendingUp style={{ width: '64px', height: '64px', margin: '0 auto 20px', opacity: 0.3 }} />
                  <p style={{ fontSize: '16px', margin: 0 }}>No forecast data for tomorrow</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>

          {/* AI Recommendations */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(13, 43, 26, 0.08)',
            border: '1px solid #FAEDCD'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #D4A373 0%, #8B5E3C 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0D2B1A', margin: 0 }}>AI Recommendations</h3>
                <p style={{ fontSize: '13px', color: '#8B5E3C', margin: 0 }}>Smart schedule optimization</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {suggestions.length > 0 ? suggestions.slice(0, 3).map((sug, i) => (
                <div key={i} style={{
                  padding: '20px',
                  background: '#FAEDCD',
                  borderRadius: '16px',
                  border: '1px solid #F5E6C8'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                    <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0D2B1A', margin: 0 }}>
                      {sug.action.replace(/_/g, " ")}
                    </h4>
                    <span style={{
                      padding: '4px 10px',
                      background: '#D4A373',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {Math.round(sug.confidence * 100)}%
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: '#8B5E3C', margin: 0, lineHeight: '1.6' }}>{sug.reason}</p>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8B5E3C' }}>
                  <Zap style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>No critical actions required</p>
                </div>
              )}
            </div>
          </div>

          {/* Heatmap */}
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '20px',
            boxShadow: '0 4px 6px rgba(13, 43, 26, 0.08)',
            border: '1px solid #FAEDCD'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'linear-gradient(135deg, #1A4D2E 0%, #276F43 100%)',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MapPin style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0D2B1A', margin: 0 }}>Crowd Density</h3>
                <p style={{ fontSize: '13px', color: '#8B5E3C', margin: 0 }}>Real-time activity levels</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {heatmapData.length > 0 ? heatmapData.slice(0, 6).map((pt, i) => (
                <div key={i} style={{
                  padding: '20px',
                  background: '#FEFAE0',
                  borderRadius: '16px',
                  border: '1px solid #FAEDCD'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      background: 'white',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #D4A373',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: '#0D2B1A'
                    }}>
                      {pt.time.substring(0, 2)}H
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#0D2B1A', marginBottom: '4px' }}>{pt.location}</div>
                      <div style={{ fontSize: '12px', color: '#8B5E3C' }}>{pt.intensity}% capacity</div>
                    </div>
                  </div>
                  <div style={{
                    height: '8px',
                    background: '#FAEDCD',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${pt.intensity}%`,
                      height: '100%',
                      background: pt.intensity > 75 ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)' :
                        pt.intensity > 40 ? 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)' :
                          'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                      borderRadius: '10px',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: '#8B5E3C' }}>
                  <MapPin style={{ width: '48px', height: '48px', margin: '0 auto 16px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 7-DAY FORECAST CHART */}
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 4px 6px rgba(13, 43, 26, 0.08)',
          border: '1px solid #FAEDCD',
          marginTop: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #1A4D2E 0%, #276F43 100%)',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0D2B1A', margin: 0 }}>7-Day Visitor Forecast</h3>
              <p style={{ fontSize: '13px', color: '#8B5E3C', margin: 0 }}>Predicted visitor trends by location</p>
            </div>
          </div>

          <div style={{ height: '400px', width: '100%' }}>
            {forecastData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#276F43" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#276F43" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorBathing" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4A373" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#D4A373" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMuseum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5E3C" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5E3C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FAEDCD" vertical={false} />
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fill: '#8B5E3C', fontSize: 12 }}
                    axisLine={{ stroke: '#FAEDCD' }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B5E3C', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      border: '1px solid #FAEDCD',
                      boxShadow: '0 4px 12px rgba(13,43,26,0.1)',
                      padding: '16px'
                    }}
                    itemStyle={{ color: '#0D2B1A', fontSize: '14px', fontWeight: 600 }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', fontSize: '13px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Main Entrance"
                    stroke="#276F43"
                    strokeWidth={3}
                    fill="url(#colorMain)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Elephant Bathing Area"
                    stroke="#D4A373"
                    strokeWidth={3}
                    fill="url(#colorBathing)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Museum"
                    stroke="#8B5E3C"
                    strokeWidth={3}
                    fill="url(#colorMuseum)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8B5E3C'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <Calendar style={{ width: '64px', height: '64px', margin: '0 auto 20px', opacity: 0.3 }} />
                  <p style={{ fontSize: '16px', margin: 0 }}>No forecast data available</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
