package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.exception.InsufficientStockException;
import com.example.demo.exception.InvalidMovementException;
import com.example.demo.exception.ProductNotFoundException;
import com.example.demo.model.MovementType;
import com.example.demo.model.Product;
import com.example.demo.model.StockMovement;
import com.example.demo.repository.ProductRepository;
import com.example.demo.repository.StockMovementRepository;

@Service
public class StockMovementServiceImpl implements StockMovementService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;

    public StockMovementServiceImpl(ProductRepository productRepository,
                                    StockMovementRepository stockMovementRepository) {
        this.productRepository = productRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    @Override
    @Transactional
    public StockMovement recordMovement(StockMovement movement) {
        if (movement.getQuantity() <= 0) {
            throw new InvalidMovementException("Quantity must be positive");
        }
        if (movement.getType() == null) {
            throw new InvalidMovementException("Movement type is required");
        }

        Product product = productRepository.findById(movement.getProductId())
                .orElseThrow(() -> new ProductNotFoundException(movement.getProductId()));

        movement.setWarehouseId(product.getWarehouseId());

        if (movement.getType() == MovementType.OUT) {
            if (product.getQuantity() < movement.getQuantity()) {
                throw new InsufficientStockException(product.getId());
            }
            product.setQuantity(product.getQuantity() - movement.getQuantity());
        } else {
            product.setQuantity(product.getQuantity() + movement.getQuantity());
        }

        productRepository.save(product);
        return stockMovementRepository.save(movement);
    }

    @Override
    public List<StockMovement> getMovementsByWarehouse(Long warehouseId) {
        return stockMovementRepository.findByWarehouseId(warehouseId);
    }

    @Override
    public List<StockMovement> getMovementsForProduct(Long productId) {
        return stockMovementRepository.findByProductId(productId);
    }
}
