package moe.senti.wish.service;

import moe.senti.account.model.entity.GameAccount;
import moe.senti.auth.model.entity.User;
import moe.senti.wish.model.entity.Wish;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WishConflictServiceTest {

    @Mock
    private WishService wishService;

    private WishConflictService wishConflictService;

    private GameAccount testAccount;

    @BeforeEach
    void setUp() {
        wishConflictService = new WishConflictService(wishService);
        var testUser = User.builder().id(1).build();
        testAccount = GameAccount.builder().id(10).user(testUser).build();
    }

    @Test
    void checkConflict_equalCounts_noConflict() {
        List<Map<String, Object>> localWishes = List.of(
                Map.of("id", "w-1"),
                Map.of("id", "w-2")
        );
        List<Wish> cloudWishes = List.of(
                Wish.builder().id(1).wishUid("w-1").account(testAccount).timestamp(LocalDateTime.now()).build(),
                Wish.builder().id(2).wishUid("w-2").account(testAccount).timestamp(LocalDateTime.now()).build()
        );

        when(wishService.getAllUserWishes(1, "genshin")).thenReturn(cloudWishes);

        Map<String, Object> result = wishConflictService.checkConflict(1, "genshin", localWishes);

        assertFalse((Boolean) result.get("hasConflict"));
        assertEquals(2, result.get("localCount"));
        assertEquals(2, result.get("cloudCount"));
        assertEquals("Data is in sync", result.get("message"));
    }

    @Test
    void checkConflict_differentCounts_hasConflict() {
        List<Map<String, Object>> localWishes = List.of(
                Map.of("id", "w-1")
        );
        List<Wish> cloudWishes = List.of(
                Wish.builder().id(1).wishUid("w-1").account(testAccount).timestamp(LocalDateTime.now()).build(),
                Wish.builder().id(2).wishUid("w-2").account(testAccount).timestamp(LocalDateTime.now()).build()
        );

        when(wishService.getAllUserWishes(1, "genshin")).thenReturn(cloudWishes);

        Map<String, Object> result = wishConflictService.checkConflict(1, "genshin", localWishes);

        assertTrue((Boolean) result.get("hasConflict"));
        assertEquals("Conflict detected", result.get("message"));
    }

    @Test
    void checkConflict_emptyLocalAndCloud_noConflict() {
        when(wishService.getAllUserWishes(1, "genshin")).thenReturn(List.of());

        Map<String, Object> result = wishConflictService.checkConflict(1, "genshin", List.of());

        assertFalse((Boolean) result.get("hasConflict"));
        assertEquals(0, result.get("localCount"));
        assertEquals(0, result.get("cloudCount"));
    }

    @Test
    void checkConflict_cloudLastSyncedAt_populated() {
        Wish w = Wish.builder().id(1).wishUid("w-1").account(testAccount)
                .timestamp(LocalDateTime.now()).lastSyncedAt(Instant.parse("2026-01-01T00:00:00Z"))
                .build();

        when(wishService.getAllUserWishes(1, "genshin")).thenReturn(List.of(w));

        Map<String, Object> result = wishConflictService.checkConflict(1, "genshin", List.of());

        assertNotNull(result.get("cloudModifiedAt"));
    }
}
