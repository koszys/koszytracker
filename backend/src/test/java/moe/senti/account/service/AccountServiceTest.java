package moe.senti.account.service;

import moe.senti.account.model.dto.*;
import moe.senti.account.model.entity.GameAccount;
import moe.senti.account.repository.GameAccountRepository;
import moe.senti.auth.model.entity.User;
import moe.senti.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private GameAccountRepository gameAccountRepository;

    @Mock
    private UserRepository userRepository;

    private AccountService accountService;

    private User testUser;
    private GameAccount testAccount;

    @BeforeEach
    void setUp() {
        accountService = new AccountService(gameAccountRepository, userRepository);

        testUser = User.builder().id(1).email("u@test.com").name("U").build();
        testAccount = GameAccount.builder()
                .id(10).user(testUser).gameId("genshin").uid("123456")
                .name("Test").server("os_i").ar(60).wl("9").mcOption("")
                .lastSyncedAt(Instant.now())
                .build();
    }

    // --- getUserAccounts ---

    @Test
    void getUserAccounts_withGameId_returnsFiltered() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of(testAccount));

        List<GameAccountResponse> result = accountService.getUserAccounts(1, "genshin");

        assertEquals(1, result.size());
        assertEquals("Test", result.getFirst().name());
    }

    @Test
    void getUserAccounts_withoutGameId_returnsAll() {
        when(gameAccountRepository.findByUserId(1))
                .thenReturn(List.of(testAccount));

        List<GameAccountResponse> result = accountService.getUserAccounts(1, null);

        assertEquals(1, result.size());
    }

    // --- getAccountById ---

    @Test
    void getAccountById_owned_returnsAccount() {
        when(gameAccountRepository.findById(10)).thenReturn(Optional.of(testAccount));

        GameAccountResponse result = accountService.getAccountById(10, 1);

        assertEquals("Test", result.name());
    }

    @Test
    void getAccountById_notOwned_throwsForbidden() {
        when(gameAccountRepository.findById(10)).thenReturn(Optional.of(testAccount));

        assertThrows(ResponseStatusException.class, () -> accountService.getAccountById(10, 2));
    }

    @Test
    void getAccountById_notFound_throwsNotFound() {
        when(gameAccountRepository.findById(99)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> accountService.getAccountById(99, 1));
    }

    // --- createAccount ---

    @Test
    void createAccount_createsAndReturns() {
        when(userRepository.findById(1)).thenReturn(Optional.of(testUser));
        when(gameAccountRepository.save(any())).thenReturn(testAccount);

        GameAccountCreate dto = new GameAccountCreate("genshin", "123456", "Test", "os_i", 60, "9", "");

        GameAccountResponse result = accountService.createAccount(1, dto);

        assertNotNull(result);
        assertEquals("Test", result.name());
    }

    @Test
    void createAccount_userNotFound_throws() {
        when(userRepository.findById(99)).thenReturn(Optional.empty());

        GameAccountCreate dto = new GameAccountCreate("genshin", "u", "n", "s", 1, "0", "");

        assertThrows(ResponseStatusException.class, () -> accountService.createAccount(99, dto));
    }

    // --- updateAccount ---

    @Test
    void updateAccount_partialUpdate_mergesFields() {
        when(gameAccountRepository.findById(10)).thenReturn(Optional.of(testAccount));
        when(gameAccountRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        GameAccountUpdate dto = new GameAccountUpdate("NewName", null, null, null, "newMc");

        GameAccountResponse result = accountService.updateAccount(10, 1, dto);

        assertEquals("NewName", result.name());
        assertEquals("os_i", result.server());
        assertEquals("newMc", result.mcOption());
    }

    // --- deleteAccount ---

    @Test
    void deleteAccount_owned_succeeds() {
        when(gameAccountRepository.findById(10)).thenReturn(Optional.of(testAccount));

        accountService.deleteAccount(10, 1);

        verify(gameAccountRepository).delete(testAccount);
    }

    @Test
    void deleteAccount_notOwned_throws() {
        when(gameAccountRepository.findById(10)).thenReturn(Optional.of(testAccount));

        assertThrows(ResponseStatusException.class, () -> accountService.deleteAccount(10, 2));
    }

    // --- syncAccounts ---

    @Test
    void syncAccounts_matchesByUid_updatesExisting() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of(testAccount));

        GameAccountBase fc = new GameAccountBase("genshin", "123456", "Updated", "os_i", 60, "9", "");
        SyncAccountsRequest req = new SyncAccountsRequest("genshin", List.of(fc));
        when(gameAccountRepository.saveAll(any())).thenAnswer(i -> i.getArgument(0));

        SyncAccountsResponse result = accountService.syncAccounts(1, req.gameId(), req.accounts());

        assertEquals(1, result.accounts().size());
        assertEquals("Updated", result.accounts().getFirst().name());
    }

    @Test
    void syncAccounts_newAccount_created() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of());
        when(userRepository.getReferenceById(1)).thenReturn(testUser);

        GameAccountBase fc = new GameAccountBase("genshin", "999", "New", "os_i", 1, "0", "");
        SyncAccountsRequest req = new SyncAccountsRequest("genshin", List.of(fc));
        when(gameAccountRepository.saveAll(any())).thenAnswer(i -> {
            List<GameAccount> accounts = i.getArgument(0);
            AtomicInteger counter = new AtomicInteger(100);
            accounts.forEach(a -> { if (a.getId() == null) a.setId(counter.getAndIncrement()); });
            return accounts;
        });

        accountService.syncAccounts(1, req.gameId(), req.accounts());

        verify(gameAccountRepository).saveAll(any());
    }

    @Test
    void syncAccounts_unmatchedExisting_deleted() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of(testAccount));
        when(userRepository.getReferenceById(1)).thenReturn(testUser);

        GameAccountBase fc = new GameAccountBase("genshin", "999", "Diff", "os_i", 1, "0", "");
        SyncAccountsRequest req = new SyncAccountsRequest("genshin", List.of(fc));
        when(gameAccountRepository.saveAll(any())).thenAnswer(i -> {
            List<GameAccount> accounts = i.getArgument(0);
            AtomicInteger counter = new AtomicInteger(100);
            accounts.forEach(a -> { if (a.getId() == null) a.setId(counter.getAndIncrement()); });
            return accounts;
        });

        accountService.syncAccounts(1, req.gameId(), req.accounts());

        verify(gameAccountRepository).delete(testAccount);
    }

    // --- checkAccountsConflict ---

    @Test
    void checkAccountsConflict_noCloudData_noConflict() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of());

        ConflictCheckRequest req = new ConflictCheckRequest("genshin", List.of(
                new GameAccountBase("genshin", "1", "A", "os_i", 60, "9", "")
        ));

        ConflictCheckResponse result = accountService.checkAccountsConflict(1, req.gameId(), req.accounts());

        assertFalse(result.hasConflict());
        assertEquals("No cloud data - will use local", result.message());
    }

    @Test
    void checkAccountsConflict_differentSizes_conflict() {
        GameAccount cloud = GameAccount.builder().id(1).user(testUser).gameId("genshin")
                .name("A").server("os_i").ar(60).wl("9").mcOption("").lastSyncedAt(Instant.now()).build();

        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of(cloud));

        ConflictCheckRequest req = new ConflictCheckRequest("genshin", List.of(
                new GameAccountBase("genshin", "1", "A", "os_i", 60, "9", ""),
                new GameAccountBase("genshin", "2", "B", "os_i", 1, "0", "")
        ));

        ConflictCheckResponse result = accountService.checkAccountsConflict(1, req.gameId(), req.accounts());

        assertTrue(result.hasConflict());
    }

    // --- resolveAccountsConflict ---

    @Test
    void resolveAccountsConflict_cloudResolution() {
        ConflictResolveResponse result = accountService.resolveAccountsConflict(
                1, "genshin", "cloud", List.of(), List.of());

        assertNotNull(result);
        assertTrue(result.message().contains("cloud"));
    }

    @Test
    void resolveAccountsConflict_localResolution() {
        when(gameAccountRepository.findByUserIdAndGameId(1, "genshin"))
                .thenReturn(List.of());
        when(userRepository.getReferenceById(1)).thenReturn(testUser);

        GameAccountBase fc = new GameAccountBase("genshin", "1", "A", "os_i", 60, "9", "");
        ConflictResolveRequest req = new ConflictResolveRequest("genshin", "local", List.of(fc), List.of());
        when(gameAccountRepository.saveAll(any())).thenAnswer(i -> {
            List<GameAccount> accounts = i.getArgument(0);
            AtomicInteger counter = new AtomicInteger(100);
            accounts.forEach(a -> { if (a.getId() == null) a.setId(counter.getAndIncrement()); });
            return accounts;
        });

        accountService.resolveAccountsConflict(1, req.gameId(), req.resolution(), req.localAccounts(), req.cloudAccounts());

        verify(gameAccountRepository).saveAll(any());
    }

    @Test
    void resolveAccountsConflict_invalidResolution_throws() {
        assertThrows(ResponseStatusException.class, () -> accountService.resolveAccountsConflict(
                1, "genshin", "invalid", List.of(), List.of()));
    }
}
