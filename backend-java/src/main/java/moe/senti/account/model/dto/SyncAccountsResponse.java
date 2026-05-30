package moe.senti.account.model.dto;

import java.util.List;

public record SyncAccountsResponse(
        List<GameAccountResponse> accounts,
        String message
) {}
