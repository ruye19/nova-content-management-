import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiImage, FiSave } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import RichEditor from "../components/RichEditor";
import MediaModal from "../components/MediaModal";

const buildDataUrl = (item) => `data:${item.type};base64,${item.base64Data}`;

function ContentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { content } = useApi();
  const editorRef = useRef(null);
  const [form, setForm] = useState({ title: "", status: "draft", type: "post" });
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [mediaOpen, setMediaOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const existing = await content.get(id);
        setForm({ title: existing.title, status: existing.status, type: existing.type || "post" });
        setBody(existing.body || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, content]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (id) {
        await content.update(id, { ...form, body });
      } else {
        const created = await content.create({ ...form, body });
        navigate(`/editor/${created.id}`, { replace: true });
        return;
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleMediaSelect = (item) => {
    const quill = editorRef.current?.getEditor?.();
    if (!quill) return;

    const cursor = quill.getSelection(true);
    const index = cursor?.index || 0;
    const dataUrl = buildDataUrl(item);

    if (item.type?.startsWith("video/")) {
      const html = `<video controls style="width:100%" src="${dataUrl}"></video>`;
      quill.clipboard.dangerouslyPasteHTML(index, html, "user");
      quill.setSelection(index + 1);
    } else if (item.type?.startsWith("image/")) {
      quill.insertEmbed(index, "image", dataUrl);
      quill.setSelection(index + 1);
    } else {
      const safeName = (item.name || "file").replace(/"/g, "&quot;");
      const html = `<a href="${dataUrl}" download="${safeName}" target="_blank" rel="noopener noreferrer">${safeName}</a>`;
      quill.clipboard.dangerouslyPasteHTML(index, html, "user");
      quill.setSelection(index + 1);
    }
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading draft...</p>;
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">{id ? "Update" : "Create"} entry</p>
          <h1 className="text-3xl font-semibold text-brand.ink">{id ? "Edit content" : "New draft"}</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setMediaOpen(true)}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand.ink"
          >
            <FiImage /> Insert media
          </button>
          <button
            type="submit"
            form="content-form"
            className="flex items-center gap-2 rounded-2xl border border-slate-900 bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.35)]"
          >
            <FiSave /> {saving ? "Saving..." : "Save draft"}
          </button>
        </div>
      </header>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

      <form id="content-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-semibold text-slate-600">Title</label>
          <input
            name="title"
            required
            value={form.title}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-brand.ink focus:border-brand.highlight focus:outline-none"
            placeholder="Draft a bold headline"
          />
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <label className="text-sm font-semibold text-slate-600">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-brand.ink"
            >
              <option value="post">Post</option>
              <option value="page">Page</option>
              <option value="banner">Banner</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-semibold text-slate-600">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-brand.ink"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <RichEditor ref={editorRef} value={body} onChange={setBody} />
        </div>
      </form>

      <div className="rounded-2xl border border-dashed border-brand.highlight/40 bg-white/90 p-4">
        <p className="text-xs uppercase tracking-[0.4em] text-brand.fog">Draft controls</p>
        <p className="mt-1 text-sm text-slate-500">Hit save any time—your draft stays private until you publish.</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand.accent">
            status · {form.status}
          </div>
          <button
            type="submit"
            form="content-form"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-8 py-3 text-base font-semibold text-white shadow-[0_15px_35px_rgba(15,23,42,0.35)] transition hover:scale-[1.02]"
          >
            <FiSave /> {saving ? "Saving..." : id ? "Update draft" : "Save draft"}
          </button>
        </div>
      </div>

      <div className="sticky bottom-6 z-10 flex justify-end">
        <button
          type="submit"
          form="content-form"
          className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-[0_10px_25px_rgba(15,23,42,0.2)]"
        >
          <FiSave /> Quick save
        </button>
      </div>

      <MediaModal open={mediaOpen} onClose={() => setMediaOpen(false)} onSelect={handleMediaSelect} />
    </div>
  );
}

export default ContentEditor;
