package moe.senti.wish.controller;

import io.github.bucket4j.Bucket;
import jakarta.validation.Valid;
import moe.senti.account.model.entity.GameAccount;
import moe.senti.account.repository.GameAccountRepository;
import moe.senti.core.util.AuthHelper;
import moe.senti.wish.fetcher.Fetcher;
import moe.senti.wish.fetcher.FetcherFactory;
import moe.senti.wish.model.dto.*;
import moe.senti.wish.model.entity.Wish;
import moe.senti.wish.service.WishConflictService;
import moe.senti.wish.service.WishService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/wishes")
public class WishController {

    private final WishService wishService;
    private final WishConflictService wishConflictService;
    private final GameAccountRepository gameAccountRepository;
    private final FetcherFactory fetcherFactory;
    private final AuthHelper authHelper;
    private final Bucket rateLimitBucket;

    public WishController(WishService wishService,
                        WishConflictService wishConflictService,
                        GameAccountRepository gameAccountRepository,
                        FetcherFactory fetcherFactory,
                        AuthHelper authHelper,
                        Bucket rateLimitBucket) {
        this.wishService = wishService;
        this.wishConflictService = wishConflictService;
        this.gameAccountRepository = gameAccountRepository;
        this.fetcherFactory = fetcherFactory;
        this.authHelper = authHelper;
        this.rateLimitBucket = rateLimitBucket;
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importWishes(@RequestBody @Valid ImportWishesRequest payload) {
        if (!rateLimitBucket.tryConsume(1)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("detail", "Rate limit exceeded. Try again later."));
        }

        Fetcher fetcher = fetcherFactory.getFetcher(payload.gameId());

        Map<String, Object> parsed = fetcher.parseUrl(payload.url());
        List<Map<String, Object>> allWishes = fetcher.fetchWishes(parsed);

        if (allWishes == null || allWishes.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("detail", "No wishes found"));
        }

        Optional<Integer> maybeUserId = authHelper.getCurrentUserId();
        int insertedCount = 0;

        if (maybeUserId.isPresent()) {
            Integer userId = maybeUserId.get();
            String gameUid = (String) allWishes.get(0).get("uid");
            if (gameUid != null) {
                String server = (String) allWishes.get(0).getOrDefault("server", "unknown");
                GameAccount account = wishService.getOrCreateGameAccount(
                        userId, payload.gameId(), gameUid, server, "Imported Account");

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                List<Wish> wishes = new ArrayList<>();
                for (Map<String, Object> w : allWishes) {
                    Object rankType = w.get("rank_type");
                    int rarity = rankType instanceof Number ? ((Number) rankType).intValue() : 3;
                    Object gachaType = w.get("gacha_type");
                    int gt = gachaType instanceof Number ? ((Number) gachaType).intValue() : 0;

                    wishes.add(Wish.builder()
                            .wishUid((String) w.get("id"))
                            .account(account)
                            .gachaType(gt)
                            .itemId(w.get("item_id") != null ? (String) w.get("item_id") : "")
                            .itemName((String) w.get("name"))
                            .rarity(rarity)
                            .timestamp(LocalDateTime.parse((String) w.get("time"), formatter))
                            .build());
                }
                insertedCount = wishService.batchCreateWishes(wishes);
            }
        }

        List<WishData> frontendWishes = wishService.formatFrontendWishes(allWishes);

        StringBuilder msg = new StringBuilder("Found " + allWishes.size() + " wishes.");
        if (maybeUserId.isPresent()) {
            msg.append(" ").append(insertedCount).append(" new wishes saved to cloud.");
        } else {
            msg.append(" Saved locally. Sign in to save to cloud.");
        }

        return ResponseEntity.ok(Map.of(
                "message", msg.toString(),
                "wishes", frontendWishes
        ));
    }

    @PostMapping("/sync")
    public Map<String, String> syncWishes(@RequestBody Map<String, Object> request) {
        Integer userId = authHelper.getRequiredUserId();
        String gameId = (String) request.get("game_id");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> wishes = (List<Map<String, Object>>) request.getOrDefault("wishes", List.of());

        if (wishes.isEmpty() || gameId == null) {
            return Map.of("message", "No wishes or game_id provided to sync.");
        }

        Map<String, List<Map<String, Object>>> wishesByUid = new HashMap<>();
        for (Map<String, Object> w : wishes) {
            String uid = (String) w.get("uid");
            if (uid != null) {
                wishesByUid.computeIfAbsent(uid, k -> new ArrayList<>()).add(w);
            }
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        int totalInserted = 0;

        for (Map.Entry<String, List<Map<String, Object>>> entry : wishesByUid.entrySet()) {
            GameAccount account = wishService.getOrCreateGameAccount(
                    userId, gameId, entry.getKey(), "unknown", "Synced Account");

            List<Wish> wishEntities = new ArrayList<>();
            for (Map<String, Object> w : entry.getValue()) {
                try {
                    Object rarityObj = w.get("rarity");
                    int rarity = rarityObj instanceof Number ? ((Number) rarityObj).intValue() : 3;
                    Object gachaTypeObj = w.get("gacha_type");
                    int gt = gachaTypeObj instanceof Number ? ((Number) gachaTypeObj).intValue() : 0;

                    wishEntities.add(Wish.builder()
                            .wishUid((String) w.get("id"))
                            .account(account)
                            .gachaType(gt)
                            .itemId("")
                            .itemName((String) w.get("name"))
                            .rarity(rarity)
                            .timestamp(LocalDateTime.parse((String) w.get("time"), formatter))
                            .build());
                } catch (Exception ignored) {
                }
            }

            if (!wishEntities.isEmpty()) {
                totalInserted += wishService.batchCreateWishes(wishEntities);
            }
        }

        return Map.of("message", "Synced " + totalInserted + " new wishes to cloud.");
    }

    @GetMapping("/{accountId}")
    public Map<String, List<Wish>> getWishes(@PathVariable Integer accountId) {
        Integer userId = authHelper.getRequiredUserId();

        GameAccount account = gameAccountRepository.findById(accountId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to view this account");
        }

        List<Wish> wishes = wishService.getWishesByAccount(accountId);
        return Map.of("wishes", wishes);
    }

    @PostMapping("/check-conflict")
    public Map<String, Object> checkConflict(@RequestBody @Valid WishesCheckConflictRequest request) {
        Integer userId = authHelper.getRequiredUserId();
        return wishConflictService.checkConflict(userId, request.gameId(), request.wishes());
    }

    @PostMapping("/resolve-conflict")
    public WishesResolveConflictResponse resolveConflict(
            @RequestBody @Valid WishesResolveConflictRequest request) {
        Integer userId = authHelper.getRequiredUserId();
        int count = wishService.resolveWishesConflict(
                userId, request.gameId(), request.resolution(),
                request.localWishes(), request.cloudWishes()
        );
        return new WishesResolveConflictResponse(
                count,
                "Resolved conflict using " + request.resolution() + " data"
        );
    }
}
