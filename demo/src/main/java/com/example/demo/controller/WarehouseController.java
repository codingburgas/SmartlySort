package com.example.demo.controller;

import com.example.demo.dto.AddMemberRequest;
import com.example.demo.model.User;
import com.example.demo.model.Warehouse;
import com.example.demo.service.WarehouseService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/warehouses")
public class WarehouseController {

    private final WarehouseService warehouseService;

    public WarehouseController(WarehouseService warehouseService) {
        this.warehouseService = warehouseService;
    }

    @GetMapping
    public List<Warehouse> getWarehousesForUser(@RequestParam Long userId) {
        return warehouseService.getWarehousesForUser(userId);
    }

    @GetMapping("/{id}")
    public Warehouse getWarehouseById(@PathVariable Long id) {
        return warehouseService.getWarehouseById(id);
    }

    @PostMapping
    public Warehouse createWarehouse(@RequestBody Warehouse warehouse) {
        return warehouseService.createWarehouse(warehouse);
    }

    @PutMapping("/{id}")
    public Warehouse updateWarehouse(@PathVariable Long id, @RequestBody Warehouse warehouse) {
        return warehouseService.updateWarehouse(id, warehouse);
    }

    @DeleteMapping("/{id}")
    public void deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
    }

    @PostMapping("/{id}/members")
    public User addMember(@PathVariable Long id, @RequestBody AddMemberRequest request) {
        return warehouseService.addMember(id, request.getUsernameOrEmail());
    }

    @GetMapping("/{id}/members")
    public List<User> getMembers(@PathVariable Long id) {
        return warehouseService.getMembers(id);
    }

    @DeleteMapping("/{id}/members/{userId}")
    public void removeMember(@PathVariable Long id, @PathVariable Long userId) {
        warehouseService.removeMember(id, userId);
    }
}
