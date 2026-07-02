"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { warehouses as warehousesApi } from "@/lib/api";
import { useAuth } from "./AuthProvider";

const WarehouseContext = createContext(null);

export function WarehouseProvider({ children }) {
  const { user } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [currentWarehouse, setCurrentWarehouse] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshWarehouses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await warehousesApi.list(user.id);
      setWarehouses(data);
      const storedId = localStorage.getItem("currentWarehouseId");
      if (storedId) {
        const found = data.find((w) => String(w.id) === storedId);
        if (found) {
          setCurrentWarehouse(found);
        } else if (data.length > 0) {
          setCurrentWarehouse(data[0]);
          localStorage.setItem("currentWarehouseId", String(data[0].id));
        }
      } else if (data.length > 0) {
        setCurrentWarehouse(data[0]);
        localStorage.setItem("currentWarehouseId", String(data[0].id));
      }
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshWarehouses();
    } else {
      setWarehouses([]);
      setCurrentWarehouse(null);
    }
  }, [user, refreshWarehouses]);

  function selectWarehouse(w) {
    setCurrentWarehouse(w);
    localStorage.setItem("currentWarehouseId", String(w.id));
  }

  return (
    <WarehouseContext.Provider value={{ warehouses, currentWarehouse, selectWarehouse, refreshWarehouses, loading }}>
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse() {
  return useContext(WarehouseContext);
}
