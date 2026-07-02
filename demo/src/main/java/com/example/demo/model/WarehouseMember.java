package com.example.demo.model;

import jakarta.persistence.Entity;

@Entity
public class WarehouseMember extends BaseEntity {
    private Long warehouseId;
    private Long userId;

    public Long getWarehouseId() {
        return warehouseId;
    }

    public void setWarehouseId(Long warehouseId) {
        this.warehouseId = warehouseId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
