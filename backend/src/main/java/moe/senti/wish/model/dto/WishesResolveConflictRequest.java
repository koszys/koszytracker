package moe.senti.wish.model.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Map;

public record WishesResolveConflictRequest(
        @NotBlank String gameId,
        @NotBlank String resolution,
        List<Map<String, Object>> localWishes,
        List<Map<String, Object>> cloudWishes
) {}
