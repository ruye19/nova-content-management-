import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const { register, authLoading, authError } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [inlineError, setInlineError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setInlineError(null);
    setSuccessMessage(null);
    try {
      await register(form);
      setSuccessMessage("Account created. Redirecting you to login...");
    } catch (error) {
      setInlineError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.4em] text-brand.highlight">Nova CMS</p>
        <h1 className="mt-3 text-3xl font-semibold">Create your studio</h1>
        <p className="text-sm text-slate-400">Collaborate with your team and ship faster.</p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-200">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand.highlight focus:outline-none"
              placeholder="Alicia Harper"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-200">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand.highlight focus:outline-none"
              placeholder="editor@studio.com"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-200">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="mt-2 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-slate-500 focus:border-brand.highlight focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          {(inlineError || authError) && (
            <p className="rounded-2xl bg-rose-500/20 px-4 py-3 text-sm text-rose-200">
              {inlineError || authError}
            </p>
          )}
          {successMessage && (
            <p className="rounded-2xl bg-emerald-500/20 px-4 py-3 text-sm text-emerald-100">{successMessage}</p>
          )}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full rounded-3xl border border-white/30 bg-gradient-to-r from-brand.accent to-brand.highlight px-5 py-3 text-center text-base font-semibold text-slate-950 shadow-glass transition hover:scale-[1.01] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand.highlight disabled:opacity-60"
          >
            {authLoading ? "Creating workspace..." : "Create account"}
          </button>
        </form>
        <p className="mt-10 text-center text-sm text-slate-400">
          Already collaborating? {" "}
          <Link to="/login" className="font-semibold text-white">
            Go to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
