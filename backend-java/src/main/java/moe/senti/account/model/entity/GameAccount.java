package moe.senti.account.model.entity;

import jakarta.persistence.*;
import moe.senti.auth.model.entity.User;
import moe.senti.wish.model.entity.Wish;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "game_accounts")
public class GameAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "game_id")
    private String gameId;

    private String uid;

    private String server;

    private String name;

    private Integer ar;

    private String wl;

    @Column(name = "mc_option")
    private String mcOption;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Wish> wishes;

    public GameAccount() {}

    public GameAccount(Integer id, User user, String gameId, String uid, String server, String name,
                       Integer ar, String wl, String mcOption, Instant lastSyncedAt, List<Wish> wishes) {
        this.id = id;
        this.user = user;
        this.gameId = gameId;
        this.uid = uid;
        this.server = server;
        this.name = name;
        this.ar = ar;
        this.wl = wl;
        this.mcOption = mcOption;
        this.lastSyncedAt = lastSyncedAt;
        this.wishes = wishes;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getGameId() { return gameId; }
    public void setGameId(String gameId) { this.gameId = gameId; }
    public String getUid() { return uid; }
    public void setUid(String uid) { this.uid = uid; }
    public String getServer() { return server; }
    public void setServer(String server) { this.server = server; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getAr() { return ar; }
    public void setAr(Integer ar) { this.ar = ar; }
    public String getWl() { return wl; }
    public void setWl(String wl) { this.wl = wl; }
    public String getMcOption() { return mcOption; }
    public void setMcOption(String mcOption) { this.mcOption = mcOption; }
    public Instant getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(Instant lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }
    public List<Wish> getWishes() { return wishes; }
    public void setWishes(List<Wish> wishes) { this.wishes = wishes; }

    public static GameAccountBuilder builder() { return new GameAccountBuilder(); }

    public static class GameAccountBuilder {
        private Integer id;
        private User user;
        private String gameId;
        private String uid;
        private String server;
        private String name;
        private Integer ar;
        private String wl;
        private String mcOption;
        private Instant lastSyncedAt;
        private List<Wish> wishes;

        GameAccountBuilder() {}

        public GameAccountBuilder id(Integer id) { this.id = id; return this; }
        public GameAccountBuilder user(User user) { this.user = user; return this; }
        public GameAccountBuilder gameId(String gameId) { this.gameId = gameId; return this; }
        public GameAccountBuilder uid(String uid) { this.uid = uid; return this; }
        public GameAccountBuilder server(String server) { this.server = server; return this; }
        public GameAccountBuilder name(String name) { this.name = name; return this; }
        public GameAccountBuilder ar(Integer ar) { this.ar = ar; return this; }
        public GameAccountBuilder wl(String wl) { this.wl = wl; return this; }
        public GameAccountBuilder mcOption(String mcOption) { this.mcOption = mcOption; return this; }
        public GameAccountBuilder lastSyncedAt(Instant lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; return this; }
        public GameAccountBuilder wishes(List<Wish> wishes) { this.wishes = wishes; return this; }

        public GameAccount build() {
            return new GameAccount(id, user, gameId, uid, server, name, ar, wl, mcOption, lastSyncedAt, wishes);
        }
    }
}
