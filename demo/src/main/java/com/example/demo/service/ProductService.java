package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import com.example.demo.model.Product;

public interface ProductService {
    List<Product> getProductsByWarehouse(Long warehouseId);
    Optional<Product> getProductById(Long id);
    Product createProduct(Product product);
    void deleteProduct(Long id);
    Product updateProduct(Long id, Product product);
    List<Product> searchProducts(Long warehouseId, String keyword);
    List<Product> getLowStockProducts(Long warehouseId);
}
