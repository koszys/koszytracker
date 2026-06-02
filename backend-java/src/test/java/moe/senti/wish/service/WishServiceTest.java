package moe.senti.wish.service;

import moe.senti.account.model.entity.GameAccount;
import moe.senti.account.repository.GameAccountRepository;
import moe.senti.auth.model.entity.User;
import moe.senti.auth.repository.UserRepository;
import moe.senti.wish.model.dto.WishData;
import moe.senti.wish.model.entity.Wish;
import moe.senti.wish.repository.WishRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WishServiceTest {

    @Mock
    private WishRepository wishRepository;

    @Mock
    private GameAccountRepository gameAccountRepository;

    @Mock
    private UserRepository userRepository;

    private WishService wishService;

    private User testUser;
    private GameAccount testAccount;
    private Wish testWish;

    @BeforeEach
    void setUp() {
        wishService = new WishService(wishRepository, gameAccountRepository, userRepository);
        testUser = User.builder().id(1).email("u@test.com").build();
        testAccount = GameAccount.builder().id(10).user(testUser).gameId("genshin")
                .uid("123456").server("os_i").name("Test").build();
        testWish = Wish.builder().id(100).wishUid("wish-1").account(testAccount)
                .gachaType(301).itemId("item1").itemName("Sword").rarity(5)
                .timestamp(LocalDateTime.of(2026, 1, 1, 12, 0)).lastSyncedAt(Instant.now()).build();
    }

    // --- getWishesByAccount ---

    @Test
    void getWishesByAccount_returnsWishes() {
        when(wishRepository.findByAccountId(10)).thenReturn(List.of(testWish));

        List<Wish> result = wishService.getWishesByAccount(10);

        assertEquals(1, result.size());
        assertEquals("wish-1", result.getFirst().getWishUid());
    }

    // --- getOrCreateGameAccount ---

    @Test
    void getOrCreateGameAccount_existing_returnsAccount() {
        when(gameAccountRepository.findByGameIdAndUid("genshin", "123456"))
                .thenReturn(Optional.of(testAccount));

        GameAccount result = wishService.getOrCreateGameAccount(1, "genshin", "123456", "os_i", "Test");

        assertNotNull(result);
        assertEquals(10, result.getId());
        verify(gameAccountRepository, never()).save(any());
    }

    @Test
    void getOrCreateGameAccount_uidBelongsToOtherUser_throws() {
        User otherUser = User.builder().id(2).email("other@test.com").build();
        GameAccount otherAccount = GameAccount.builder().id(20).user(otherUser).gameId("genshin")
                .uid("123456").build();

        when(gameAccountRepository.findByGameIdAndUid("genshin", "123456"))
                .thenReturn(Optional.of(otherAccount));

        assertThrows(ResponseStatusException.class,
                () -> wishService.getOrCreateGameAccount(1, "genshin", "123456", "os_i", "Test"));
    }

    @Test
    void getOrCreateGameAccount_new_createsAccount() {
        when(gameAccountRepository.findByGameIdAndUid("genshin", "999"))
                .thenReturn(Optional.empty());
        when(userRepository.getReferenceById(1)).thenReturn(testUser);

        GameAccount newAccount = GameAccount.builder().id(30).user(testUser).gameId("genshin")
                .uid("999").server("os_i").name("New").build();
        when(gameAccountRepository.save(any())).thenReturn(newAccount);

        GameAccount result = wishService.getOrCreateGameAccount(1, "genshin", "999", "os_i", "New");

        assertNotNull(result);
        assertEquals("999", result.getUid());
    }

    // --- batchCreateWishes ---

    @Test
    void batchCreateWishes_newWishes_inserted() {
        Wish w1 = Wish.builder().wishUid("w-1").build();
        Wish w2 = Wish.builder().wishUid("w-2").build();

        when(wishRepository.findByWishUid("w-1")).thenReturn(Optional.empty());
        when(wishRepository.findByWishUid("w-2")).thenReturn(Optional.empty());

        int count = wishService.batchCreateWishes(List.of(w1, w2));

        assertEquals(2, count);
        verify(wishRepository, times(2)).save(any());
        verify(wishRepository).flush();
    }

    @Test
    void batchCreateWishes_duplicates_skipped() {
        Wish w1 = Wish.builder().wishUid("dup").build();
        Wish w2 = Wish.builder().wishUid("new").build();

        when(wishRepository.findByWishUid("dup")).thenReturn(Optional.of(testWish));
        when(wishRepository.findByWishUid("new")).thenReturn(Optional.empty());

        int count = wishService.batchCreateWishes(List.of(w1, w2));

        assertEquals(1, count);
        verify(wishRepository, times(1)).save(any());
    }

    @Test
    void batchCreateWishes_emptyList_returnsZero() {
        int count = wishService.batchCreateWishes(List.of());
        assertEquals(0, count);
        verify(wishRepository, never()).save(any());
    }

    // --- getAllUserWishes ---

    @Test
    void getAllUserWishes_returnsByAccountIds() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of(testAccount));
        when(wishRepository.findByAccountIdIn(List.of(10)))
                .thenReturn(List.of(testWish));

        List<Wish> result = wishService.getAllUserWishes(1, "genshin");

        assertEquals(1, result.size());
    }

    @Test
    void getAllUserWishes_noAccounts_returnsEmpty() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of());

        List<Wish> result = wishService.getAllUserWishes(1, "genshin");

        assertTrue(result.isEmpty());
    }

    // --- resolveWishesConflict ---

    @Test
    void resolveWishesConflict_cloud_returnsCloudCount() {
        int count = wishService.resolveWishesConflict(1, "genshin", "cloud",
                List.of(), List.of(Map.of("id", "w-1")));

        assertEquals(1, count);
        verifyNoInteractions(wishRepository);
    }

    @Test
    void resolveWishesConflict_local_insertsIfAbsent() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of(testAccount));
        when(wishRepository.findByWishUid("w-1")).thenReturn(Optional.empty());

        List<Map<String, Object>> localWishes = List.of(
                Map.of("id", "w-1", "name", "Sword", "rank_type", 5, "gacha_type", 301, "time", "2026-01-01 12:00:00")
        );

        int count = wishService.resolveWishesConflict(1, "genshin", "local", localWishes, List.of());

        assertEquals(1, count);
        verify(wishRepository, times(1)).save(any());
    }

    @Test
    void resolveWishesConflict_noAccounts_returnsZero() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of());

        int count = wishService.resolveWishesConflict(1, "genshin", "local",
                List.of(Map.of("id", "w-1")), List.of());

        assertEquals(0, count);
    }

    // --- formatFrontendWishes ---

    @Test
    void formatFrontendWishes_mapsCorrectly() {
        List<Map<String, Object>> raw = List.of(
                Map.of("id", "w-1", "uid", "123", "name", "Sword", "rank_type", 5, "gacha_type", 301, "time", "2026-01-01T12:00:00")
        );

        List<WishData> result = wishService.formatFrontendWishes(raw);

        assertEquals(1, result.size());
        assertEquals("w-1", result.getFirst().id());
        assertEquals(5, result.getFirst().rarity());
        assertEquals(301, result.getFirst().gachaType());
    }

    @Test
    void formatFrontendWishes_emptyInput() {
        List<WishData> result = wishService.formatFrontendWishes(List.of());
        assertTrue(result.isEmpty());
    }
}
