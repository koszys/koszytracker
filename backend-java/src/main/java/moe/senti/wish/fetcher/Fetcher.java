package moe.senti.wish.fetcher;

import java.util.List;
import java.util.Map;

public interface Fetcher {

    Map<String, Object> parseUrl(String url);

    List<Map<String, Object>> fetchWishes(Map<String, Object> parsedData);
}
