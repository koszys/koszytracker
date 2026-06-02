package moe.senti.wish.model.dto;

import java.time.Instant;

public record WishesCheckConflictResponse(
        boolean hasConflict,
        int localCount,
        int cloudCount,
        Instant localModifiedAt,
        Instant cloudModifiedAt,
        String message
) {}
