package moe.senti.wish.model.dto;

public record WishData(
        String id,
        String uid,
        String name,
        int rarity,
        int gachaType,
        String time
) {}
