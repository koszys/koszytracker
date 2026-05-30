package moe.senti.auth.repository;

import moe.senti.auth.model.entity.UserOAuth;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserOAuthRepository extends JpaRepository<UserOAuth, Integer> {
    Optional<UserOAuth> findByProviderAndProviderUserId(String provider, String providerUserId);
}
