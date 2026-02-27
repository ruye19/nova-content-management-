import { useEffect, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useApi } from "../hooks/useApi";

const emptyItem = () => ({ label: "", url: "" });

function Menus() {
  const { menus } = useApi();
  const [list, setList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState({ name: "", location: "", items: [emptyItem()] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await menus.list();
      setList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menus]);

  const resetForm = () => {
    setSelectedId(null);
    setForm({ name: "", location: "", items: [emptyItem()] });
  };

  const handleSelect = (menu) => {
    setSelectedId(menu.id);
    setForm({
      name: menu.name,
      location: menu.location,
      items: (menu.items && menu.items.length ? menu.items : [emptyItem()]).map((item) => ({
        label: item.label || "",
        url: item.url || "",
      })),
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setForm((prev) => {
      const nextItems = prev.items.slice();
      nextItems[index] = { ...nextItems[index], [field]: value };
      return { ...prev, items: nextItems };
    });
  };

  const addItemRow = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  };

  const removeItemRow = (index) => {
    setForm((prev) => {
      const nextItems = prev.items.slice();
      nextItems.splice(index, 1);
      return { ...prev, items: nextItems.length ? nextItems : [emptyItem()] };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name,
      location: form.location,
      items: form.items.filter((item) => item.label || item.url),
    };
    try {
      if (selectedId) {
        await menus.update(selectedId, payload);
      } else {
        await menus.create(payload);
      }
      await load();
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (menu) => {
    if (!window.confirm(`Delete menu "${menu.name}"?`)) return;
    try {
      await menus.remove(menu.id);
      setList((prev) => prev.filter((m) => m.id !== menu.id));
      if (selectedId === menu.id) {
        resetForm();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">Navigation</p>
          <h1 className="text-3xl font-semibold text-brand.ink">Menus</h1>
          <p className="text-sm text-slate-500">
            Define header, footer, and landing page menus that your front-end can consume.
          </p>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-brand.ink"
        >
          <FiPlus /> New menu
        </button>
      </header>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>}

      <section className="grid gap-6 lg:grid-cols-[1.3fr,1.7fr]">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-glass">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-semibold text-brand.ink">Existing menus</h2>
          </div>
          {loading ? (
            <p className="px-6 py-6 text-sm text-slate-500">Loading menus...</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Location</th>
                  <th className="px-6 py-3 text-center">Items</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((menu) => (
                  <tr key={menu.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-brand.ink">{menu.name}</td>
                    <td className="px-6 py-3 text-slate-500">{menu.location}</td>
                    <td className="px-6 py-3 text-center text-slate-500">
                      {menu.items?.length || 0}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelect(menu)}
                          className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(menu)}
                          className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-rose-500"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!list.length && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-6 text-center text-sm text-slate-500"
                    >
                      No menus yet. Create your first site navigation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-glass"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-brand.fog">
              {selectedId ? "Update" : "Create"} menu
            </p>
            <h2 className="mt-1 text-lg font-semibold text-brand.ink">
              {selectedId ? "Edit menu" : "New menu"}
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-slate-600">Name</label>
              <input
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-brand.ink focus:border-brand.highlight focus:outline-none"
                placeholder="Primary navigation"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Location</label>
              <input
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-brand.ink focus:border-brand.highlight focus:outline-none"
                placeholder="header, footer, sidebar..."
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-600">Items</label>
              <button
                type="button"
                onClick={addItemRow}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700"
              >
                <FiPlus /> Add item
              </button>
            </div>
            <div className="space-y-2">
              {form.items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-3 md:flex-row"
                >
                  <input
                    value={item.label}
                    onChange={(e) => handleItemChange(index, "label", e.target.value)}
                    placeholder="Label (e.g. Home)"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-brand.ink focus:border-brand.highlight focus:outline-none md:flex-[0.9]"
                  />
                  <div className="flex items-center gap-2 md:flex-1">
                    <input
                      value={item.url}
                      onChange={(e) => handleItemChange(index, "url", e.target.value)}
                      placeholder="URL (e.g. /, /blog)"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-brand.ink focus:border-brand.highlight focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeItemRow(index)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100"
                      title="Remove item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Menus are stored server-side and can be consumed by any public-facing site.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(15,23,42,0.3)]"
            >
              {saving ? "Saving..." : selectedId ? "Update menu" : "Create menu"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default Menus;

