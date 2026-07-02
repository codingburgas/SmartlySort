package com.example.demo.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.exception.ProductNotFoundException;
import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public List<Product> getProductsByWarehouse(Long warehouseId) {
        return productRepository.findByWarehouseId(warehouseId);
    }

    @Override
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Override
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }

    @Override
    public Product updateProduct(Long id, Product product) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        product.setId(id);
        return productRepository.save(product);
    }

    @Override
    public List<Product> searchProducts(Long warehouseId, String keyword) {
        return productRepository.findByWarehouseIdAndNameContainingIgnoreCase(warehouseId, keyword);
    }

    @Override
    public List<Product> getLowStockProducts(Long warehouseId) {
        return productRepository.findByWarehouseId(warehouseId).stream()
                .filter(p -> p.getQuantity() <= p.getMinStockLevel())
                .collect(Collectors.toList());
    }
}
