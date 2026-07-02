package com.example.demo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.exception.InsufficientStockException;
import com.example.demo.exception.InvalidMovementException;
import com.example.demo.exception.ProductNotFoundException;
import com.example.demo.model.MovementType;
import com.example.demo.model.Product;
import com.example.demo.model.StockMovement;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.StockMovementRepository;

@ExtendWith(MockitoExtension.class)
class StockMovementServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @InjectMocks
    private StockMovementServiceImpl service;

    private Product productWithQuantity(int quantity) {
        Product product = new Product();
        product.setId(1L);
        product.setQuantity(quantity);
        return product;
    }

    private StockMovement movement(MovementType type, int quantity) {
        StockMovement movement = new StockMovement();
        movement.setProductId(1L);
        movement.setType(type);
        movement.setQuantity(quantity);
        return movement;
    }

    @Test
    void stockInIncreasesProductQuantity() {
        Product product = productWithQuantity(5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(stockMovementRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.recordMovement(movement(MovementType.IN, 3));

        assertThat(product.getQuantity()).isEqualTo(8);
        verify(productRepository).save(product);
    }

    @Test
    void stockOutDecreasesProductQuantity() {
        Product product = productWithQuantity(5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(stockMovementRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.recordMovement(movement(MovementType.OUT, 2));

        assertThat(product.getQuantity()).isEqualTo(3);
        verify(productRepository).save(product);
    }

    @Test
    void stockOutBeyondAvailableThrows() {
        Product product = productWithQuantity(1);
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));

        assertThatThrownBy(() -> service.recordMovement(movement(MovementType.OUT, 5)))
                .isInstanceOf(InsufficientStockException.class);
    }

    @Test
    void nonPositiveQuantityThrows() {
        assertThatThrownBy(() -> service.recordMovement(movement(MovementType.IN, 0)))
                .isInstanceOf(InvalidMovementException.class);
    }

    @Test
    void missingTypeThrows() {
        assertThatThrownBy(() -> service.recordMovement(movement(null, 3)))
                .isInstanceOf(InvalidMovementException.class);
    }

    @Test
    void missingProductThrows() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.recordMovement(movement(MovementType.IN, 3)))
                .isInstanceOf(ProductNotFoundException.class);
    }
}
