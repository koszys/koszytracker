package moe.senti.auth.service;

import moe.senti.auth.model.entity.User;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final AuthService authService;

    public CustomOAuth2UserService(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = oauth2User.getAttributes();

        String providerUserId;
        String email;
        String name;
        String picture;

        if ("google".equals(registrationId)) {
            providerUserId = (String) attributes.get("sub");
            email = (String) attributes.get("email");
            name = (String) attributes.get("name");
            picture = (String) attributes.get("picture");
        } else if ("discord".equals(registrationId)) {
            providerUserId = (String) attributes.get("id");
            email = (String) attributes.get("email");
            if (email == null) {
                email = attributes.get("username") + "@discord";
            }
            name = (String) attributes.get("username");
            String avatar = (String) attributes.get("avatar");
            picture = "https://cdn.discordapp.com/avatars/" + providerUserId + "/" + avatar + ".png";
        } else {
            throw new OAuth2AuthenticationException("Unsupported provider: " + registrationId);
        }

        User user = authService.getOrCreateUser(registrationId, providerUserId, email, name, picture);
        String jwt = authService.generateToken(user);

        return new DefaultOAuth2User(
                oauth2User.getAuthorities(),
                Map.of(
                        "sub", String.valueOf(user.getId()),
                        "email", user.getEmail(),
                        "name", user.getName(),
                        "picture", user.getPicture() != null ? user.getPicture() : "",
                        "identities", user.getOauthAccounts().stream()
                                .map(oa -> Map.of("provider", oa.getProvider()))
                                .toList(),
                        "token", jwt
                ),
                "email"
        );
    }
}
