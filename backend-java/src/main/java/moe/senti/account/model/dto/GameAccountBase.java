package moe.senti.account.model.dto;

import jakarta.validation.constraints.NotBlank;

public record GameAccountBase(
        @NotBlank String gameId,
        String uid,
        @NotBlank String name,
        @NotBlank String server,
        int ar,
        String wl,
        String mcOption
) {}
