package moe.senti.account.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SyncAccountsRequest(
        @NotBlank String gameId,
        @NotEmpty @Valid List<GameAccountBase> accounts
) {}
