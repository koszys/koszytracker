package moe.senti.account.model.dto;

import java.time.Instant;

public record GameAccountResponse(
        int id,
        int userId,
        String gameId,
        String uid,
        String name,
        String server,
        int ar,
        String wl,
        String mcOption,
        Instant lastSyncedAt
) {}
