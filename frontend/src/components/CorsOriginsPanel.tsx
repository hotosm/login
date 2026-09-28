import { useCallback, useEffect, useState } from 'react';

interface AllowedOrigin {
  id: string;
  origin: string;
  note: string | null;
  enabled: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface CorsOriginsPanelProps {
  backendUrl: string;
}

/**
 * Admin panel for the CORS allowlist of this backend.
 *
 * Saving here takes effect within seconds — each backend worker refreshes its
 * cache on a short interval, so there is nothing to deploy or restart. It does
 * not cover the Hanko API, which the browser calls directly and which keeps its
 * own allowlist in hanko-config.yaml.
 */
function CorsOriginsPanel({ backendUrl }: CorsOriginsPanelProps) {
  const [origins, setOrigins] = useState<AllowedOrigin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newOrigin, setNewOrigin] = useState('');
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/admin/cors-origins`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to load origins');
      setOrigins(await response.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load origins');
    } finally {
      setLoading(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/admin/cors-origins`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: newOrigin, note: newNote || null }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || body.detail || 'Failed to add');
      setOrigins([body, ...origins]);
      setNewOrigin('');
      setNewNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add origin');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (row: AllowedOrigin) => {
    try {
      const response = await fetch(`${backendUrl}/admin/cors-origins/${row.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !row.enabled }),
      });
      if (!response.ok) throw new Error('Failed to update');
      const updated: AllowedOrigin = await response.json();
      setOrigins(origins.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update origin');
    }
  };

  const handleDelete = async (row: AllowedOrigin) => {
    if (
      !confirm(
        `Remove ${row.origin} from the allowlist?\n\nDisabling it instead keeps a record of who added it and why.`
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`${backendUrl}/admin/cors-origins/${row.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete');
      setOrigins(origins.filter((o) => o.id !== row.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete origin');
    }
  };

  return (
    <div className="cors-origins-panel">
      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3>Allowed origins</h3>
        <p className="text-xs text-gray-400" style={{ marginBottom: '1rem' }}>
          Sites allowed to call this API from a browser. Changes apply within seconds — no
          deploy needed. A site that also needs to <strong>sign users in</strong> must be
          added to the Hanko configuration as well; this list alone does not enable login.
        </p>

        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="https://newsite.hotosm.org"
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
            style={{ flex: '2 1 20rem', padding: '0.5rem 0.75rem' }}
            aria-label="Origin"
          />
          <input
            type="text"
            placeholder="What is it? (optional)"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            style={{ flex: '1 1 12rem', padding: '0.5rem 0.75rem' }}
            aria-label="Note"
          />
          <button type="submit" disabled={saving || !newOrigin.trim()}>
            {saving ? 'Adding…' : 'Add origin'}
          </button>
        </form>

        {error && (
          <p role="alert" style={{ color: 'var(--hot-red-600, #d73f3f)', marginTop: '0.75rem' }}>
            {error}
          </p>
        )}
      </div>

      {loading ? (
        <p>Loading origins…</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Origin</th>
              <th>Note</th>
              <th>Status</th>
              <th>Added</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {origins.map((row) => (
              <tr key={row.id} style={{ opacity: row.enabled ? 1 : 0.5 }}>
                <td>
                  <code>{row.origin}</code>
                </td>
                <td>{row.note || '—'}</td>
                <td>{row.enabled ? 'Enabled' : 'Disabled'}</td>
                <td>{new Date(row.created_at).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => handleToggle(row)}>
                    {row.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button type="button" onClick={() => handleDelete(row)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {origins.length === 0 && (
              <tr>
                <td colSpan={5}>No origins yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default CorsOriginsPanel;
