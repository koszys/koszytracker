package moe.senti.wish.model.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Map;

public record WishesCheckConflictRequest(
        @NotBlank String gameId,
        List<Map<String, Object>> wishes
) {}
