package moe.senti.wish.service;

import moe.senti.account.model.entity.GameAccount;
import moe.senti.account.repository.GameAccountRepository;
import moe.senti.auth.repository.UserRepository;
import moe.senti.wish.model.dto.WishData;
import moe.senti.wish.model.entity.Wish;
import moe.senti.wish.repository.WishRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class WishService {

    private final WishRepository wishRepository;
    private final GameAccountRepository gameAccountRepository;
    private final UserRepository userRepository;

    public WishService(WishRepository wishRepository,
                       GameAccountRepository gameAccountRepository,
                       UserRepository userRepository) {
        this.wishRepository = wishRepository;
        this.gameAccountRepository = gameAccountRepository;
        this.userRepository = userRepository;
    }

    public List<Wish> getWishesByAccount(Integer accountId) {
        return wishRepository.findByAccountId(accountId);
    }

    @Transactional
    public GameAccount getOrCreateGameAccount(Integer userId, String gameId, String uid,
                                              String server, String name) {
        Optional<GameAccount> existing = gameAccountRepository.findByGameIdAndUid(gameId, uid);
        if (existing.isPresent()) {
            GameAccount account = existing.get();
            if (!account.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account UID belongs to another user");
            }
            return account;
        }

        GameAccount account = GameAccount.builder()
                .user(userRepository.getReferenceById(userId))
                .gameId(gameId)
                .uid(uid)
                .server(server)
                .name(name)
                .ar(1)
                .wl("0")
                .mcOption("")
                .build();
        return gameAccountRepository.save(account);
    }

    @Transactional
    public int batchCreateWishes(List<Wish> wishes) {
        if (wishes.isEmpty()) return 0;

        int count = 0;
        for (Wish wish : wishes) {
            if (wishRepository.findByWishUid(wish.getWishUid()).isEmpty()) {
                wishRepository.save(wish);
                count++;
            }
        }
        wishRepository.flush();
        return count;
    }

    public List<Wish> getAllUserWishes(Integer userId, String gameId) {
        List<GameAccount> accounts = gameAccountRepository.findByUserIdAndGameId(userId, gameId);
        List<Integer> accountIds = accounts.stream().map(GameAccount::getId).toList();
        if (accountIds.isEmpty()) return List.of();
        return wishRepository.findByAccountIdIn(accountIds);
    }

    @Transactional
    public int resolveWishesConflict(Integer userId, String gameId, String resolution,
                                      List<Map<String, Object>> localWishes,
                                      List<Map<String, Object>> cloudWishMaps) {
        if ("cloud".equals(resolution)) {
            return cloudWishMaps.size();
        }

        List<GameAccount> accounts = gameAccountRepository.findByUserIdAndGameId(userId, gameId);
        if (accounts.isEmpty()) return 0;

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        if ("local".equals(resolution)) {
            int count = 0;
            for (Map<String, Object> wish : localWishes) {
                String wishUid = (String) wish.get("id");
                if (wishRepository.findByWishUid(wishUid).isEmpty()) {
                    Wish entity = buildWishFromMap(wish, accounts.get(0).getId(), formatter);
                    wishRepository.save(entity);
                    count++;
                }
            }
            wishRepository.flush();
            return count;
        }

        if ("merge".equals(resolution)) {
            Set<String> existingUids = wishRepository.findByAccountIdIn(
                    accounts.stream().map(GameAccount::getId).toList()
            ).stream().map(Wish::getWishUid).collect(Collectors.toSet());

            int count = 0;
            for (Map<String, Object> wish : localWishes) {
                String wishUid = (String) wish.get("id");
                if (!existingUids.contains(wishUid)) {
                    Wish entity = buildWishFromMap(wish, accounts.get(0).getId(), formatter);
                    wishRepository.save(entity);
                    count++;
                }
            }
            wishRepository.flush();
            return (int) existingUids.size() + count;
        }

        return 0;
    }

    public List<WishData> formatFrontendWishes(List<Map<String, Object>> rawWishes) {
        return rawWishes.stream().map(w -> {
            String uid = w.get("uid") != null ? (String) w.get("uid") : "";
            Object rankType = w.get("rank_type");
            int rarity = rankType instanceof Number ? ((Number) rankType).intValue() : 3;
            Object gachaType = w.get("gacha_type");
            int gt = gachaType instanceof Number ? ((Number) gachaType).intValue() : 0;
            return new WishData(
                    (String) w.get("id"),
                    uid,
                    (String) w.get("name"),
                    rarity,
                    gt,
                    (String) w.get("time")
            );
        }).toList();
    }

    private Wish buildWishFromMap(Map<String, Object> w, Integer accountId, DateTimeFormatter formatter) {
        Object rankType = w.get("rank_type");
        int rarity = rankType instanceof Number ? ((Number) rankType).intValue() : 3;
        Object gachaType = w.get("gacha_type");
        int gt = gachaType instanceof Number ? ((Number) gachaType).intValue() : 0;

        return Wish.builder()
                .wishUid((String) w.get("id"))
                .account(gameAccountRepository.getReferenceById(accountId))
                .gachaType(gt)
                .itemId(w.get("item_id") != null ? (String) w.get("item_id") : "")
                .itemName((String) w.get("name"))
                .rarity(rarity)
                .timestamp(LocalDateTime.parse((String) w.get("time"), formatter))
                .lastSyncedAt(Instant.now())
                .build();
    }
}
