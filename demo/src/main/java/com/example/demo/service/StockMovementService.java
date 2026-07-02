package com.example.demo.service;

import java.util.List;

import com.example.demo.model.StockMovement;

public interface StockMovementService {
    StockMovement recordMovement(StockMovement movement);
    List<StockMovement> getAllMovements();
    List<StockMovement> getMovementsForProduct(Long productId);
}
