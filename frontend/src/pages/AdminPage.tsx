import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const APPS = ['drone-tm', 'fair', 'oam', 'umap'];

function AdminPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
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

  // Fetch mappings when app or page changes
  useEffect(() => {
    if (!isAdmin) return;

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
  }, [isAdmin, selectedApp, page, backendUrl]);

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
      // Refresh mappings
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
    </div>
  );
}

export default AdminPage;
