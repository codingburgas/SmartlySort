package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.model.Warehouse;

import java.util.List;

public interface WarehouseService {
    Warehouse createWarehouse(Warehouse warehouse);
    Warehouse getWarehouseById(Long id);
    Warehouse updateWarehouse(Long id, Warehouse warehouse);
    void deleteWarehouse(Long id);
    List<Warehouse> getWarehousesForUser(Long userId);
    User addMember(Long warehouseId, String usernameOrEmail);
    List<User> getMembers(Long warehouseId);
    void removeMember(Long warehouseId, Long userId);
}
