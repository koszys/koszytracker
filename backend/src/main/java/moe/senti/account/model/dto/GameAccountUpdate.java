package moe.senti.account.model.dto;

public record GameAccountUpdate(
        String name,
        String server,
        Integer ar,
        String wl,
        String mcOption
) {}
