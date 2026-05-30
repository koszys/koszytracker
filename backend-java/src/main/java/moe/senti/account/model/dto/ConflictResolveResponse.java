package moe.senti.account.model.dto;

import java.util.List;

public record ConflictResolveResponse(
        List<GameAccountResponse> accounts,
        String message
) {}
