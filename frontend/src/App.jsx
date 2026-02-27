import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ContentEditor from "./pages/ContentEditor";
import MediaLibrary from "./pages/MediaLibrary";
import Admin from "./pages/Admin";
import Menus from "./pages/Menus";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./components/DashboardLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="editor" element={<ContentEditor />} />
          <Route path="editor/:id" element={<ContentEditor />} />
          <Route path="media" element={<MediaLibrary />} />

          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="admin" element={<Admin />} />
            <Route path="menus" element={<Menus />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
