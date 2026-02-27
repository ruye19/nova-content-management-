import { useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { httpRequest } from "../services/http";

export function useApi() {
  const { token, logout } = useAuth();

  const request = useCallback(
    async (path, options = {}) => {
      try {
        return await httpRequest(path, { ...options, token });
      } catch (error) {
        if (error.status === 401) {
          logout();
        }
        throw error;
      }
    },
    [token, logout]
  );

  return useMemo(
    () => ({
      content: {
        list: () => request("/content"),
        get: (id) => request(`/content/${id}`),
        create: (payload) => request("/content", { method: "POST", data: payload }),
        update: (id, payload) => request(`/content/${id}`, { method: "PUT", data: payload }),
        remove: (id) => request(`/content/${id}`, { method: "DELETE" }),
      },
      media: {
        list: () => request("/media"),
        upload: (file) => {
          const formData = new FormData();
          formData.append("file", file);
          return request("/media", { method: "POST", data: formData });
        },
        remove: (id) => request(`/media/${id}`, { method: "DELETE" }),
      },
      menus: {
        list: () => request("/menus"),
        get: (id) => request(`/menus/${id}`),
        create: (payload) => request("/menus", { method: "POST", data: payload }),
        update: (id, payload) => request(`/menus/${id}`, { method: "PUT", data: payload }),
        remove: (id) => request(`/menus/${id}`, { method: "DELETE" }),
      },
      admin: {
        stats: () => request("/admin/stats"),
        users: () => request("/admin/users"),
        activity: (id) => request(`/admin/activity/${id}`),
        updateRole: (id, role) => request(`/admin/users/${id}/role`, { method: "PUT", data: { role } }),
      },
    }),
    [request]
  );
}
