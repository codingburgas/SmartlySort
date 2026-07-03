package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.InvalidMovementException;
import com.example.demo.exception.ProductNotFoundException;
import com.example.demo.exception.ShipmentNotFoundException;
import com.example.demo.exception.SupplierNotFoundException;
import com.example.demo.model.MovementType;
import com.example.demo.model.Product;
import com.example.demo.model.Shipment;
import com.example.demo.model.ShipmentStatus;
import com.example.demo.model.StockMovement;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ShipmentRepository;
import com.example.demo.repository.SupplierRepository;

@Service
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentRepository shipmentRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final StockMovementService stockMovementService;

    public ShipmentServiceImpl(ShipmentRepository shipmentRepository,
                               SupplierRepository supplierRepository,
                               ProductRepository productRepository,
                               StockMovementService stockMovementService) {
        this.shipmentRepository = shipmentRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.stockMovementService = stockMovementService;
    }

    @Override
    public Shipment createShipment(Shipment shipment) {
        if (shipment.getQuantity() <= 0) {
            throw new InvalidMovementException("Quantity must be positive");
        }
        if (!supplierRepository.existsById(shipment.getSupplierId())) {
            throw new SupplierNotFoundException(shipment.getSupplierId());
        }
        Product product = productRepository.findById(shipment.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(shipment.getProductId()));
        shipment.setWarehouseId(product.getWarehouseId());
        if (shipment.getStatus() == null) {
            shipment.setStatus(ShipmentStatus.DUE);
        }
        shipment.setId(null);
        return shipmentRepository.save(shipment);
    }

    @Override
    @Transactional
    public Shipment updateStatus(Long id, ShipmentStatus status) {
        Shipment shipment = shipmentRepository.findById(id)
                .orElseThrow(() -> new ShipmentNotFoundException(id));
        if (status == ShipmentStatus.COMPLETED && shipment.getStatus() != ShipmentStatus.COMPLETED) {
            StockMovement movement = new StockMovement();
            movement.setProductId(shipment.getProductId());
            movement.setType(MovementType.IN);
            movement.setQuantity(shipment.getQuantity());
            movement.setReason("Shipment received");
            stockMovementService.recordMovement(movement);
        }
        shipment.setStatus(status);
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
