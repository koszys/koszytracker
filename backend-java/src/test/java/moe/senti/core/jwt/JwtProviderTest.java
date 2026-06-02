package moe.senti.core.jwt;

import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class JwtProviderTest {

    private JwtProvider jwtProvider;

    @BeforeEach
    void setUp() {
        jwtProvider = new JwtProvider("my-super-secret-key-that-is-at-least-32-chars!!", 7);
    }

    @Test
    void generateAndValidateToken_roundTrip() {
        Map<String, Object> claims = Map.of(
                "sub", "42",
                "email", "test@test.com",
                "name", "Tester",
                "picture", "https://example.com/pic.jpg"
        );

        String token = jwtProvider.generateToken(claims);
        assertNotNull(token);

        Claims parsed = jwtProvider.validateToken(token);
        assertEquals("42", parsed.getSubject());
        assertEquals("test@test.com", parsed.get("email"));
        assertEquals("Tester", parsed.get("name"));
    }

    @Test
    void getUserIdFromToken_returnsParsedInt() {
        String token = jwtProvider.generateToken(Map.of("sub", "123"));
        Integer userId = jwtProvider.getUserIdFromToken(token);
        assertEquals(123, userId);
    }

    @Test
    void validateToken_invalidToken_throws() {
        assertThrows(Exception.class, () -> jwtProvider.validateToken("invalid.jwt.token"));
    }

    @Test
    void validateToken_wrongSignature_throws() {
        JwtProvider otherProvider = new JwtProvider("another-completely-different-secret-key-here!!", 7);
        String token = otherProvider.generateToken(Map.of("sub", "1"));

        assertThrows(Exception.class, () -> jwtProvider.validateToken(token));
    }

    @Test
    void shortSecret_warnsButWorks() {
        JwtProvider shortSecret = new JwtProvider("short", 1);
        String token = shortSecret.generateToken(Map.of("sub", "1"));
        assertNotNull(token);
        Claims claims = shortSecret.validateToken(token);
        assertEquals("1", claims.getSubject());
    }
}
