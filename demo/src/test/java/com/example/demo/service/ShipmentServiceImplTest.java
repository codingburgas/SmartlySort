package com.example.demo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.exception.InvalidMovementException;
import com.example.demo.exception.SupplierNotFoundException;
import com.example.demo.model.MovementType;
import com.example.demo.model.Shipment;
import com.example.demo.repository.ShipmentRepository;
import com.example.demo.repository.SupplierRepository;

@ExtendWith(MockitoExtension.class)
class ShipmentServiceImplTest {

    @Mock
    private ShipmentRepository shipmentRepository;

    @Mock
    private SupplierRepository supplierRepository;

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

    @Test
    void receiveShipmentRaisesStockAndSaves() {
        when(supplierRepository.existsById(1L)).thenReturn(true);
        when(shipmentRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Shipment result = shipmentService.receiveShipment(shipment(1L, 2L, 5));

        verify(stockMovementService).recordMovement(argThat(m ->
                m.getType() == MovementType.IN
                        && m.getProductId().equals(2L)
                        && m.getQuantity() == 5));
        assertThat(result).isNotNull();
    }

    @Test
    void receiveShipmentMissingSupplierThrows() {
        when(supplierRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> shipmentService.receiveShipment(shipment(1L, 2L, 5)))
                .isInstanceOf(SupplierNotFoundException.class);
    }

    @Test
    void receiveShipmentInvalidQuantityThrows() {
        assertThatThrownBy(() -> shipmentService.receiveShipment(shipment(1L, 2L, 0)))
                .isInstanceOf(InvalidMovementException.class);
    }
}
