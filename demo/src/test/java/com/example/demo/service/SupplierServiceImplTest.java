package com.example.demo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.exception.SupplierNotFoundException;
import com.example.demo.model.Supplier;
import com.example.demo.repository.SupplierRepository;

@ExtendWith(MockitoExtension.class)
class SupplierServiceImplTest {

    @Mock
    private SupplierRepository supplierRepository;

    @InjectMocks
    private SupplierServiceImpl supplierService;

    @Test
    void getSupplierByIdMissingThrows() {
        when(supplierRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> supplierService.getSupplierById(1L))
                .isInstanceOf(SupplierNotFoundException.class);
    }

    @Test
    void deleteSupplierMissingThrows() {
        when(supplierRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> supplierService.deleteSupplier(1L))
                .isInstanceOf(SupplierNotFoundException.class);
    }

    @Test
    void updateSupplierMissingThrows() {
        when(supplierRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> supplierService.updateSupplier(1L, new Supplier()))
                .isInstanceOf(SupplierNotFoundException.class);
    }

    @Test
    void createSupplierSaves() {
        Supplier supplier = new Supplier();
        supplier.setName("Acme");
        when(supplierRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Supplier result = supplierService.createSupplier(supplier);

        assertThat(result).isNotNull();
        verify(supplierRepository).save(supplier);
    }
}
