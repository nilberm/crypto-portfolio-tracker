
import ExternalServices from "./ExternalServices";
import { getParam } from "./utils.js";
import Chart from "chart.js/auto";

const service = new ExternalServices();

document.addEventListener("DOMContentLoaded", async () => {
  const id = getParam("id");
  if (!id) return;

  const data = await service.getCoinDetails(id);
  document.getElementById("coin-name").textContent = data.name;
  document.getElementById("coin-image").src = data.image.large;
  document.getElementById("coin-image").alt = data.name;
  document.getElementById(
    "coin-price"
  ).textContent = `$${data.market_data.current_price.usd.toLocaleString()}`;
  document.getElementById(
    "coin-change"
  ).textContent = `${data.market_data.price_change_percentage_24h.toFixed(2)}%`;
  document
    .getElementById("coin-change")
    .classList.add(
      data.market_data.price_change_percentage_24h >= 0
        ? "text-success"
        : "text-danger"
    );

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
      plugins: {
        legend: { labels: { color: "#FFFFFF" } },
      },
    },
  });

  document.getElementById("add-to-portfolio").addEventListener("click", () => {
    const portfolio = JSON.parse(localStorage.getItem("portfolio") || "[]");
    portfolio.push({
      id,
      name: data.name,
      price: data.market_data.current_price.usd,
    });
    localStorage.setItem("portfolio", JSON.stringify(portfolio));
    alert(`${data.name} added to portfolio!`);
  });
});
