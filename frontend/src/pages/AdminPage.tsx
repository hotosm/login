import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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

type Period = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

const APPS = ['drone-tm', 'fair', 'umap', 'osm-export-tool', 'chatmap'];
const COLORS = ['#D73F3F', '#4A90A4', '#7CB342', '#FF9800', '#9C27B0'];

const PERIOD_LABELS: Record<Period, string> = {
  all: 'All Time',
  today: 'Today',
  week: 'This Week',
  month: 'This Month',
  year: 'This Year',
  custom: 'Custom Range',
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
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // Mappings state
  const [selectedApp, setSelectedApp] = useState<string>('drone-tm');
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

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

  // Fetch dashboard stats
  useEffect(() => {
    if (!isAdmin || activeTab !== 'dashboard') return;
    if (period === 'custom' && (!customStartDate || !customEndDate)) return;

    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      try {
        const periodParams = buildPeriodParams();
        const chartPeriod = period === 'all' ? 'month' : period;
        const chartParams = new URLSearchParams();
        chartParams.set('period', chartPeriod);
        if (period === 'custom' && customStartDate && customEndDate) {
          chartParams.set('start_date', customStartDate);
          chartParams.set('end_date', customEndDate);
        }

        const [overviewRes, registrationsRes, authRes, recentRes] = await Promise.all([
          fetch(`${backendUrl}/admin/stats/overview?${periodParams}`, { credentials: 'include' }),
          fetch(`${backendUrl}/admin/stats/registrations?${chartParams.toString()}`, { credentials: 'include' }),
          fetch(`${backendUrl}/admin/stats/auth-methods`, { credentials: 'include' }),
          fetch(`${backendUrl}/admin/stats/recent-users?limit=10`, { credentials: 'include' }),
        ]);

        if (overviewRes.ok) {
          setOverview(await overviewRes.json());
        }
        if (registrationsRes.ok) {
          const data = await registrationsRes.json();
          setRegistrations(data.data || []);
        }
        if (authRes.ok) {
          setAuthMethods(await authRes.json());
        }
        if (recentRes.ok) {
          const data = await recentRes.json();
          setRecentUsers(data.users || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setDashboardLoading(false);
      }
    };
    fetchDashboardData();
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

  const pieData = authMethods ? [
    { name: 'Password', value: authMethods.password },
    { name: 'Google', value: authMethods.google },
  ].filter(d => d.value > 0) : [];

  const getChartTitle = () => {
    if (period === 'custom' && overview?.date_from && overview?.date_to) {
      return `User Registrations (${overview.date_from} to ${overview.date_to})`;
    }
    return `User Registrations (${PERIOD_LABELS[period]})`;
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
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
          <div className="filter-bar">
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

          {dashboardLoading ? (
            <div className="admin-loading">
              <div className="spinner"></div>
              <p>Loading statistics...</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="stats-grid-centered">
                <div className="stat-card stat-card-primary">
                  <div className="stat-value">{overview?.total_users || 0}</div>
                  <div className="stat-label">Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{overview?.verified_emails || 0}</div>
                  <div className="stat-label">Verified Emails</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{authMethods?.password || 0}</div>
                  <div className="stat-label">Password Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{authMethods?.google || 0}</div>
                  <div className="stat-label">Google Users</div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="charts-row">
                {/* Registrations Chart */}
                <div className="chart-card chart-large">
                  <h3>{getChartTitle()}</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={registrations}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatShortDate}
                          stroke="#9CA3AF"
                          fontSize={12}
                        />
                        <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                          labelStyle={{ color: '#F9FAFB' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="count"
                          stroke="#D73F3F"
                          fill="#D73F3F"
                          fillOpacity={0.3}
                          name="Registrations"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Auth Methods Pie */}
                <div className="chart-card chart-small">
                  <h3>Auth Methods</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                          }
                        >
                          {pieData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Users */}
              <div className="recent-users-card">
                <h3>Recent Registrations</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Verified</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.email || '-'}</td>
                        <td>
                          <span className={`badge ${user.verified ? 'badge-success' : 'badge-warning'}`}>
                            {user.verified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td>{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* Mappings Tab */}
      {activeTab === 'mappings' && (
        <>
          {/* App Selector */}
          <div className="admin-controls">
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
          <div className="admin-table-container">
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
