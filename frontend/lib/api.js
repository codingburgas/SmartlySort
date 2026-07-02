const BASE = "http://localhost:8080/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      if (body.message) message = body.message;
    } catch {}
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const auth = {
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),
};

export const warehouses = {
  list: (userId) => request(`/warehouses?userId=${userId}`),
  get: (id) => request(`/warehouses/${id}`),
  create: (data) => request("/warehouses", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/warehouses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/warehouses/${id}`, { method: "DELETE" }),
  addMember: (id, usernameOrEmail) =>
    request(`/warehouses/${id}/members`, { method: "POST", body: JSON.stringify({ usernameOrEmail }) }),
  listMembers: (id) => request(`/warehouses/${id}/members`),
  removeMember: (id, userId) => request(`/warehouses/${id}/members/${userId}`, { method: "DELETE" }),
};

export const products = {
  list: (warehouseId) => request(`/products?warehouseId=${warehouseId}`),
  get: (id) => request(`/products/${id}`),
  search: (warehouseId, keyword) =>
    request(`/products/search?warehouseId=${warehouseId}&keyword=${encodeURIComponent(keyword)}`),
  lowStock: (warehouseId) => request(`/products/low-stock?warehouseId=${warehouseId}`),
  create: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

export const stock = {
  list: (warehouseId) => request(`/stock-movements?warehouseId=${warehouseId}`),
  listByProduct: (productId) => request(`/stock-movements?productId=${productId}`),
  record: (data) => request("/stock-movements", { method: "POST", body: JSON.stringify(data) }),
};

export const suppliers = {
  list: () => request("/suppliers"),
  get: (id) => request(`/suppliers/${id}`),
  search: (keyword) => request(`/suppliers/search?keyword=${encodeURIComponent(keyword)}`),
  create: (data) => request("/suppliers", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/suppliers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/suppliers/${id}`, { method: "DELETE" }),
};

export const shipments = {
  list: (warehouseId) => request(`/shipments?warehouseId=${warehouseId}`),
  receive: (data) => request("/shipments", { method: "POST", body: JSON.stringify(data) }),
};

export const users = {
  list: () => request("/users"),
  create: (data) => request("/users", { method: "POST", body: JSON.stringify(data) }),
  remove: (id) => request(`/users/${id}`, { method: "DELETE" }),
};
