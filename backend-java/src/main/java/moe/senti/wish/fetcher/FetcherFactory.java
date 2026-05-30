package moe.senti.wish.fetcher;

import org.springframework.stereotype.Component;

@Component
public class FetcherFactory {

    private final GenshinFetcher genshinFetcher;

    public FetcherFactory(GenshinFetcher genshinFetcher) {
        this.genshinFetcher = genshinFetcher;
    }

    public Fetcher getFetcher(String gameId) {
        return switch (gameId) {
            case "genshin" -> genshinFetcher;
            default -> throw new IllegalArgumentException("No fetcher implemented for game_id: " + gameId);
        };
    }
}
