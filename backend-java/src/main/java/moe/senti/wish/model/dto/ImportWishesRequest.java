package moe.senti.wish.model.dto;

import jakarta.validation.constraints.NotBlank;

public record ImportWishesRequest(
        @NotBlank String url,
        @NotBlank String gameId,
        Integer accountId
) {}
