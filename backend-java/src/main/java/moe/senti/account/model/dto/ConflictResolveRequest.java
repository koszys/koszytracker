package moe.senti.account.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ConflictResolveRequest(
        @NotBlank String gameId,
        @NotBlank String resolution,
        @Valid List<GameAccountBase> localAccounts,
        List<GameAccountResponse> cloudAccounts
) {}
