package moe.senti.auth.service;

import moe.senti.auth.model.entity.User;
import moe.senti.auth.model.entity.UserOAuth;
import moe.senti.auth.repository.UserOAuthRepository;
import moe.senti.auth.repository.UserRepository;
import moe.senti.core.jwt.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private UserOAuthRepository userOAuthRepository;

    @Mock
    private JwtProvider jwtProvider;

    @Captor
    private ArgumentCaptor<User> userCaptor;

    @Captor
    private ArgumentCaptor<UserOAuth> oauthCaptor;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, userOAuthRepository, jwtProvider);
    }

    @Test
    void getOrCreateUser_existingOAuth_updatesUser() {
        User existingUser = User.builder().id(1).email("old@test.com").name("Old").picture("old.jpg").build();
        UserOAuth oauth = UserOAuth.builder().id(10).user(existingUser).provider("google").providerUserId("123").build();
        existingUser.setOauthAccounts(new ArrayList<>(List.of(oauth)));

        when(userOAuthRepository.findByProviderAndProviderUserId("google", "123"))
                .thenReturn(Optional.of(oauth));
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        User result = authService.getOrCreateUser("google", "123", "new@test.com", "New", "new.jpg");

        assertNotNull(result);
        assertEquals("New", result.getName());
        assertEquals("new.jpg", result.getPicture());
        assertEquals("new@test.com", result.getEmail());
        verify(userRepository).save(userCaptor.capture());
        assertEquals("New", userCaptor.getValue().getName());
    }

    @Test
    void getOrCreateUser_existingOAuth_emailConflict_mergesAccounts() {
        User oldUser = User.builder().id(1).email("old@test.com").name("Old").picture("old.jpg").build();
        User targetUser = User.builder().id(2).email("same@test.com").name("Target").picture("t.jpg").build();
        UserOAuth oauth = UserOAuth.builder().id(10).user(oldUser).provider("google").providerUserId("123").build();
        oldUser.setOauthAccounts(new ArrayList<>(List.of(oauth)));
        oldUser.setGameAccounts(new ArrayList<>());

        when(userOAuthRepository.findByProviderAndProviderUserId("google", "123"))
                .thenReturn(Optional.of(oauth));
        when(userRepository.findByEmail("same@test.com"))
                .thenReturn(Optional.of(targetUser));
        when(userRepository.save(any())).thenReturn(targetUser);

        User result = authService.getOrCreateUser("google", "123", "same@test.com", "New", "new.jpg");

        verify(userRepository).delete(oldUser);
        assertEquals(targetUser, result);
        assertTrue(oldUser.getOauthAccounts().isEmpty());
    }

    @Test
    void getOrCreateUser_staleOAuthWithNullUser_deletesAndRetries() {
        UserOAuth staleOAuth = UserOAuth.builder().id(10).user(null).provider("google").providerUserId("123").build();

        User freshUser = User.builder().id(1).email("fresh@test.com").name("Fresh").picture("f.jpg").build();
        freshUser.setOauthAccounts(new ArrayList<>());

        when(userOAuthRepository.findByProviderAndProviderUserId("google", "123"))
                .thenReturn(Optional.of(staleOAuth))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("fresh@test.com"))
                .thenReturn(Optional.empty());
        when(userRepository.save(any())).thenReturn(freshUser);

        User result = authService.getOrCreateUser("google", "123", "fresh@test.com", "Fresh", "f.jpg");

        assertNotNull(result);
        verify(userOAuthRepository).delete(staleOAuth);
        verify(userOAuthRepository, times(1)).save(any());
    }

    @Test
    void getOrCreateUser_newUser_createsUserAndOAuth() {
        when(userOAuthRepository.findByProviderAndProviderUserId("discord", "456"))
                .thenReturn(Optional.empty());
        when(userRepository.findByEmail("new@test.com"))
                .thenReturn(Optional.empty());

        User savedUser = User.builder().id(3).email("new@test.com").name("New").picture("p.jpg").build();
        when(userRepository.save(any())).thenReturn(savedUser);

        User result = authService.getOrCreateUser("discord", "456", "new@test.com", "New", "p.jpg");

        assertNotNull(result);
        assertEquals("new@test.com", result.getEmail());
        verify(userRepository).save(any());
        verify(userOAuthRepository).save(oauthCaptor.capture());
        assertEquals("discord", oauthCaptor.getValue().getProvider());
        assertEquals("456", oauthCaptor.getValue().getProviderUserId());
    }

    @SuppressWarnings("unchecked")
    @Test
    void generateToken_callsJwtProviderWithCorrectClaims() {
        UserOAuth oa1 = UserOAuth.builder().provider("google").build();
        UserOAuth oa2 = UserOAuth.builder().provider("discord").build();
        User user = User.builder()
                .id(5).email("u@test.com").name("U").picture("u.jpg")
                .oauthAccounts(List.of(oa1, oa2))
                .build();

        when(jwtProvider.generateToken(any())).thenReturn("mock-jwt");

        String token = authService.generateToken(user);

        assertEquals("mock-jwt", token);
        ArgumentCaptor<Map<String, Object>> claimsCaptor = ArgumentCaptor.forClass(Map.class);
        verify(jwtProvider).generateToken(claimsCaptor.capture());
        Map<String, Object> claims = claimsCaptor.getValue();
        assertEquals("5", claims.get("sub"));
        assertEquals("u@test.com", claims.get("email"));
        assertEquals("U", claims.get("name"));
        assertEquals("u.jpg", claims.get("picture"));
        assertInstanceOf(List.class, claims.get("identities"));
    }

    @SuppressWarnings("unchecked")
    @Test
    void generateToken_withNullPicture_sendsEmptyString() {
        User user = User.builder()
                .id(1).email("x@test.com").name("X").picture(null)
                .oauthAccounts(List.of())
                .build();

        when(jwtProvider.generateToken(any())).thenReturn("t");

        authService.generateToken(user);

        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(jwtProvider).generateToken(captor.capture());
        assertEquals("", captor.getValue().get("picture"));
    }
}
