package com.library.controller;

import com.library.dto.StockAdjustmentDto;
import com.library.entity.InventoryTransaction;
import com.library.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @PostMapping("/adjust")
    public ResponseEntity<InventoryTransaction> adjustStock(@Valid @RequestBody StockAdjustmentDto dto) {
        InventoryTransaction tx = inventoryService.adjustStock(dto);
        return new ResponseEntity<>(tx, HttpStatus.CREATED);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<InventoryTransaction>> getTransactions(@RequestParam(required = false) Long bookId) {
        return ResponseEntity.ok(inventoryService.getTransactions(bookId));
    }
}
