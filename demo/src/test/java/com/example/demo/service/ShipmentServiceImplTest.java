package com.example.demo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.exception.InvalidMovementException;
import com.example.demo.exception.ProductNotFoundException;
import com.example.demo.exception.SupplierNotFoundException;
import com.example.demo.model.MovementType;
import com.example.demo.model.Product;
import com.example.demo.model.Shipment;
import com.example.demo.model.ShipmentStatus;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.ShipmentRepository;
import com.example.demo.repository.SupplierRepository;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceImplTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private SupplierRepository supplierRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StockMovementService stockMovementService;

    @InjectMocks
    private ShipmentServiceImpl shipmentService;

    private Shipment shipment(long supplierId, long productId, int quantity) {
        Shipment s = new Shipment();
        s.setSupplierId(supplierId);
        s.setProductId(productId);
        s.setQuantity(quantity);
        return s;
    }

    private Product productWithWarehouse(long warehouseId) {
        Product p = new Product();
        p.setWarehouseId(warehouseId);
        return p;
    }

    @Test
    void createShipmentSavesAsDueWithoutRaisingStock() {
        when(supplierRepository.existsById(1L)).thenReturn(true);
        when(productRepository.findById(2L)).thenReturn(Optional.of(productWithWarehouse(7L)));
        when(shipmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Shipment result = shipmentService.createShipment(shipment(1L, 2L, 5));

        assertThat(result.getStatus()).isEqualTo(ShipmentStatus.DUE);
        assertThat(result.getWarehouseId()).isEqualTo(7L);
        verify(stockMovementService, never()).recordMovement(any());
    }

    @Test
    void createShipmentMissingSupplierThrows() {
        when(supplierRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> shipmentService.createShipment(shipment(1L, 2L, 5)))
                .isInstanceOf(SupplierNotFoundException.class);
    }

    @Test
    void createShipmentMissingProductThrows() {
        when(supplierRepository.existsById(1L)).thenReturn(true);
        when(productRepository.findById(2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shipmentService.createShipment(shipment(1L, 2L, 5)))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    void createShipmentInvalidQuantityThrows() {
        assertThatThrownBy(() -> shipmentService.createShipment(shipment(1L, 2L, 0)))
                .isInstanceOf(InvalidMovementException.class);
    }

    @Test
    void completingShipmentRaisesStock() {
        Shipment existing = shipment(1L, 2L, 5);
        existing.setStatus(ShipmentStatus.DUE);
        when(shipmentRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(shipmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Shipment result = shipmentService.updateStatus(9L, ShipmentStatus.COMPLETED);

        verify(stockMovementService).recordMovement(argThat(m ->
                m.getType() == MovementType.IN
                        && m.getProductId().equals(2L)
                        && m.getQuantity() == 5));
        assertThat(result.getStatus()).isEqualTo(ShipmentStatus.COMPLETED);
    }

    @Test
    void movingToInProgressDoesNotRaiseStock() {
        Shipment existing = shipment(1L, 2L, 5);
        existing.setStatus(ShipmentStatus.DUE);
        when(shipmentRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(shipmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Shipment result = shipmentService.updateStatus(9L, ShipmentStatus.IN_PROGRESS);

        verify(stockMovementService, never()).recordMovement(any());
        assertThat(result.getStatus()).isEqualTo(ShipmentStatus.IN_PROGRESS);
    }

    @Test
    void completingAlreadyCompletedDoesNotDoubleRaise() {
        Shipment existing = shipment(1L, 2L, 5);
        existing.setStatus(ShipmentStatus.COMPLETED);
        when(shipmentRepository.findById(9L)).thenReturn(Optional.of(existing));
        when(shipmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        shipmentService.updateStatus(9L, ShipmentStatus.COMPLETED);

        verify(stockMovementService, never()).recordMovement(any());
    }
}
