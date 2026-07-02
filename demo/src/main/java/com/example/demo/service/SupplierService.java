package com.example.demo.service;

import java.util.List;

import com.example.demo.model.Supplier;

public interface SupplierService {
    List<Supplier> getAllSuppliers();
    Supplier getSupplierById(Long id);
    Supplier createSupplier(Supplier supplier);
    Supplier updateSupplier(Long id, Supplier supplier);
    void deleteSupplier(Long id);
    List<Supplier> searchSuppliers(String keyword);
}
