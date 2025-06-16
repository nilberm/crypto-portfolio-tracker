const BASE_URL = "https://api.coingecko.com/api/v3";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return await response.json();
}

export default class ExternalServices {
  constructor() {
    this.baseUrl = BASE_URL;
  }

  async searchCoins(query) {
    if (!query) return [];
    const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}`;
    const data = await fetchJson(url);
    return data.coins;
  }

  async getCoinDetails(id) {
    const url = `${this.baseUrl}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    return await fetchJson(url);
  }

  async getMarketChart(id, days = 7, currency = "usd") {
    const url = `${this.baseUrl}/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`;
    return await fetchJson(url);
  }

  async getTopCoins(currency = "usd", perPage = 10, page = 1) {
    const url = `${this.baseUrl}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=true&price_change_percentage=24h`;
    return await fetchJson(url);
  }
}
