const NEWS_BASE = "https://min-api.cryptocompare.com/data/v2";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`News API error: ${res.status}`);
  const json = await res.json();
  return json.Data || json;
}

export default class NewsService {
  async getLatest(lang = "EN") {
    const url = `${NEWS_BASE}/news/?lang=${lang}`;
    return await fetchJson(url);
  }
}
