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
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
};

export const products = {
  list: () => request("/products"),
  get: (id) => request(`/products/${id}`),
  search: (keyword) => request(`/products/search?keyword=${encodeURIComponent(keyword)}`),
  create: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id) => request(`/products/${id}`, { method: "DELETE" }),
};

export const stock = {
  list: (productId) =>
    request(`/stock-movements${productId ? `?productId=${productId}` : ""}`),
  record: (data) =>
    request("/stock-movements", { method: "POST", body: JSON.stringify(data) }),
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
  list: (supplierId) =>
    request(`/shipments${supplierId ? `?supplierId=${supplierId}` : ""}`),
  receive: (data) =>
    request("/shipments", { method: "POST", body: JSON.stringify(data) }),
};

export const users = {
  list: () => request("/users"),
  get: (id) => request(`/users/${id}`),
  create: (data) => request("/users", { method: "POST", body: JSON.stringify(data) }),
  remove: (id) => request(`/users/${id}`, { method: "DELETE" }),
};
