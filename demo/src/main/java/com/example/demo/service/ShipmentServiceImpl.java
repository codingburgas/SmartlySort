package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.InvalidMovementException;
import com.example.demo.exception.SupplierNotFoundException;
import com.example.demo.model.MovementType;
import com.example.demo.model.Shipment;
import com.example.demo.model.StockMovement;
import com.example.demo.repository.ShipmentRepository;
import com.example.demo.repository.SupplierRepository;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final SupplierRepository supplierRepository;
    private final StockMovementService stockMovementService;

    public ShipmentServiceImpl(ShipmentRepository shipmentRepository,
                               SupplierRepository supplierRepository,
                               StockMovementService stockMovementService) {
        this.shipmentRepository = shipmentRepository;
        this.supplierRepository = supplierRepository;
        this.stockMovementService = stockMovementService;
    }

    @Override
    @Transactional
    public Shipment receiveShipment(Shipment shipment) {
        if (shipment.getQuantity() <= 0) {
            throw new InvalidMovementException("Quantity must be positive");
        }
        if (!supplierRepository.existsById(shipment.getSupplierId())) {
            throw new SupplierNotFoundException(shipment.getSupplierId());
        }
        StockMovement movement = new StockMovement();
        movement.setProductId(shipment.getProductId());
        movement.setType(MovementType.IN);
        movement.setQuantity(shipment.getQuantity());
        movement.setReason("Shipment from supplier " + shipment.getSupplierId());
        stockMovementService.recordMovement(movement);
        shipment.setId(null);
        return shipmentRepository.save(shipment);
    }

    @Override
    public List<Shipment> getShipmentsByWarehouse(Long warehouseId) {
        return shipmentRepository.findByWarehouseId(warehouseId);
    }

    @Override
    public List<Shipment> getShipmentsForSupplier(Long supplierId) {
        return shipmentRepository.findBySupplierId(supplierId);
    }
}
