package moe.senti.auth.model.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String email;

    private String name;

    private String picture;

    @Column(name = "created_at")
    private Instant createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<UserOAuth> oauthAccounts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<moe.senti.account.model.entity.GameAccount> gameAccounts;

    public User() {}

    public User(Integer id, String email, String name, String picture, Instant createdAt,
                List<UserOAuth> oauthAccounts, List<moe.senti.account.model.entity.GameAccount> gameAccounts) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.picture = picture;
        this.createdAt = createdAt;
        this.oauthAccounts = oauthAccounts;
        this.gameAccounts = gameAccounts;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPicture() { return picture; }
    public void setPicture(String picture) { this.picture = picture; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public List<UserOAuth> getOauthAccounts() { return oauthAccounts; }
    public void setOauthAccounts(List<UserOAuth> oauthAccounts) { this.oauthAccounts = oauthAccounts; }
    public List<moe.senti.account.model.entity.GameAccount> getGameAccounts() { return gameAccounts; }
    public void setGameAccounts(List<moe.senti.account.model.entity.GameAccount> gameAccounts) { this.gameAccounts = gameAccounts; }

    public static UserBuilder builder() { return new UserBuilder(); }

    public static class UserBuilder {
        private Integer id;
        private String email;
        private String name;
        private String picture;
        private Instant createdAt;
        private List<UserOAuth> oauthAccounts;
        private List<moe.senti.account.model.entity.GameAccount> gameAccounts;

        UserBuilder() {}

        public UserBuilder id(Integer id) { this.id = id; return this; }
        public UserBuilder email(String email) { this.email = email; return this; }
        public UserBuilder name(String name) { this.name = name; return this; }
        public UserBuilder picture(String picture) { this.picture = picture; return this; }
        public UserBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public UserBuilder oauthAccounts(List<UserOAuth> oauthAccounts) { this.oauthAccounts = oauthAccounts; return this; }
        public UserBuilder gameAccounts(List<moe.senti.account.model.entity.GameAccount> gameAccounts) { this.gameAccounts = gameAccounts; return this; }

        public User build() {
            return new User(id, email, name, picture, createdAt, oauthAccounts, gameAccounts);
        }
    }
}
