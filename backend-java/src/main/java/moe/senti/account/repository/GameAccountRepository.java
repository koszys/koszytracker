package moe.senti.account.repository;

import moe.senti.account.model.entity.GameAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GameAccountRepository extends JpaRepository<GameAccount, Integer> {
    List<GameAccount> findByUserIdAndGameId(Integer userId, String gameId);

    List<GameAccount> findByUserId(Integer userId);

    Optional<GameAccount> findByGameIdAndUid(String gameId, String uid);
}
