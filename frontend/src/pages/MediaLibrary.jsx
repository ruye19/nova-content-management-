import { useEffect, useState } from "react";
import { FiTrash2, FiUpload } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";

function MediaLibrary() {
  const { media } = useApi();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await media.list();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [media]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded = await media.upload(file);
      setItems((prev) => [uploaded, ...prev]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove ${item.name}?`)) return;
    try {
      await media.remove(item.id);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">Asset hub</p>
          <h1 className="text-3xl font-semibold text-brand.ink">Media library</h1>
          <p className="text-sm text-slate-500">Store hero shots, brand imagery, and marketing art.</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-2xl bg-brand.highlight px-5 py-3 text-sm font-semibold text-slate-900">
          <FiUpload />
          {uploading ? "Uploading..." : "Upload"}
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*" />
        </label>
      </header>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-500">Loading assets...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => {
            const dataUrl = `data:${item.type};base64,${item.base64Data}`;
            const isVideo = item.type?.startsWith("video/");
            return (
              <div key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-glass">
                {isVideo ? (
                  <video
                    src={dataUrl}
                    className="h-48 w-full object-cover"
                    controls
                    muted
                    playsInline
                  />
                ) : (
                  <img src={dataUrl} alt={item.name} className="h-48 w-full object-cover" />
                )}
              <div className="flex items-center justify-between px-4 py-4 text-sm">
                <div>
                  <p className="font-semibold text-brand.ink">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.type}</p>
                </div>
                {user?.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-full bg-rose-50 p-2 text-rose-500 hover:bg-rose-100"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
            );
          })}
          {!items.length && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 p-12 text-center text-slate-500">
              Nothing here yet. Upload your first visual.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MediaLibrary;
