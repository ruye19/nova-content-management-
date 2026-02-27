import { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ContentTable from "../components/ContentTable";
import StatCard from "../components/StatCard";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { content } = useApi();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [activeType, setActiveType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await content.list();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  const stats = useMemo(() => {
    const published = items.filter((item) => item.status === "published").length;
    const drafts = items.length - published;
    const pages = items.filter((item) => item.type === "page").length;
    const posts = items.filter((item) => item.type === "post").length;
    const banners = items.filter((item) => item.type === "banner").length;
    return {
      published,
      drafts,
      total: items.length,
      pages,
      posts,
      banners,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (activeType === "all") return items;
    return items.filter((item) => item.type === activeType);
  }, [items, activeType]);

  const handleDelete = async (item) => {
    if (!["admin", "editor"].includes(user?.role)) return;
    if (!window.confirm(`Delete ${item.title}?`)) return;
    try {
      await content.remove(item.id);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col justify-between gap-6 rounded-3xl bg-gradient-to-r from-brand.highlight/20 via-white to-white p-8 shadow-glass md:flex-row md:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">Control room</p>
          <h1 className="mt-2 text-3xl font-semibold text-brand.ink">Content overview</h1>
          <p className="text-sm text-slate-500">Track drafts, publish updates, and keep media in sync.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {["admin", "editor"].includes(user?.role) && (
            <button
              type="button"
              onClick={() => navigate("/editor")}
              className="flex items-center gap-2 rounded-2xl border border-slate-900 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.15)]"
            >
              <FiPlus /> New draft
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate("/media")}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand.ink"
          >
            Media bucket
          </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard label="Total entries" value={stats.total} accent="published + drafts" />
        <StatCard label="Published" value={stats.published} accent="live" />
        <StatCard label="Drafts" value={stats.drafts} accent="in progress" />
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard label="Pages" value={stats.pages} accent="site pages" />
        <StatCard label="Posts" value={stats.posts} accent="blog/news" />
        <StatCard label="Banners" value={stats.banners} accent="hero assets" />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-brand.ink">Recent content</h2>
          <div className="flex items-center gap-2">
            {["all", "page", "post", "banner"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setActiveType(type)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                  activeType === type
                    ? "bg-slate-900 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                {type}
              </button>
            ))}
            <button
              type="button"
              onClick={refresh}
              className="text-sm font-semibold text-brand.highlight"
            >
              Refresh
            </button>
          </div>
        </div>
        {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}
        {loading ? (
          <p className="text-sm text-slate-500">Loading drafts...</p>
        ) : (
          <ContentTable
            items={filteredItems}
            canManage={["admin", "editor"].includes(user?.role)}
            onEdit={(item) => navigate(`/editor/${item.id}`)}
            onDelete={handleDelete}
          />
        )}
      </section>
    </div>
  );
}

export default Dashboard;
