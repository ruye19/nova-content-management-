import { useEffect, useState } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import { useApi } from "../hooks/useApi";

function MediaModal({ open, onClose, onSelect }) {
  const { media } = useApi();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const results = await media.list();
        setItems(results);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, media]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 px-4 py-8">
      <div className="w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-brand.fog">Media</p>
            <h2 className="text-2xl font-semibold text-brand.ink">Attach an asset</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
          >
            <FiX />
          </button>
        </div>
        <label className="mb-2 flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-5 text-sm text-slate-500 hover:border-brand.highlight">
          <FiUpload className="text-lg" />
          {uploading ? "Uploading..." : "Click to upload"}
          <input type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*" />
        </label>
        <p className="mb-6 text-xs text-slate-400">
          Supported: PNG, JPG, GIF, MP4, MOV (max 10 MB)
        </p>
        {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-slate-500">Loading media...</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {items.map((item) => {
                const dataUrl = `data:${item.type};base64,${item.base64Data}`;
                const isVideo = item.type?.startsWith("video/");
                return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    onSelect(item);
                    onClose();
                  }}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  {isVideo ? (
                    <video
                      src={dataUrl}
                      className="h-40 w-full object-cover"
                      controls
                      muted
                      playsInline
                    />
                  ) : (
                    <img src={dataUrl} alt={item.name} className="h-40 w-full object-cover" />
                  )}
                  <div className="px-4 py-3 text-sm">
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      {item.type} · {new Date(item.createdAt || item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </button>
                );
              })}
              {!items.length && <p className="text-sm text-slate-500">No uploads yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediaModal;
