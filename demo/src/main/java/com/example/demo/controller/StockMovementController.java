package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.exception.InvalidMovementException;
import com.example.demo.model.StockMovement;
import com.example.demo.service.StockMovementService;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @GetMapping
    public List<StockMovement> getAll(@RequestParam(required = false) Long warehouseId,
                                      @RequestParam(required = false) Long productId) {
        if (productId == null && warehouseId == null) {
            throw new InvalidMovementException("warehouseId or productId is required");
        }
        if (productId != null) {
            return stockMovementService.getMovementsForProduct(productId);
        }
        return stockMovementService.getMovementsByWarehouse(warehouseId);
    }

    @PostMapping
    public StockMovement record(@RequestBody StockMovement movement) {
        return stockMovementService.recordMovement(movement);
    }
}
