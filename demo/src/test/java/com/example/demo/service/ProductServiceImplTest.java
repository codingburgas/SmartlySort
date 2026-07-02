package com.example.demo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.model.Product;
import com.example.demo.repository.ProductRepository;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void searchProductsDelegatesToRepository() {
        Product product = new Product();
        product.setName("Bolt");
        when(productRepository.findByNameContainingIgnoreCase("bo"))
                .thenReturn(List.of(product));

        List<Product> result = productService.searchProducts("bo");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Bolt");
    }
}
