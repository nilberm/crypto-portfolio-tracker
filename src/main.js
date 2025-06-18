import ExternalServices from "./modules/ExternalServices.js";
import NewsService from "./modules/NewsService.js";
import Portfolio from "./modules/Portfolio.js";
import { getParam } from "./modules/utils.js";
import Chart from "chart.js/auto";

console.log("App initialized");

const service = new ExternalServices();

/** ────── MODAL ────── */
function initModal() {
  const modal = document.getElementById("modal");
  const modalClose = document.getElementById("modal-close");
  if (modal && modalClose) {
    modalClose.addEventListener("click", () => modal.classList.add("hidden"));
  }
}

/** ────── SEARCH ────── */
function renderSearchResults(coins) {
  const container = document.getElementById("search-results-container");
  if (!container) return;

  if (!coins.length) {
    container.innerHTML = `<p class="no-results">No results found</p>`;
    return;
  }

  container.innerHTML = coins
    .map(
      (c) => `
      <div class="search-result-item" data-id="${c.id}">
        <img src="${c.thumb}" alt="${c.name}" width="24" height="24"/>
        <span>${c.name} (${c.symbol.toUpperCase()})</span>
      </div>
    `
    )
    .join("");

  container.querySelectorAll(".search-result-item").forEach((el) =>
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      window.location.href = `coin-detail.html?id=${encodeURIComponent(id)}`;
    })
  );
}

function initSearch() {
  const input = document.getElementById("coin-search");
  const container = document.getElementById("search-results-container");
  if (!input || !container) return;

  let debounceTimer;
  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const term = e.target.value.trim();

    debounceTimer = setTimeout(async () => {
      if (!term) {
        container.innerHTML = "";
        return;
      }
      try {
        const coins = await service.searchCoins(term);
        renderSearchResults(coins.slice(0, 25));
      } catch (err) {
        console.error("Search error:", err);
        container.innerHTML = `<p class="error">Failed to load results</p>`;
      }
    }, 300);
  });
}

/** ────── COIN DETAIL ────── */
function renderCoinInfo(data) {
  document.getElementById("coin-name").textContent = data.name;
  const imgEl = document.getElementById("coin-image");
  imgEl.src = data.image.large;
  imgEl.alt = data.name;
  document.getElementById(
    "coin-price"
  ).textContent = `$${data.market_data.current_price.usd.toLocaleString()}`;

  const changeEl = document.getElementById("coin-change");
  const change = data.market_data.price_change_percentage_24h;
  changeEl.textContent = `${change.toFixed(2)}%`;
  changeEl.classList.add(change >= 0 ? "text-success" : "text-danger");
}

async function renderPriceChart(id) {
  const chartData = await service.getMarketChart(id, 7, "usd");
  const ctx = document.getElementById("price-chart").getContext("2d");
  new Chart(ctx, {
    type: "line",
    data: {
      labels: chartData.prices.map((p) => {
        const d = new Date(p[0]);
        return `${d.getMonth() + 1}/${d.getDate()}`;
      }),
      datasets: [
        {
          label: "Price (USD)",
          data: chartData.prices.map((p) => p[1]),
          fill: false,
          borderColor: "#00D1B2",
          tension: 0.1,
        },
      ],
    },
    options: {
      scales: {
        x: { ticks: { color: "#CCCCCC" } },
        y: { ticks: { color: "#CCCCCC" } },
      },
      plugins: { legend: { labels: { color: "#FFFFFF" } } },
    },
  });
}

function bindAddToPortfolio(data) {
  const form = document.getElementById("purchase-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const amount = parseFloat(document.getElementById("purchase-amount").value);
    const buyPrice = parseFloat(
      document.getElementById("purchase-price").value
    );
    const currentPrice = data.market_data.current_price.usd;

    const portfolioItem = {
      id: data.id,
      name: data.name,
      amount,
      buyPrice,
      currentPrice,
    };

    const portfolio = JSON.parse(localStorage.getItem("portfolio") || "[]");
    portfolio.push(portfolioItem);
    localStorage.setItem("portfolio", JSON.stringify(portfolio));

    alert(
      `${data.name} added to portfolio!\n` +
        `Amount: ${amount}\n` +
        `Buy Price: $${buyPrice.toFixed(2)}\n` +
        `Current Price: $${currentPrice.toFixed(2)}`
    );
    form.reset();
  });
}

async function initCoinDetail() {
  const id = getParam("id");
  if (!id) return;

  try {
    const data = await service.getCoinDetails(id);
    renderCoinInfo(data);
    await renderPriceChart(id);
    bindAddToPortfolio({ id, ...data });
  } catch (err) {
    console.error("Detail load error:", err);
  }
}

/** ────── PORTFOLIO ────── */
async function initPortfolio() {
  const summaryEl = document.getElementById("portfolio-summary");
  const tbody = document.querySelector("#portfolio-list tbody");
  if (!summaryEl || !tbody) return;

  const portfolio = new Portfolio(
    service,
    "#portfolio-summary",
    "#portfolio-list tbody"
  );
  await portfolio.init();
}

/** ────── News ────── */
async function renderNews() {
  const svc = new NewsService();
  let items = [];
  try {
    items = await svc.getLatest();
  } catch (err) {
    console.error("News load error:", err);
    document.getElementById(
      "news-container"
    ).innerHTML = `<p class="error">Failed to load news</p>`;
    return;
  }

  const html = items
    .slice(0, 5)
    .map(
      (n) => `
    <article class="news-item">
      <a href="${n.url}" target="_blank" rel="noopener">
        <h3>${n.title}</h3>
        <p>${n.body.substring(0, 100).trim()}…</p>
        <footer>
          <small>${new Date(n.published_on * 1000).toLocaleDateString()}</small>
        </footer>
      </a>
    </article>
  `
    )
    .join("");

  document.getElementById("news-container").innerHTML = html;
}

/** ────── BOOTSTRAP ────── */
document.addEventListener("DOMContentLoaded", () => {
  initModal();
  initSearch();
  initCoinDetail();
  initPortfolio();
  renderNews();
});
