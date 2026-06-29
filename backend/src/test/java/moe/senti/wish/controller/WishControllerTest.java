package moe.senti.wish.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.Bucket;
import moe.senti.account.model.entity.GameAccount;
import moe.senti.account.repository.GameAccountRepository;
import moe.senti.auth.model.entity.User;
import moe.senti.core.jwt.JwtProvider;
import moe.senti.core.util.AuthHelper;
import moe.senti.wish.fetcher.Fetcher;
import moe.senti.wish.fetcher.FetcherFactory;
import moe.senti.wish.model.dto.ImportWishesRequest;
import moe.senti.wish.model.dto.WishesCheckConflictRequest;
import moe.senti.wish.model.dto.WishesResolveConflictRequest;
import moe.senti.wish.service.WishConflictService;
import moe.senti.wish.service.WishService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientWebSecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = WishController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class,
                OAuth2ClientWebSecurityAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class,
                UserDetailsServiceAutoConfiguration.class
        })
@ActiveProfiles("test")
class WishControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private WishService wishService;

    @MockitoBean
    private WishConflictService wishConflictService;

    @MockitoBean
    private GameAccountRepository gameAccountRepository;

    @MockitoBean
    private FetcherFactory fetcherFactory;

    @MockitoBean
    private AuthHelper authHelper;

    @MockitoBean
    private Bucket rateLimitBucket;

    @MockitoBean
    private JwtProvider jwtProvider;

    @Test
    void importWishes_rateLimited_returns429() throws Exception {
        when(rateLimitBucket.tryConsume(1)).thenReturn(false);

        ImportWishesRequest req = new ImportWishesRequest("https://example.com", "genshin", null);

        mockMvc.perform(post("/api/wishes/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.detail").value("Rate limit exceeded. Try again later."));
    }

    @Test
    void importWishes_noWishes_returns400() throws Exception {
        when(rateLimitBucket.tryConsume(1)).thenReturn(true);
        Fetcher mockFetcher = org.mockito.Mockito.mock(Fetcher.class);
        when(fetcherFactory.getFetcher("genshin")).thenReturn(mockFetcher);
        when(mockFetcher.parseUrl(anyString())).thenReturn(Map.of());
        when(mockFetcher.fetchWishes(any())).thenReturn(List.of());

        ImportWishesRequest req = new ImportWishesRequest("https://example.com", "genshin", null);

        mockMvc.perform(post("/api/wishes/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("No wishes found"));
    }

    @Test
    void importWishes_success_returnsWishes() throws Exception {
        when(rateLimitBucket.tryConsume(1)).thenReturn(true);
        when(authHelper.getCurrentUserId()).thenReturn(Optional.empty());

        Fetcher mockFetcher = org.mockito.Mockito.mock(Fetcher.class);
        when(fetcherFactory.getFetcher("genshin")).thenReturn(mockFetcher);
        when(mockFetcher.parseUrl(anyString())).thenReturn(Map.of());
        when(mockFetcher.fetchWishes(any())).thenReturn(List.of(
                Map.of("id", "w-1", "uid", "123", "name", "Sword", "rank_type", 5, "gacha_type", 301, "time", "2026-01-01 12:00:00")
        ));

        when(wishService.formatFrontendWishes(anyList())).thenReturn(List.of());

        ImportWishesRequest req = new ImportWishesRequest("https://example.com", "genshin", null);

        mockMvc.perform(post("/api/wishes/import")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    void getWishes_accountNotFound_returns404() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);
        when(gameAccountRepository.findById(99)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/wishes/{accountId}", 99))
                .andExpect(status().isNotFound());
    }

    @Test
    void getWishes_notAuthorized_returns403() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(2);
        GameAccount account = GameAccount.builder().id(1).build();
        account.setUser(User.builder().id(1).build());
        when(gameAccountRepository.findById(1)).thenReturn(Optional.of(account));

        mockMvc.perform(get("/api/wishes/{accountId}", 1))
                .andExpect(status().isForbidden());
    }

    @Test
    void checkConflict_returnsResult() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);
        when(wishConflictService.checkConflict(anyInt(), anyString(), anyList()))
                .thenReturn(Map.of("hasConflict", false, "message", "Data is in sync"));

        WishesCheckConflictRequest req = new WishesCheckConflictRequest("genshin", List.of());

        mockMvc.perform(post("/api/wishes/check-conflict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Data is in sync"));
    }

    @Test
    void resolveConflict_returnsResult() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);
        when(wishService.resolveWishesConflict(anyInt(), anyString(), anyString(), anyList(), anyList()))
                .thenReturn(5);

        WishesResolveConflictRequest req = new WishesResolveConflictRequest("genshin", "local", List.of(), List.of());

        mockMvc.perform(post("/api/wishes/resolve-conflict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count").value(5));
    }
}
