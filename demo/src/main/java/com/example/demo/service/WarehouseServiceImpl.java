package com.example.demo.service;

import com.example.demo.exception.UserNotFoundException;
import com.example.demo.exception.WarehouseNotFoundException;
import com.example.demo.model.User;
import com.example.demo.model.Warehouse;
import com.example.demo.model.WarehouseMember;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WarehouseMemberRepository;
import com.example.demo.repository.WarehouseRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class WarehouseServiceImpl implements WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final WarehouseMemberRepository warehouseMemberRepository;
    private final UserRepository userRepository;

    public WarehouseServiceImpl(WarehouseRepository warehouseRepository,
                                WarehouseMemberRepository warehouseMemberRepository,
                                UserRepository userRepository) {
        this.warehouseRepository = warehouseRepository;
        this.warehouseMemberRepository = warehouseMemberRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Warehouse createWarehouse(Warehouse warehouse) {
        warehouse.setId(null);
        return warehouseRepository.save(warehouse);
    }

    @Override
    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new WarehouseNotFoundException(id));
    }

    @Override
    public Warehouse updateWarehouse(Long id, Warehouse warehouse) {
        if (!warehouseRepository.existsById(id)) {
            throw new WarehouseNotFoundException(id);
        }
        warehouse.setId(id);
        return warehouseRepository.save(warehouse);
    }

    @Override
    public void deleteWarehouse(Long id) {
        if (!warehouseRepository.existsById(id)) {
            throw new WarehouseNotFoundException(id);
        }
        List<WarehouseMember> members = warehouseMemberRepository.findByWarehouseId(id);
        warehouseMemberRepository.deleteAll(members);
        warehouseRepository.deleteById(id);
    }

    @Override
    public List<Warehouse> getWarehousesForUser(Long userId) {
        Map<Long, Warehouse> result = new LinkedHashMap<>();
        for (Warehouse w : warehouseRepository.findByOwnerId(userId)) {
            result.put(w.getId(), w);
        }
        for (WarehouseMember m : warehouseMemberRepository.findByUserId(userId)) {
            warehouseRepository.findById(m.getWarehouseId()).ifPresent(w -> result.put(w.getId(), w));
        }
        return new ArrayList<>(result.values());
    }

    @Override
    public User addMember(Long warehouseId, String usernameOrEmail) {
        getWarehouseById(warehouseId);
        User user = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail))
                .orElseThrow(() -> new UserNotFoundException(usernameOrEmail));
        if (!warehouseMemberRepository.existsByWarehouseIdAndUserId(warehouseId, user.getId())) {
            WarehouseMember member = new WarehouseMember();
            member.setWarehouseId(warehouseId);
            member.setUserId(user.getId());
            warehouseMemberRepository.save(member);
        }
        return user;
    }

    @Override
    public List<User> getMembers(Long warehouseId) {
        getWarehouseById(warehouseId);
        List<User> users = new ArrayList<>();
        for (WarehouseMember m : warehouseMemberRepository.findByWarehouseId(warehouseId)) {
            userRepository.findById(m.getUserId()).ifPresent(users::add);
        }
        return users;
    }

    @Override
    public void removeMember(Long warehouseId, Long userId) {
        warehouseMemberRepository.findByWarehouseIdAndUserId(warehouseId, userId)
                .ifPresent(m -> warehouseMemberRepository.deleteById(m.getId()));
    }
}
