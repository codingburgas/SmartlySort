package com.example.demo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.exception.ProductNotFoundException;
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

    @Test
    void updateProductThrowsWhenMissing() {
        when(productRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> productService.updateProduct(1L, new Product()))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    void updateProductSavesWhenExists() {
        Product product = new Product();
        when(productRepository.existsById(1L)).thenReturn(true);
        when(productRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Product result = productService.updateProduct(1L, product);

        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void deleteProductThrowsWhenMissing() {
        when(productRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> productService.deleteProduct(1L))
                .isInstanceOf(ProductNotFoundException.class);
    }

    @Test
    void deleteProductDeletesWhenExists() {
        when(productRepository.existsById(1L)).thenReturn(true);

        productService.deleteProduct(1L);

        verify(productRepository).deleteById(1L);
    }
}
