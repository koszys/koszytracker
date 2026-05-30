package moe.senti.account.model.dto;

import java.time.Instant;
import java.util.List;

public record ConflictCheckResponse(
        boolean hasConflict,
        Instant localModifiedAt,
        Instant cloudModifiedAt,
        List<GameAccountResponse> cloudAccounts,
        String message
) {}
