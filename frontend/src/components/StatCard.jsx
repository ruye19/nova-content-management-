function StatCard({ label, value, accent }) {
  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-glass">
      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-semibold text-brand.ink">
        {value}
        <span className="ml-3 text-base font-medium text-brand.fog">{accent}</span>
      </p>
    </div>
  );
}

export default StatCard;
