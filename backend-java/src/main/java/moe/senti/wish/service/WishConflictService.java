package moe.senti.wish.service;

import moe.senti.wish.model.entity.Wish;
import moe.senti.wish.repository.WishRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class WishConflictService {

    private final WishRepository wishRepository;
    private final WishService wishService;

    public WishConflictService(WishRepository wishRepository, WishService wishService) {
        this.wishRepository = wishRepository;
        this.wishService = wishService;
    }

    public Map<String, Object> checkConflict(Integer userId, String gameId, List<Map<String, Object>> localWishes) {
        List<Wish> cloudWishes = wishService.getAllUserWishes(userId, gameId);

        int localCount = localWishes.size();
        int cloudCount = cloudWishes.size();

        Instant localModified = localWishes.isEmpty() ? null : Instant.now();
        Instant cloudModified = cloudWishes.stream()
                .map(Wish::getLastSyncedAt)
                .filter(Objects::nonNull)
                .max(Instant::compareTo)
                .orElse(cloudWishes.isEmpty() ? null : Instant.now());

        boolean hasConflict = localCount != cloudCount;

        return Map.of(
                "hasConflict", hasConflict,
                "localCount", localCount,
                "cloudCount", cloudCount,
                "localModifiedAt", localModified,
                "cloudModifiedAt", cloudModified,
                "message", hasConflict ? "Conflict detected" : "Data is in sync"
        );
    }
}
