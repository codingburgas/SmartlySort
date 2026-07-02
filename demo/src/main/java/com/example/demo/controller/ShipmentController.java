package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Shipment;
import com.example.demo.service.ShipmentService;

@RestController
@RequestMapping("/api/shipments")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping
    public Shipment receive(@RequestBody Shipment shipment) {
        return shipmentService.receiveShipment(shipment);
    }

    @GetMapping
    public List<Shipment> getAll(@RequestParam(required = false) Long warehouseId,
                                 @RequestParam(required = false) Long supplierId) {
        if (supplierId != null) {
            return shipmentService.getShipmentsForSupplier(supplierId);
        }
        return shipmentService.getShipmentsByWarehouse(warehouseId);
    }
}
