import { FiEdit3, FiTrash2 } from "react-icons/fi";

function ContentTable({ items = [], onEdit, onDelete, canManage = true }) {
  if (!items.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center text-slate-500">
        No drafts yet. Start crafting your first piece.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-glass">
      <table className="min-w-full divide-y divide-slate-100">
        <thead>
          <tr className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Type</th>
            <th className="px-6 py-4">Slug</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Updated</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/70">
              <td className="px-6 py-4 font-medium text-slate-900">{item.title}</td>
              <td className="px-6 py-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                  {item.type || "post"}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500">{item.slug}</td>
              <td className="px-6 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === "published"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-500">
                {new Date(item.updatedAt || item.updated_at || item.createdAt || item.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                {canManage ? (
                  <div className="flex flex-wrap justify-end gap-3 text-brand.ink">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-slate-100"
                    >
                      <FiEdit3 /> Edit draft
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item)}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-500 transition hover:bg-rose-50"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                ) : (
                  <span className="text-xs uppercase tracking-wide text-slate-400">Read only</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ContentTable;
