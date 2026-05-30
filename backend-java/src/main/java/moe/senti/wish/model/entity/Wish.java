package moe.senti.wish.model.entity;

import jakarta.persistence.*;
import moe.senti.account.model.entity.GameAccount;
import java.time.Instant;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishes")
public class Wish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "wish_uid", unique = true)
    private String wishUid;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private GameAccount account;

    @Column(name = "gacha_type")
    private Integer gachaType;

    @Column(name = "item_id")
    private String itemId;

    @Column(name = "item_name")
    private String itemName;

    private Integer rarity;

    private LocalDateTime timestamp;

    @Column(name = "banner_id")
    private String bannerId;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    public Wish() {}

    public Wish(Integer id, String wishUid, GameAccount account, Integer gachaType, String itemId,
                String itemName, Integer rarity, LocalDateTime timestamp, String bannerId, Instant lastSyncedAt) {
        this.id = id;
        this.wishUid = wishUid;
        this.account = account;
        this.gachaType = gachaType;
        this.itemId = itemId;
        this.itemName = itemName;
        this.rarity = rarity;
        this.timestamp = timestamp;
        this.bannerId = bannerId;
        this.lastSyncedAt = lastSyncedAt;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getWishUid() { return wishUid; }
    public void setWishUid(String wishUid) { this.wishUid = wishUid; }
    public GameAccount getAccount() { return account; }
    public void setAccount(GameAccount account) { this.account = account; }
    public Integer getGachaType() { return gachaType; }
    public void setGachaType(Integer gachaType) { this.gachaType = gachaType; }
    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }
    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }
    public Integer getRarity() { return rarity; }
    public void setRarity(Integer rarity) { this.rarity = rarity; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    public String getBannerId() { return bannerId; }
    public void setBannerId(String bannerId) { this.bannerId = bannerId; }
    public Instant getLastSyncedAt() { return lastSyncedAt; }
    public void setLastSyncedAt(Instant lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; }

    public static WishBuilder builder() { return new WishBuilder(); }

    public static class WishBuilder {
        private Integer id;
        private String wishUid;
        private GameAccount account;
        private Integer gachaType;
        private String itemId;
        private String itemName;
        private Integer rarity;
        private LocalDateTime timestamp;
        private String bannerId;
        private Instant lastSyncedAt;

        WishBuilder() {}

        public WishBuilder id(Integer id) { this.id = id; return this; }
        public WishBuilder wishUid(String wishUid) { this.wishUid = wishUid; return this; }
        public WishBuilder account(GameAccount account) { this.account = account; return this; }
        public WishBuilder gachaType(Integer gachaType) { this.gachaType = gachaType; return this; }
        public WishBuilder itemId(String itemId) { this.itemId = itemId; return this; }
        public WishBuilder itemName(String itemName) { this.itemName = itemName; return this; }
        public WishBuilder rarity(Integer rarity) { this.rarity = rarity; return this; }
        public WishBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
        public WishBuilder bannerId(String bannerId) { this.bannerId = bannerId; return this; }
        public WishBuilder lastSyncedAt(Instant lastSyncedAt) { this.lastSyncedAt = lastSyncedAt; return this; }

        public Wish build() {
            return new Wish(id, wishUid, account, gachaType, itemId, itemName, rarity, timestamp, bannerId, lastSyncedAt);
        }
    }
}
