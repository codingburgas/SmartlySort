package com.example.demo.service;

import java.util.List;

import com.example.demo.model.Shipment;

public interface ShipmentService {
    Shipment receiveShipment(Shipment shipment);
    List<Shipment> getAllShipments();
    List<Shipment> getShipmentsForSupplier(Long supplierId);
}
