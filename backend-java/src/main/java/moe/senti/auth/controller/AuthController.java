package moe.senti.auth.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @GetMapping("/google")
    public RedirectView loginGoogle() {
        return new RedirectView("/oauth2/authorization/google");
    }

    @GetMapping("/discord")
    public RedirectView loginDiscord() {
        return new RedirectView("/oauth2/authorization/discord");
    }
}
