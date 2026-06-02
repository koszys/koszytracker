package moe.senti.wish.service;

import moe.senti.wish.model.entity.Wish;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class WishConflictService {

    private final WishService wishService;

    public WishConflictService(WishService wishService) {
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

        Map<String, Object> result = new HashMap<>();
        result.put("hasConflict", hasConflict);
        result.put("localCount", localCount);
        result.put("cloudCount", cloudCount);
        result.put("localModifiedAt", localModified);
        result.put("cloudModifiedAt", cloudModified);
        result.put("message", hasConflict ? "Conflict detected" : "Data is in sync");
        return result;
    }
}
