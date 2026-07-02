package com.example.demo.service;

import java.util.List;

import com.example.demo.model.Shipment;
import com.example.demo.model.ShipmentStatus;

public interface ShipmentService {
    Shipment createShipment(Shipment shipment);
    Shipment updateStatus(Long id, ShipmentStatus status);
    List<Shipment> getShipmentsByWarehouse(Long warehouseId);
    List<Shipment> getShipmentsForSupplier(Long supplierId);
}
