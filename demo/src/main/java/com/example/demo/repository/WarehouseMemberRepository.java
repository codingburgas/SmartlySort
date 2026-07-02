package com.example.demo.repository;

import com.example.demo.model.WarehouseMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WarehouseMemberRepository extends JpaRepository<WarehouseMember, Long> {
    List<WarehouseMember> findByWarehouseId(Long warehouseId);
    List<WarehouseMember> findByUserId(Long userId);
    boolean existsByWarehouseIdAndUserId(Long warehouseId, Long userId);
    Optional<WarehouseMember> findByWarehouseIdAndUserId(Long warehouseId, Long userId);
}
