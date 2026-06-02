package moe.senti.wish.repository;

import moe.senti.wish.model.entity.Wish;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishRepository extends JpaRepository<Wish, Integer> {
    List<Wish> findByAccountId(Integer accountId);

    List<Wish> findByAccountIdIn(List<Integer> accountIds);

    Optional<Wish> findByWishUid(String wishUid);
}
