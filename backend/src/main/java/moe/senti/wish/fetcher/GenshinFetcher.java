package moe.senti.wish.fetcher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class GenshinFetcher implements Fetcher {

    private static final Logger log = LoggerFactory.getLogger(GenshinFetcher.class);

    private final WebClient webClient;

    private static final Map<Integer, String> GACHA_TYPES = Map.of(
            301, "Character Event Wish",
            302, "Weapon Event Wish",
            303, "Standard Wish",
            304, "Chronicled Wish"
    );

    public GenshinFetcher(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public Map<String, Object> parseUrl(String url) {
        URI uri = URI.create(url);
        Map<String, String> queryParams = UriComponentsBuilder.fromUri(uri)
                .build()
                .getQueryParams()
                .toSingleValueMap();

        if (!queryParams.containsKey("authkey")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid wish URL: missing authkey");
        }

        String gameBiz = queryParams.getOrDefault("game_biz", "hk4e_global");
        String server;
        String apiHost;

        if ("hk4e_cn".equals(gameBiz)) {
            server = "cn";
            apiHost = "public-operation-hk4e.mihoyo.com";
        } else {
            server = "os_i";
            apiHost = "public-operation-hk4e-sg.hoyoverse.com";
        }

        String authkey = queryParams.get("authkey");
        int authkeyVer = Integer.parseInt(queryParams.getOrDefault("authkey_ver", "1"));

        Map<String, Object> result = new HashMap<>();
        result.put("authkey", authkey);
        result.put("authkey_ver", authkeyVer);
        result.put("game_biz", gameBiz);
        result.put("server", server);
        result.put("api_host", apiHost);
        return result;
    }

    @Override
    public List<Map<String, Object>> fetchWishes(Map<String, Object> parsedData) {
        String apiHost = (String) parsedData.get("api_host");
        String authkey = (String) parsedData.get("authkey");
        int authkeyVer = (int) parsedData.get("authkey_ver");
        String server = (String) parsedData.get("server");

        List<Map<String, Object>> allWishes = new ArrayList<>();

        for (int gachaType : GACHA_TYPES.keySet()) {
            try {
                List<Map<String, Object>> wishes = fetchGachaType(apiHost, authkey, authkeyVer, gachaType);
                for (Map<String, Object> w : wishes) {
                    w.put("gacha_type", gachaType);
                    w.put("server", server);
                }
                allWishes.addAll(wishes);
            } catch (Exception e) {
                log.error("Error fetching gacha_type {}: {}", gachaType, e.getMessage(), e);
            }
        }

        return allWishes;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> fetchGachaType(String apiHost, String authkey,
                                                      int authkeyVer, int gachaType) {
        String url = "https://" + apiHost + "/gacha_info/api/getGachaLog";

        try {
            Map<String, Object> response = webClient.get()
                    .uri(uri -> uri
                            .scheme("https")
                            .host(apiHost)
                            .path("/gacha_info/api/getGachaLog")
                            .queryParam("authkey", authkey)
                            .queryParam("authkey_ver", authkeyVer)
                            .queryParam("gacha_type", gachaType)
                            .queryParam("lang", "en")
                            .queryParam("size", 20)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) return List.of();

            int retcode = (int) response.getOrDefault("retcode", -1);
            if (retcode != 0) {
                log.warn("Non-zero retcode for gacha_type {}: {}", gachaType, response.get("message"));
                return List.of();
            }

            Map<String, Object> data = (Map<String, Object>) response.get("data");
            if (data == null) return List.of();

            return (List<Map<String, Object>>) data.getOrDefault("list", List.of());
        } catch (Exception e) {
            log.error("Exception for gacha_type {}: {}", gachaType, e.getMessage(), e);
            return List.of();
        }
    }
}
