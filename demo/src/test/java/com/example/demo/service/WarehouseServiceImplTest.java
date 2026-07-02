package com.example.demo.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.exception.UserNotFoundException;
import com.example.demo.exception.WarehouseNotFoundException;
import com.example.demo.model.User;
import com.example.demo.model.Warehouse;
import com.example.demo.model.WarehouseMember;
import com.example.demo.repository.UserRepository;
import com.example.demo.repository.WarehouseMemberRepository;
import com.example.demo.repository.WarehouseRepository;

@ExtendWith(MockitoExtension.class)
class WarehouseServiceImplTest {

    @Mock
    private WarehouseRepository warehouseRepository;

    @Mock
    private WarehouseMemberRepository warehouseMemberRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WarehouseServiceImpl warehouseService;

    @Test
    void createWarehouseClearsIdAndSaves() {
        Warehouse warehouse = new Warehouse();
        warehouse.setId(99L);
        when(warehouseRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        warehouseService.createWarehouse(warehouse);

        verify(warehouseRepository).save(argThat(w -> w.getId() == null));
    }

    @Test
    void getWarehouseByIdMissingThrows() {
        when(warehouseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> warehouseService.getWarehouseById(1L))
                .isInstanceOf(WarehouseNotFoundException.class);
    }

    @Test
    void getWarehousesForUserCombinesOwnedAndMember() {
        Warehouse w1 = new Warehouse();
        w1.setId(1L);
        Warehouse w2 = new Warehouse();
        w2.setId(2L);

        WarehouseMember member = new WarehouseMember();
        member.setWarehouseId(2L);

        when(warehouseRepository.findByOwnerId(1L)).thenReturn(List.of(w1));
        when(warehouseMemberRepository.findByUserId(1L)).thenReturn(List.of(member));
        when(warehouseRepository.findById(2L)).thenReturn(Optional.of(w2));

        List<Warehouse> result = warehouseService.getWarehousesForUser(1L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(1L);
        assertThat(result.get(1).getId()).isEqualTo(2L);
    }

    @Test
    void addMemberByUsernameCreatesMembership() {
        Warehouse warehouse = new Warehouse();
        warehouse.setId(1L);
        User user = new User();
        user.setId(5L);

        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(userRepository.findByUsername("bob")).thenReturn(Optional.of(user));
        when(warehouseMemberRepository.existsByWarehouseIdAndUserId(1L, 5L)).thenReturn(false);
        when(warehouseMemberRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = warehouseService.addMember(1L, "bob");

        verify(warehouseMemberRepository).save(argThat(m -> m.getWarehouseId().equals(1L) && m.getUserId().equals(5L)));
        assertThat(result.getId()).isEqualTo(5L);
    }

    @Test
    void addMemberUnknownUserThrows() {
        Warehouse warehouse = new Warehouse();
        warehouse.setId(1L);

        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(userRepository.findByUsername("ghost")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("ghost")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> warehouseService.addMember(1L, "ghost"))
                .isInstanceOf(UserNotFoundException.class);
    }
}
