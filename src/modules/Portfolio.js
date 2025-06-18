export default class Portfolio {
  constructor(service, summarySelector, tableBodySelector) {
    this.service = service;
    this.summaryEl = document.querySelector(summarySelector);
    this.tbody = document.querySelector(tableBodySelector);
    this.items = [];
    this.details = [];
  }

  async init() {
    this.items = JSON.parse(localStorage.getItem("portfolio") || "[]");

    this.details = await Promise.all(
      this.items.map(async (it) => {
        const data = await this.service.getCoinDetails(it.id);
        return {
          id: it.id,
          name: it.name,
          amount: it.amount,
          buyPrice: it.buyPrice,
          currentPrice: data.market_data.current_price.usd,
        };
      })
    );

    this.renderSummary();
    this.renderList();
    this.bindRemove();
  }

  renderSummary() {
    const invested = this.details.reduce(
      (sum, i) => sum + i.buyPrice * i.amount,
      0
    );
    const current = this.details.reduce(
      (sum, i) => sum + i.currentPrice * i.amount,
      0
    );
    const profit = current - invested;

    this.summaryEl.innerHTML = `
      <p>Total Invested: $${invested.toFixed(2)}</p>
      <p>Current Value: $${current.toFixed(2)}</p>
      <p>Profit/Loss: $${profit.toFixed(2)}</p>
    `;
  }

  renderList() {
    this.tbody.innerHTML = this.details
      .map(
        (i) => `
      <tr>
        <td>${i.name}</td>
        <td>${i.amount}</td>
        <td>$${i.buyPrice.toFixed(2)}</td>
        <td>$${i.currentPrice.toFixed(2)}</td>
        <td>$${((i.currentPrice - i.buyPrice) * i.amount).toFixed(2)}</td>
        <td><button class="remove-btn" data-id="${i.id}">Remove</button></td>
      </tr>`
      )
      .join("");
  }

  bindRemove() {
    this.tbody.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;
        this.items = this.items.filter((it) => it.id !== id);
        localStorage.setItem("portfolio", JSON.stringify(this.items));
        this.init();
      });
    });
  }
}
