package moe.senti.account.utils;

import moe.senti.account.model.entity.GameAccount;

import java.util.Map;
import java.util.Optional;

public class AccountMatcher {
    private AccountMatcher() {}

    public static Optional<GameAccount> matchByUid(Map<String, GameAccount> uidIndex, String uid) {
        if (uid != null && !uid.isBlank() && uidIndex.containsKey(uid)) {
            return Optional.of(uidIndex.get(uid));
        }
        return Optional.empty();
    }

    public static Optional<GameAccount> matchByNameServer(Map<String, GameAccount> nameServerIndex,
                                                           String name, String server) {
        if (name == null || server == null) return Optional.empty();
        String key = (name.toLowerCase() + "|" + server.toLowerCase()).intern();
        return Optional.ofNullable(nameServerIndex.get(key));
    }

    public static String nameServerKey(String name, String server) {
        return (name.toLowerCase() + "|" + server.toLowerCase()).intern();
    }
}
