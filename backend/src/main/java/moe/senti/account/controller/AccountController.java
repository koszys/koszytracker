package moe.senti.account.controller;

import jakarta.validation.Valid;
import moe.senti.account.model.dto.*;
import moe.senti.account.service.AccountService;
import moe.senti.core.util.AuthHelper;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;
    private final AuthHelper authHelper;

    public AccountController(AccountService accountService, AuthHelper authHelper) {
        this.accountService = accountService;
        this.authHelper = authHelper;
    }

    @GetMapping
    public List<GameAccountResponse> getAccounts(
            @RequestParam(required = false) String gameId) {
        Integer userId = authHelper.getRequiredUserId();
        return accountService.getUserAccounts(userId, gameId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GameAccountResponse createAccount(@RequestBody @Valid GameAccountCreate dto) {
        Integer userId = authHelper.getRequiredUserId();
        return accountService.createAccount(userId, dto);
    }

    @PutMapping("/{accountId}")
    public GameAccountResponse updateAccount(
            @PathVariable Integer accountId,
            @RequestBody @Valid GameAccountUpdate dto) {
        Integer userId = authHelper.getRequiredUserId();
        return accountService.updateAccount(accountId, userId, dto);
    }

    @DeleteMapping("/{accountId}")
    public void deleteAccount(@PathVariable Integer accountId) {
        Integer userId = authHelper.getRequiredUserId();
        accountService.deleteAccount(accountId, userId);
    }

    @PostMapping("/sync")
    public SyncAccountsResponse syncAccounts(@RequestBody @Valid SyncAccountsRequest request) {
        Integer userId = authHelper.getRequiredUserId();
        return accountService.syncAccounts(userId, request.gameId(), request.accounts());
    }

    @PostMapping("/check-conflict")
    public ConflictCheckResponse checkConflict(@RequestBody @Valid ConflictCheckRequest request) {
        Integer userId = authHelper.getRequiredUserId();
        return accountService.checkAccountsConflict(userId, request.gameId(), request.accounts());
    }

    @PostMapping("/resolve-conflict")
    public ConflictResolveResponse resolveConflict(@RequestBody @Valid ConflictResolveRequest request) {
        Integer userId = authHelper.getRequiredUserId();
        return accountService.resolveAccountsConflict(
                userId, request.gameId(), request.resolution(),
                request.localAccounts(), request.cloudAccounts()
        );
    }
}
