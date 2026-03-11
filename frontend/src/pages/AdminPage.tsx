import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import hotLogo from '../assets/images/hot-logo.svg';

interface Mapping {
  hanko_user_id: string;
  app_user_id: string;
  app_name: string;
  created_at: string;
  updated_at: string | null;
  hanko_email?: string;
  app_username?: string;
  app_email?: string;
}

interface MappingsResponse {
  items: Mapping[];
  total: number;
  page: number;
  page_size: number;
}

interface StatsOverview {
  total_users: number;
  total_all_time: number;
  users_today: number;
  users_this_week: number;
  users_this_month: number;
  verified_emails: number;
  google_users: number;
  period: string;
  date_from: string | null;
  date_to: string | null;
}

interface RegistrationData {
  date: string;
  count: number;
}

interface AuthMethodStats {
  password: number;
  google: number;
  total: number;
}

interface RecentUser {
  id: string;
  email: string;
  verified: boolean;
  created_at: string;
}

interface SearchUser {
  id: string;
  email: string;
  verified: boolean;
  auth_methods: string[];
  apps: string[];
  created_at: string;
}

interface SearchResult {
  users: SearchUser[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

interface AppStat {
  total: number;
  period_count: number;
  unavailable?: boolean;
}

interface AppStats {
  period: string;
  date_from: string | null;
  date_to: string | null;
  apps: Record<string, AppStat>;
}

type Period = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

const APPS = ['drone-tm', 'fair', 'umap', 'osm-export-tool', 'chatmap'];
const APP_COLORS: Record<string, string> = {
  'drone-tm': '#D73F3F',
  'fair': '#4A90A4',
  'umap': '#7CB342',
  'osm-export-tool': '#FF9800',
  'chatmap': '#9C27B0',
};

const PERIOD_LABELS: Record<Period, string> = {
  all: 'All Time',
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  custom: 'Custom Range',
};

// Progress Ring Component
const ProgressRing = ({
  value,
  max,
  size = 60,
  strokeWidth = 6,
  color = '#D73F3F',
  label
}: {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = max > 0 ? value / max : 0;
  const offset = circumference - percent * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-700">{value}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-1">{label}</span>
    </div>
  );
};

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mappings'>('dashboard');

  // Dashboard state
  const [period, setPeriod] = useState<Period>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [authMethods, setAuthMethods] = useState<AuthMethodStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [appStats, setAppStats] = useState<AppStats | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);

