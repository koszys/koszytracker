package moe.senti.wish.model.dto;

import java.time.Instant;
import java.time.LocalDateTime;

public record WishResponse(
        int id,
        String wishUid,
        int accountId,
        int gachaType,
        String itemId,
        String itemName,
        int rarity,
        LocalDateTime timestamp,
        String bannerId,
        Instant lastSyncedAt
) {}
