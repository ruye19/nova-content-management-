import { useEffect, useState } from "react";
import { useApi } from "../hooks/useApi";
import StatCard from "../components/StatCard";

function Admin() {
  const { admin } = useApi();
  const [stats, setStats] = useState({ totalUsers: 0, totalPublished: 0, totalMedia: 0 });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [statData, userData] = await Promise.all([admin.stats(), admin.users()]);
        setStats(statData);
        setUsers(userData);
      } catch (err) {
        setError(err.message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const loadActivity = async (user) => {
    setSelectedUser(user);
    setLoadingActivity(true);
    setError(null);
    try {
      const detail = await admin.activity(user.id);
      setActivity(detail);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingActivity(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">Mission control</p>
        <h1 className="text-3xl font-semibold text-brand.ink">Admin overview</h1>
        <p className="text-sm text-slate-500">Monitor usage, audit user activity, and keep the CMS healthy.</p>
      </header>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard label="Active users" value={stats.totalUsers} accent="accounts" />
        <StatCard label="Published" value={stats.totalPublished} accent="stories" />
        <StatCard label="Media" value={stats.totalMedia} accent="assets" />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-glass">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-brand.ink">Team</h2>
          </div>
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3">Posts</th>
                <th className="px-6 py-3">Media</th>
                <th className="px-6 py-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-brand.ink">{user.name}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4 text-center">{user.postsCount}</td>
                  <td className="px-6 py-4 text-center">{user.mediaCount ?? "–"}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => loadActivity(user)}
                      className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide"
                    >
                      Audit
                    </button>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan="5" className="px-6 py-6 text-center text-slate-500">
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-glass">
          <h2 className="text-lg font-semibold text-brand.ink">Activity</h2>
          {!selectedUser && <p className="mt-3 text-sm text-slate-500">Select an account to inspect recent activity.</p>}
          {selectedUser && (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-brand.ink">{selectedUser.name}</p>
                <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">{selectedUser.role}</p>
              </div>
              {loadingActivity ? (
                <p className="text-sm text-slate-500">Loading activity...</p>
              ) : (
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">Latest posts</p>
                    <ul className="mt-2 space-y-2">
                      {activity?.posts?.map((post) => (
                        <li key={post.id} className="rounded-2xl border border-slate-200 px-3 py-2">
                          <p className="font-semibold text-brand.ink">{post.title}</p>
                          <p className="text-xs text-slate-500">
                            {post.status} · {new Date(post.createdAt || post.created_at).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                      {!activity?.posts?.length && <p className="text-xs text-slate-400">No posts yet.</p>}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">Recent uploads</p>
                    <ul className="mt-2 space-y-2">
                      {activity?.media?.map((asset) => (
                        <li key={asset.id} className="rounded-2xl border border-slate-200 px-3 py-2">
                          <p className="font-semibold text-brand.ink">{asset.name}</p>
                          <p className="text-xs text-slate-500">
                            {asset.type} · {new Date(asset.createdAt || asset.created_at).toLocaleDateString()}
                          </p>
                        </li>
                      ))}
                      {!activity?.media?.length && <p className="text-xs text-slate-400">No uploads yet.</p>}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Admin;
