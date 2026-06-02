package moe.senti.auth.service;

import moe.senti.auth.model.entity.User;
import moe.senti.auth.model.entity.UserOAuth;
import moe.senti.auth.repository.UserOAuthRepository;
import moe.senti.auth.repository.UserRepository;
import moe.senti.core.jwt.JwtProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserOAuthRepository userOAuthRepository;
    private final JwtProvider jwtProvider;

    public AuthService(UserRepository userRepository,
                       UserOAuthRepository userOAuthRepository,
                       JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.userOAuthRepository = userOAuthRepository;
        this.jwtProvider = jwtProvider;
    }

    @Transactional
    public User getOrCreateUser(String provider, String providerUserId, String email, String name, String picture) {
        Optional<UserOAuth> existingOAuth = userOAuthRepository
                .findByProviderAndProviderUserId(provider, providerUserId);

        if (existingOAuth.isPresent()) {
            User user = existingOAuth.get().getUser();

            if (user == null) {
                userOAuthRepository.delete(existingOAuth.get());
                return getOrCreateUser(provider, providerUserId, email, name, picture);
            }

            if (!user.getEmail().equals(email)) {
                Optional<User> emailUser = userRepository.findByEmail(email);
                if (emailUser.isPresent() && !emailUser.get().getId().equals(user.getId())) {
                    User target = emailUser.get();
                    for (UserOAuth oa : user.getOauthAccounts()) {
                        oa.setUser(target);
                    }
                    for (moe.senti.account.model.entity.GameAccount ga : user.getGameAccounts()) {
                        ga.setUser(target);
                    }
                    user.getOauthAccounts().clear();
                    user.getGameAccounts().clear();
                    userRepository.delete(user);
                    user = target;
                } else {
                    user.setEmail(email);
                }
            }

            user.setName(name);
            user.setPicture(picture);
            return userRepository.save(user);
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user = existingUser.orElseGet(() -> userRepository.save(
                User.builder().email(email).name(name).picture(picture).build()
        ));

        UserOAuth newOAuth = UserOAuth.builder()
                .user(user)
                .provider(provider)
                .providerUserId(providerUserId)
                .build();
        userOAuthRepository.save(newOAuth);

        return user;
    }

    @Transactional(readOnly = true)
    public String generateToken(User user) {
        List<Map<String, String>> identities = user.getOauthAccounts().stream()
                .map(oa -> Map.of("provider", oa.getProvider()))
                .toList();

        return jwtProvider.generateToken(Map.of(
                "sub", String.valueOf(user.getId()),
                "email", user.getEmail(),
                "name", user.getName(),
                "picture", user.getPicture() != null ? user.getPicture() : "",
                "identities", identities
        ));
    }
}
