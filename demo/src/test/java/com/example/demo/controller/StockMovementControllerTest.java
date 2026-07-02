package com.example.demo.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.model.MovementType;
import com.example.demo.model.StockMovement;
import com.example.demo.service.StockMovementService;

@WebMvcTest(StockMovementController.class)
class StockMovementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private StockMovementService stockMovementService;

    @Test
    void recordMovementReturnsSavedMovement() throws Exception {
        StockMovement saved = new StockMovement();
        saved.setProductId(1L);
        saved.setType(MovementType.IN);
        saved.setQuantity(4);
        when(stockMovementService.recordMovement(any())).thenReturn(saved);

        String body = "{\"productId\":1,\"type\":\"IN\",\"quantity\":4}";

        mockMvc.perform(post("/api/stock-movements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.quantity").value(4))
                .andExpect(jsonPath("$.type").value("IN"));
    }
}
