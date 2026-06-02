package moe.senti.account.utils;

import moe.senti.account.model.entity.GameAccount;
import moe.senti.auth.model.entity.User;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

class AccountMatcherTest {

    private final User user = User.builder().id(1).build();

    @Test
    void matchByUid_found() {
        GameAccount acc = GameAccount.builder().id(1).uid("123").user(user).build();
        Map<String, GameAccount> index = Map.of("123", acc);

        Optional<GameAccount> result = AccountMatcher.matchByUid(index, "123");

        assertTrue(result.isPresent());
        assertEquals(1, result.get().getId());
    }

    @Test
    void matchByUid_notFound() {
        Map<String, GameAccount> index = Map.of("123", GameAccount.builder().uid("123").user(user).build());

        Optional<GameAccount> result = AccountMatcher.matchByUid(index, "999");

        assertFalse(result.isPresent());
    }

    @Test
    void matchByUid_nullUid() {
        Optional<GameAccount> result = AccountMatcher.matchByUid(Map.of(), null);
        assertFalse(result.isPresent());
    }

    @Test
    void matchByUid_blankUid() {
        Optional<GameAccount> result = AccountMatcher.matchByUid(Map.of(), "  ");
        assertFalse(result.isPresent());
    }

    @Test
    void matchByNameServer_found() {
        GameAccount acc = GameAccount.builder().id(1).name("Test").server("os_i").user(user).build();
        Map<String, GameAccount> index = Map.of("test|os_i", acc);

        Optional<GameAccount> result = AccountMatcher.matchByNameServer(index, "Test", "os_i");

        assertTrue(result.isPresent());
    }

    @Test
    void matchByNameServer_caseInsensitive() {
        GameAccount acc = GameAccount.builder().id(1).name("Test").server("OS_I").user(user).build();
        Map<String, GameAccount> index = Map.of("test|os_i", acc);

        Optional<GameAccount> result = AccountMatcher.matchByNameServer(index, "TEST", "Os_I");

        assertTrue(result.isPresent());
    }

    @Test
    void matchByNameServer_notFound() {
        Optional<GameAccount> result = AccountMatcher.matchByNameServer(Map.of(), "X", "y");
        assertFalse(result.isPresent());
    }

    @Test
    void matchByNameServer_nullName() {
        Optional<GameAccount> result = AccountMatcher.matchByNameServer(Map.of(), null, "os_i");
        assertFalse(result.isPresent());
    }

    @Test
    void nameServerKey_normalizes() {
        String key = AccountMatcher.nameServerKey("TestName", "OS_I");
        assertEquals("testname|os_i", key);
    }
}
