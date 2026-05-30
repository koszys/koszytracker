package moe.senti.account.service;

import moe.senti.account.model.dto.*;
import moe.senti.account.model.entity.GameAccount;
import moe.senti.account.repository.GameAccountRepository;
import moe.senti.auth.model.entity.User;
import moe.senti.auth.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AccountService {

    private final GameAccountRepository gameAccountRepository;
    private final UserRepository userRepository;

    public AccountService(GameAccountRepository gameAccountRepository,
                          UserRepository userRepository) {
        this.gameAccountRepository = gameAccountRepository;
        this.userRepository = userRepository;
    }

    public List<GameAccountResponse> getUserAccounts(Integer userId, String gameId) {
        List<GameAccount> accounts;
        if (gameId != null && !gameId.isBlank()) {
            accounts = gameAccountRepository.findByUserIdAndGameId(userId, gameId);
        } else {
            accounts = gameAccountRepository.findByUserId(userId);
        }
        return accounts.stream().map(this::toResponse).toList();
    }

    public GameAccountResponse getAccountById(Integer accountId, Integer userId) {
        GameAccount account = findOwnedAccount(accountId, userId);
        return toResponse(account);
    }

    @Transactional
    public GameAccountResponse createAccount(Integer userId, GameAccountCreate dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        GameAccount account = GameAccount.builder()
                .user(user)
                .gameId(dto.gameId())
                .uid(dto.uid())
                .name(dto.name())
                .server(dto.server())
                .ar(dto.ar())
                .wl(dto.wl() != null ? dto.wl() : "0")
                .mcOption(dto.mcOption() != null ? dto.mcOption() : "")
                .build();

        account = gameAccountRepository.save(account);
        return toResponse(account);
    }

    @Transactional
    public GameAccountResponse updateAccount(Integer accountId, Integer userId, GameAccountUpdate dto) {
        GameAccount account = findOwnedAccount(accountId, userId);

        if (dto.name() != null) account.setName(dto.name());
        if (dto.server() != null) account.setServer(dto.server());
        if (dto.ar() != null) account.setAr(dto.ar());
        if (dto.wl() != null) account.setWl(dto.wl());
        if (dto.mcOption() != null) account.setMcOption(dto.mcOption());

        account = gameAccountRepository.save(account);
        return toResponse(account);
    }

    @Transactional
    public void deleteAccount(Integer accountId, Integer userId) {
        GameAccount account = findOwnedAccount(accountId, userId);
        gameAccountRepository.delete(account);
    }

    @Transactional
    public SyncAccountsResponse syncAccounts(Integer userId, String gameId, List<GameAccountBase> frontendAccounts) {
        List<GameAccount> existingAccounts = gameAccountRepository.findByUserIdAndGameId(userId, gameId);

        Map<String, GameAccount> existingByUid = existingAccounts.stream()
                .filter(a -> a.getUid() != null && !a.getUid().isBlank())
                .collect(Collectors.toMap(GameAccount::getUid, a -> a, (a, b) -> a));

        Map<String, GameAccount> existingByNameServer = existingAccounts.stream()
                .filter(a -> a.getUid() == null || a.getUid().isBlank())
                .collect(Collectors.toMap(
                        a -> (a.getName().toLowerCase() + "|" + a.getServer().toLowerCase()).intern(),
                        a -> a, (a, b) -> a));

        List<GameAccount> resultAccounts = new ArrayList<>();
        Set<Integer> matchedIds = new HashSet<>();

        for (GameAccountBase fc : frontendAccounts) {
            GameAccount matched = null;

            if (fc.uid() != null && !fc.uid().isBlank() && existingByUid.containsKey(fc.uid())) {
                matched = existingByUid.get(fc.uid());
            } else {
                String key = (fc.name().toLowerCase() + "|" + fc.server().toLowerCase()).intern();
                if (existingByNameServer.containsKey(key)) {
                    matched = existingByNameServer.get(key);
                }
            }

            if (matched != null) {
                matchedIds.add(matched.getId());
                matched.setName(fc.name());
                matched.setServer(fc.server());
                matched.setAr(fc.ar());
                matched.setWl(fc.wl() != null ? fc.wl() : "0");
                matched.setMcOption(fc.mcOption() != null ? fc.mcOption() : "");
                resultAccounts.add(matched);
            } else {
                User user = userRepository.getReferenceById(userId);
                GameAccount newAccount = GameAccount.builder()
                        .user(user)
                        .gameId(gameId)
                        .uid(fc.uid() != null && !fc.uid().isBlank() ? fc.uid() : null)
                        .name(fc.name())
                        .server(fc.server())
                        .ar(fc.ar())
                        .wl(fc.wl() != null ? fc.wl() : "0")
                        .mcOption(fc.mcOption() != null ? fc.mcOption() : "")
                        .build();
                resultAccounts.add(newAccount);
            }
        }

        for (GameAccount existing : existingAccounts) {
            if (!matchedIds.contains(existing.getId())) {
                gameAccountRepository.delete(existing);
            }
        }

        gameAccountRepository.saveAll(resultAccounts);
        gameAccountRepository.flush();

        List<GameAccountResponse> responses = resultAccounts.stream()
                .map(this::toResponse)
                .toList();

        return new SyncAccountsResponse(responses, "Synced " + responses.size() + " accounts");
    }

    public ConflictCheckResponse checkAccountsConflict(Integer userId, String gameId, List<GameAccountBase> localAccounts) {
        List<GameAccount> cloudAccounts = gameAccountRepository.findByUserIdAndGameId(userId, gameId);

        if (cloudAccounts.isEmpty()) {
            return new ConflictCheckResponse(false, null, null, List.of(), "No cloud data - will use local");
        }

        Map<String, GameAccountBase> localMap = localAccounts.stream()
                .filter(a -> a.name() != null && a.server() != null)
                .collect(Collectors.toMap(
                        a -> (a.name().toLowerCase() + "|" + a.server().toLowerCase()).intern(),
                        a -> a, (a, b) -> a));

        Map<String, GameAccount> cloudMap = cloudAccounts.stream()
                .collect(Collectors.toMap(
                        a -> (a.getName().toLowerCase() + "|" + a.getServer().toLowerCase()).intern(),
                        a -> a, (a, b) -> a));

        Instant localModified = localAccounts.isEmpty() ? null : Instant.now();
        Instant cloudModified = cloudAccounts.stream()
                .map(GameAccount::getLastSyncedAt)
                .filter(Objects::nonNull)
                .max(Instant::compareTo)
                .orElse(cloudAccounts.isEmpty() ? null : Instant.now());

        boolean hasConflict;
        if (localAccounts.size() != cloudAccounts.size()) {
            hasConflict = true;
        } else {
            hasConflict = localMap.entrySet().stream().anyMatch(entry -> {
                GameAccount cloudAcc = cloudMap.get(entry.getKey());
                if (cloudAcc == null) return true;
                GameAccountBase localAcc = entry.getValue();
                return !Objects.equals(localAcc.ar(), cloudAcc.getAr())
                        || !Objects.equals(localAcc.wl(), cloudAcc.getWl())
                        || !Objects.equals(localAcc.mcOption(), cloudAcc.getMcOption());
            });
        }

        List<GameAccountResponse> cloudResponses = cloudAccounts.stream().map(this::toResponse).toList();

        return new ConflictCheckResponse(
                hasConflict, localModified, cloudModified,
                cloudResponses,
                hasConflict ? "Conflict detected" : "Data is in sync"
        );
    }

    @Transactional
    public ConflictResolveResponse resolveAccountsConflict(Integer userId, String gameId, String resolution,
                                                            List<GameAccountBase> localAccounts,
                                                            List<GameAccountResponse> cloudAccountResponses) {
        if ("cloud".equals(resolution)) {
            return new ConflictResolveResponse(cloudAccountResponses, "Resolved conflict using cloud data");
        }

        List<GameAccount> cloudAccounts = gameAccountRepository.findByUserIdAndGameId(userId, gameId);
        Map<String, GameAccount> cloudByUid = cloudAccounts.stream()
                .filter(a -> a.getUid() != null && !a.getUid().isBlank())
                .collect(Collectors.toMap(GameAccount::getUid, a -> a, (a, b) -> a));
        Map<String, GameAccount> cloudByNameServer = cloudAccounts.stream()
                .filter(a -> a.getUid() == null || a.getUid().isBlank())
                .collect(Collectors.toMap(
                        a -> (a.getName().toLowerCase() + "|" + a.getServer().toLowerCase()).intern(),
                        a -> a, (a, b) -> a));

        List<GameAccountResponse> resultResponses;

        if ("local".equals(resolution)) {
            SyncAccountsResponse syncResult = syncAccounts(userId, gameId, localAccounts);
            resultResponses = syncResult.accounts();
        } else if ("merge".equals(resolution)) {
            List<GameAccount> merged = new ArrayList<>(cloudAccounts);
            Set<Integer> existingIds = cloudAccounts.stream().map(GameAccount::getId).collect(Collectors.toSet());
            User user = userRepository.getReferenceById(userId);

            for (GameAccountBase localAcc : localAccounts) {
                boolean isDuplicate = false;
                if (localAcc.uid() != null && !localAcc.uid().isBlank() && cloudByUid.containsKey(localAcc.uid())) {
                    isDuplicate = true;
                } else {
                    String key = (localAcc.name().toLowerCase() + "|" + localAcc.server().toLowerCase()).intern();
                    if (cloudByNameServer.containsKey(key)) {
                        isDuplicate = true;
                    }
                }

                if (!isDuplicate) {
                    GameAccount newAccount = GameAccount.builder()
                            .user(user)
                            .gameId(gameId)
                            .uid(localAcc.uid())
                            .name(localAcc.name())
                            .server(localAcc.server())
                            .ar(localAcc.ar())
                            .wl(localAcc.wl() != null ? localAcc.wl() : "0")
                            .mcOption(localAcc.mcOption() != null ? localAcc.mcOption() : "")
                            .build();
                    gameAccountRepository.save(newAccount);
                    merged.add(newAccount);
                }
            }

            resultResponses = merged.stream().map(this::toResponse).toList();
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid resolution: " + resolution);
        }

        Instant now = Instant.now();
        for (GameAccountResponse acc : resultResponses) {
            gameAccountRepository.findById(acc.id()).ifPresent(a -> {
                a.setLastSyncedAt(now);
                gameAccountRepository.save(a);
            });
        }

        return new ConflictResolveResponse(resultResponses, "Resolved conflict using " + resolution + " data");
    }

    private GameAccount findOwnedAccount(Integer accountId, Integer userId) {
        GameAccount account = gameAccountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        if (!account.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized");
        }
        return account;
    }

    private GameAccountResponse toResponse(GameAccount account) {
        return new GameAccountResponse(
                account.getId(),
                account.getUser().getId(),
                account.getGameId(),
                account.getUid(),
                account.getName(),
                account.getServer(),
                account.getAr() != null ? account.getAr() : 1,
                account.getWl() != null ? account.getWl() : "0",
                account.getMcOption() != null ? account.getMcOption() : "",
                account.getLastSyncedAt()
        );
    }
}
