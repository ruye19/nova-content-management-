import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-950 font-display text-slate-900">
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 min-h-screen bg-slate-50 px-10 py-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
