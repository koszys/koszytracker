package moe.senti.account.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import moe.senti.account.model.dto.*;
import moe.senti.account.service.AccountService;
import moe.senti.core.jwt.JwtProvider;
import moe.senti.core.util.AuthHelper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.boot.autoconfigure.security.oauth2.resource.servlet.OAuth2ResourceServerAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AccountController.class,
        excludeAutoConfiguration = {
                SecurityAutoConfiguration.class,
                SecurityFilterAutoConfiguration.class,
                OAuth2ClientAutoConfiguration.class,
                OAuth2ResourceServerAutoConfiguration.class,
                UserDetailsServiceAutoConfiguration.class
        })
@ActiveProfiles("test")
class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AccountService accountService;

    @MockitoBean
    private AuthHelper authHelper;

    @MockitoBean
    private JwtProvider jwtProvider;

    @Test
    void getAccounts_returnsList() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);
        when(accountService.getUserAccounts(1, null)).thenReturn(List.of(
                new GameAccountResponse(1, 1, "genshin", "123", "Test", "os_i", 60, "9", "", Instant.now())
        ));

        mockMvc.perform(get("/api/accounts"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].name").value("Test"));
    }

    @Test
    void getAccounts_withGameId_filters() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);
        when(accountService.getUserAccounts(1, "genshin")).thenReturn(List.of());

        mockMvc.perform(get("/api/accounts").param("gameId", "genshin"))
                .andExpect(status().isOk());
    }

    @Test
    void createAccount_returnsCreated() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);
        GameAccountCreate dto = new GameAccountCreate("genshin", "123", "Test", "os_i", 60, "9", "");
        when(accountService.createAccount(eq(1), any())).thenReturn(
                new GameAccountResponse(1, 1, "genshin", "123", "Test", "os_i", 60, "9", "", Instant.now())
        );

        mockMvc.perform(post("/api/accounts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test"));
    }

    @Test
    void updateAccount_returnsUpdated() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);
        GameAccountUpdate dto = new GameAccountUpdate("Updated", null, null, null, null);
        when(accountService.updateAccount(eq(1), eq(1), any())).thenReturn(
                new GameAccountResponse(1, 1, "genshin", "123", "Updated", "os_i", 60, "9", "", Instant.now())
        );

        mockMvc.perform(put("/api/accounts/{accountId}", 1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    void deleteAccount_succeeds() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);

        mockMvc.perform(delete("/api/accounts/{accountId}", 1))
                .andExpect(status().isOk());
    }

    @Test
    void syncAccounts_returnsSyncResponse() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);
        SyncAccountsRequest req = new SyncAccountsRequest("genshin", List.of(
                new GameAccountBase("genshin", "123", "Test", "os_i", 60, "9", "")
        ));
        when(accountService.syncAccounts(eq(1), any(), anyList())).thenReturn(
                new SyncAccountsResponse(List.of(), "Synced")
        );

        mockMvc.perform(post("/api/accounts/sync")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Synced"));
    }

    @Test
    void checkConflict_returnsResult() throws Exception {
        when(authHelper.getRequiredUserId()).thenReturn(1);
        ConflictCheckRequest req = new ConflictCheckRequest("genshin", List.of(
                new GameAccountBase("genshin", "123", "Test", "os_i", 60, "9", "")
        ));
        when(accountService.checkAccountsConflict(eq(1), any(), anyList())).thenReturn(
                new ConflictCheckResponse(false, null, null, List.of(), "No cloud data")
        );

        mockMvc.perform(post("/api/accounts/check-conflict")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("No cloud data"));
    }
}