  // Mappings state
  const [selectedApp, setSelectedApp] = useState<string>('drone-tm');
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // User search state
  const [searchEmail, setSearchEmail] = useState('');
  const [searchDateFrom, setSearchDateFrom] = useState('');
  const [searchDateTo, setSearchDateTo] = useState('');
  const [searchVerified, setSearchVerified] = useState('all');
  const [searchAuthMethod, setSearchAuthMethod] = useState('all');
  const [searchApp, setSearchApp] = useState('all');
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchPage, setSearchPage] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(0);
  const [searchLoading, setSearchLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api';

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch(`${backendUrl}/admin/check`, {
          credentials: 'include',
        });
        if (response.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [backendUrl]);

  // Build query params for period filter
  const buildPeriodParams = () => {
    const params = new URLSearchParams();
    params.set('period', period);
    if (period === 'custom' && customStartDate && customEndDate) {
      params.set('start_date', customStartDate);
      params.set('end_date', customEndDate);
    }
    return params.toString();
  };

  // Fetch dashboard stats (parallel with individual loading states)
  useEffect(() => {
    if (!isAdmin || activeTab !== 'dashboard') return;
    if (period === 'custom' && (!customStartDate || !customEndDate)) return;

    const periodParams = buildPeriodParams();
    // For the chart, use the same period (backend handles all periods correctly now)
    const chartParams = new URLSearchParams();
    chartParams.set('period', period);
    if (period === 'custom' && customStartDate && customEndDate) {
      chartParams.set('start_date', customStartDate);
      chartParams.set('end_date', customEndDate);
    }

    // Fetch overview + auth methods (fast)
    const fetchOverview = async () => {
      setLoadingOverview(true);
      try {
        const [overviewRes, authRes] = await Promise.all([
          fetch(`${backendUrl}/admin/stats/overview?${periodParams}`, { credentials: 'include' }),
          fetch(`${backendUrl}/admin/stats/auth-methods?${periodParams}`, { credentials: 'include' }),
        ]);
        if (overviewRes.ok) setOverview(await overviewRes.json());
        if (authRes.ok) setAuthMethods(await authRes.json());
      } catch (err) {
        console.error('Failed to fetch overview:', err);
      } finally {
        setLoadingOverview(false);
      }
    };

    // Fetch chart data (fast)
    const fetchChart = async () => {
      setLoadingChart(true);
      try {
        const [registrationsRes, recentRes] = await Promise.all([
          fetch(`${backendUrl}/admin/stats/registrations?${chartParams.toString()}`, { credentials: 'include' }),
          fetch(`${backendUrl}/admin/stats/recent-users?limit=5`, { credentials: 'include' }),
        ]);
        if (registrationsRes.ok) {
          const data = await registrationsRes.json();
          setRegistrations(data.data || []);
        }
        if (recentRes.ok) {
          const data = await recentRes.json();
          setRecentUsers(data.users || []);
        }
      } catch (err) {
        console.error('Failed to fetch chart:', err);
      } finally {
        setLoadingChart(false);
      }
    };

    // Fetch app stats (slow - queries all apps)
    const fetchAppStats = async () => {
      setLoadingApps(true);
      try {
        const res = await fetch(`${backendUrl}/admin/stats/apps?${periodParams}`, { credentials: 'include' });
        if (res.ok) setAppStats(await res.json());
      } catch (err) {
        console.error('Failed to fetch app stats:', err);
      } finally {
        setLoadingApps(false);
      }
    };

    // Run all in parallel
    fetchOverview();
    fetchChart();
    fetchAppStats();
  }, [isAdmin, activeTab, backendUrl, period, customStartDate, customEndDate]);

  // Fetch mappings when app or page changes
  useEffect(() => {
    if (!isAdmin || activeTab !== 'mappings') return;

    const fetchMappings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${backendUrl}/admin/${selectedApp}/mappings?page=${page}&page_size=20`,
          { credentials: 'include' }
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || 'Failed to fetch mappings');
        }
        const data: MappingsResponse = await response.json();
        setMappings(data.items || []);
        setTotal(data.total || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch mappings');
        setMappings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMappings();
  }, [isAdmin, activeTab, selectedApp, page, backendUrl]);

  // Search users function
  const handleSearch = async (newPage = 1) => {
    if (!isAdmin) return;

    setSearchLoading(true);
    setSearchPage(newPage);

    try {
      const params = new URLSearchParams();
      params.set('page', String(newPage));
      params.set('page_size', '15');

      if (searchEmail) params.set('email', searchEmail);
      if (searchDateFrom) params.set('date_from', searchDateFrom);
      if (searchDateTo) params.set('date_to', searchDateTo);
      if (searchVerified !== 'all') params.set('verified', searchVerified);
      if (searchAuthMethod !== 'all') params.set('auth_method', searchAuthMethod);
      if (searchApp !== 'all') params.set('app', searchApp);

      const response = await fetch(
        `${backendUrl}/admin/stats/users/search?${params.toString()}`,
        { credentials: 'include' }
      );

      if (response.ok) {
        const data: SearchResult = await response.json();
        setSearchResults(data.users);
        setSearchTotal(data.total);
        setSearchTotalPages(data.total_pages);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Initial search on mount
  useEffect(() => {
    if (isAdmin && activeTab === 'dashboard') {
      handleSearch(1);
    }
  }, [isAdmin, activeTab]);

  const handleDeleteMapping = async (hankoUserId: string) => {
    if (!confirm('Are you sure you want to delete this mapping?')) return;

    try {
      const response = await fetch(
        `${backendUrl}/admin/${selectedApp}/mappings/${hankoUserId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to delete mapping');
      }
      setMappings(mappings.filter((m) => m.hanko_user_id !== hankoUserId));
      setTotal(total - 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete mapping');
    }
  };

  const handleStartEdit = (mapping: Mapping) => {
    setEditingId(mapping.hanko_user_id);
    setEditValue(mapping.app_user_id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = async (hankoUserId: string) => {
    try {
      const response = await fetch(
        `${backendUrl}/admin/${selectedApp}/mappings/${hankoUserId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ app_user_id: editValue }),
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update mapping');
      }
      const updated: Mapping = await response.json();
      setMappings(mappings.map((m) =>
        m.hanko_user_id === hankoUserId ? updated : m
      ));
      setEditingId(null);
      setEditValue('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update mapping');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const totalPages = Math.ceil(total / 20);

  // Loading admin check
  if (isAdmin === null) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="spinner"></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-card admin-error-card">
          <h2>Access Denied</h2>
          <p>You don't have permission to access the admin panel.</p>
          <button onClick={() => navigate('/')} className="btn-primary-hot">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Prepare horizontal bar data for apps
  const appBarData = appStats
    ? Object.entries(appStats.apps)
        .map(([name, stats]) => ({
          name,
          users: stats.unavailable ? 0 : stats.period_count,
          fill: APP_COLORS[name] || '#888',
          unavailable: stats.unavailable,
        }))
        .sort((a, b) => b.users - a.users)
    : [];


  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header glass-card">
        <div className="admin-header-content">
          <img src={hotLogo} alt="HOT" className="admin-logo" />
          <h1>Admin Dashboard</h1>
        </div>
        <button onClick={() => navigate('/')} className="btn-back">
          ← Back to Login
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`admin-tab ${activeTab === 'mappings' ? 'active' : ''}`}
          onClick={() => setActiveTab('mappings')}
        >
          User Mappings
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="dashboard-content">
          {/* Period Filter */}
          <div className="filter-bar glass-card">
            <div className="filter-group">
              <label>Period:</label>
              <div className="period-buttons">
                {(['all', 'today', 'week', 'month', 'year', 'custom'] as Period[]).map((p) => (
                  <button
                    key={p}
                    className={`period-btn ${period === p ? 'active' : ''}`}
                    onClick={() => setPeriod(p)}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
            {period === 'custom' && (
              <div className="custom-date-range">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="date-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
            )}
          </div>

          {/* Main 3-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Stats Overview Card */}
            {loadingOverview ? (
              <div className="glass-card p-6 animate-pulse" role="status">
                <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                <div className="h-12 bg-gray-200 rounded w-20 mx-auto mb-4"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 w-16 bg-gray-200 rounded-full mx-auto"></div>
                  ))}
                </div>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-hot-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  User Statistics
                </h3>
                <div className="text-center mb-4 pb-4 border-b border-gray-200">
                  <div className="text-4xl font-bold text-hot-red-600 mb-1">
                    {overview?.total_users || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    Total Users ({PERIOD_LABELS[period]})
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <ProgressRing value={overview?.verified_emails || 0} max={overview?.total_users || 1} color="#10B981" label="Verified" size={50} strokeWidth={5} />
                  <ProgressRing value={authMethods?.password || 0} max={authMethods?.total || 1} color="#6366F1" label="via Email" size={50} strokeWidth={5} />
                  <ProgressRing value={authMethods?.google || 0} max={authMethods?.total || 1} color="#F59E0B" label="via Google" size={50} strokeWidth={5} />
                </div>
              </div>
            )}

            {/* Registrations Chart */}
            {loadingChart ? (
              <div className="glass-card p-6 animate-pulse" role="status">
                <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
                <div className="h-[200px] bg-gray-200 rounded"></div>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-hot-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                  Trend
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={registrations}>
                    <defs>
                      <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D73F3F" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#D73F3F" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tickFormatter={formatShortDate} stroke="#9CA3AF" fontSize={10} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={10} allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="count" stroke="#D73F3F" strokeWidth={2} fill="url(#colorReg)" name="Registrations" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Users per App */}
            {loadingApps ? (
              <div className="glass-card p-6 animate-pulse" role="status">
                <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-[200px] bg-gray-200 rounded"></div>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-hot-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Apps
                </h3>
                {appBarData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={appBarData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" stroke="#374151" fontSize={11} tickLine={false} axisLine={false} width={110} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '8px' }} formatter={(value) => [`${value} users`, 'Users']} />
                      <Bar dataKey="users" radius={[0, 6, 6, 0]} barSize={20}>
                        {appBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">No data</div>
                )}
              </div>
            )}
          </div>

          {/* Recent Registrations - Compact */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-hot-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Registrations
            </h3>
            <div className="flex flex-wrap gap-3">
              {recentUsers.slice(0, 4).map((user) => (
                <div key={user.id} className="flex items-center gap-2 bg-white/50 rounded-full px-3 py-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${user.verified ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {(user.email || '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-700 truncate max-w-[150px]">{user.email}</span>
                  <span className="text-xs text-gray-400">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* User Search Section */}
          <div className="glass-card p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-hot-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              User Search
            </h3>

            {/* Search Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
              <input
                type="text"
                placeholder="Search email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="col-span-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-red-100 focus:border-hot-red-400"
              />
              <input
                type="date"
                value={searchDateFrom}
                onChange={(e) => setSearchDateFrom(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-red-100"
                placeholder="From"
              />
              <input
                type="date"
                value={searchDateTo}
                onChange={(e) => setSearchDateTo(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-red-100"
                placeholder="To"
              />
              <select
                value={searchVerified}
                onChange={(e) => setSearchVerified(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-red-100 bg-white"
              >
                <option value="all">All Verified</option>
                <option value="true">Verified</option>
                <option value="false">Not Verified</option>
              </select>
              <select
                value={searchAuthMethod}
                onChange={(e) => setSearchAuthMethod(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-red-100 bg-white"
              >
                <option value="all">All Auth</option>
                <option value="password">Email/Pass</option>
                <option value="google">Google</option>
              </select>
              <select
                value={searchApp}
                onChange={(e) => setSearchApp(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-hot-red-100 bg-white"
              >
                <option value="all">All Apps</option>
                {APPS.map((app) => (
                  <option key={app} value={app}>{app}</option>
                ))}
              </select>
              <button
                onClick={() => handleSearch(1)}
                disabled={searchLoading}
                className="px-4 py-2 bg-hot-red-600 text-white text-sm font-medium rounded-lg hover:bg-hot-red-700 transition-colors disabled:opacity-50"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Email</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">ID</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Verified</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Auth</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Apps</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-600">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {searchLoading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-gray-100 animate-pulse">
                        <td className="py-3 px-2"><div className="h-4 bg-gray-200 rounded w-40"></div></td>
                        <td className="py-3 px-2"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                        <td className="py-3 px-2"><div className="h-5 bg-gray-200 rounded-full w-16"></div></td>
                        <td className="py-3 px-2"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        <td className="py-3 px-2"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                        <td className="py-3 px-2"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                      </tr>
                    ))
                  ) : searchResults.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">No users found</td>
                    </tr>
                  ) : (
                    searchResults.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium ${user.verified ? 'bg-green-500' : 'bg-yellow-500'}`}>
                              {(user.email || '?')[0].toUpperCase()}
                            </div>
                            <span className="text-gray-800">{user.email || '-'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-1 group">
                            <code className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono select-all">
                              {user.id}
                            </code>
                            <button
                              onClick={async (e) => {
                                const btn = e.currentTarget;
                                try {
                                  await navigator.clipboard.writeText(user.id);
                                  btn.classList.add('text-green-600');
                                  setTimeout(() => btn.classList.remove('text-green-600'), 1000);
                                } catch {
                                  // Fallback: select the text
                                  const code = btn.previousElementSibling;
                                  if (code) {
                                    const range = document.createRange();
                                    range.selectNodeContents(code);
                                    const sel = window.getSelection();
                                    sel?.removeAllRanges();
                                    sel?.addRange(range);
                                  }
                                }
                              }}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Copy ID"
                            >
                              <svg className="w-3.5 h-3.5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {user.verified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            {user.auth_methods.map((method) => (
                              <span key={method} className={`text-xs px-2 py-0.5 rounded ${method === 'google' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                {method}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex flex-wrap gap-1">
                            {user.apps.length > 0 ? user.apps.map((app) => (
                              <span key={app} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">{app}</span>
                            )) : <span className="text-xs text-gray-400">-</span>}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {searchTotalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleSearch(searchPage - 1)}
                  disabled={searchPage === 1 || searchLoading}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {searchPage} of {searchTotalPages} ({searchTotal} users)
                </span>
                <button
                  onClick={() => handleSearch(searchPage + 1)}
                  disabled={searchPage === searchTotalPages || searchLoading}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mappings Tab */}
      {activeTab === 'mappings' && (
        <>
          {/* App Selector */}
          <div className="admin-controls glass-card">
            <div className="app-selector">
              <label>Select App:</label>
              <select
                value={selectedApp}
                onChange={(e) => {
                  setSelectedApp(e.target.value);
                  setPage(1);
                }}
                className="app-select"
              >
                {APPS.map((app) => (
                  <option key={app} value={app}>
                    {app}
                  </option>
                ))}
              </select>
            </div>
            <div className="stats">
              Total Mappings: <strong>{total}</strong>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="admin-alert admin-alert-error">
              {error}
            </div>
          )}

          {/* Mappings Table */}
          <div className="admin-table-container glass-card">
            {loading ? (
              <div className="admin-loading">
                <div className="spinner"></div>
                <p>Loading mappings...</p>
              </div>
            ) : mappings.length === 0 ? (
              <div className="admin-empty">
                <p>No mappings found for {selectedApp}</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Hanko Email</th>
                    <th>App User</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mappings.map((mapping) => (
                    <tr key={mapping.hanko_user_id}>
                      <td>
                        <div className="user-cell">
                          <span className="user-email">{mapping.hanko_email || '-'}</span>
                          <span className="user-id monospace">{mapping.hanko_user_id}</span>
                        </div>
                      </td>
                      <td>
                        {editingId === mapping.hanko_user_id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="edit-input"
                            autoFocus
                          />
                        ) : (
                          <div className="user-cell">
                            <span className="user-name">{mapping.app_username || mapping.app_email || '-'}</span>
                            <span className="user-id monospace">{mapping.app_user_id}</span>
                          </div>
                        )}
                      </td>
                      <td>{formatDate(mapping.created_at)}</td>
                      <td className="actions-cell">
                        {editingId === mapping.hanko_user_id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(mapping.hanko_user_id)}
                              className="btn-success-small"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn-secondary-small"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStartEdit(mapping)}
                              className="btn-primary-small"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteMapping(mapping.hanko_user_id)}
                              className="btn-danger-small"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-pagination"
              >
                Previous
              </button>
              <span className="page-info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="btn-pagination"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPage;
