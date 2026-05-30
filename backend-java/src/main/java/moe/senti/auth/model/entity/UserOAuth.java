package moe.senti.auth.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "user_oauth")
public class UserOAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String provider;

    @Column(name = "provider_user_id")
    private String providerUserId;

    public UserOAuth() {}

    public UserOAuth(Integer id, User user, String provider, String providerUserId) {
        this.id = id;
        this.user = user;
        this.provider = provider;
        this.providerUserId = providerUserId;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getProviderUserId() { return providerUserId; }
    public void setProviderUserId(String providerUserId) { this.providerUserId = providerUserId; }

    public static UserOAuthBuilder builder() { return new UserOAuthBuilder(); }

    public static class UserOAuthBuilder {
        private Integer id;
        private User user;
        private String provider;
        private String providerUserId;

        UserOAuthBuilder() {}

        public UserOAuthBuilder id(Integer id) { this.id = id; return this; }
        public UserOAuthBuilder user(User user) { this.user = user; return this; }
        public UserOAuthBuilder provider(String provider) { this.provider = provider; return this; }
        public UserOAuthBuilder providerUserId(String providerUserId) { this.providerUserId = providerUserId; return this; }

        public UserOAuth build() {
            return new UserOAuth(id, user, provider, providerUserId);
        }
    }
}
