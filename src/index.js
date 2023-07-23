import { addRoutines, Champion, StoreBase } from "https://cdn.skypack.dev/balaclava-utils@latest";
import trans from "./trans.json"; // If you want to help me translate this, please open a PR! :)

/**
 * @author balaclava
 * @name buy-champions
 * @link https://github.com/controlado/buy-champions
 * @description Buy champions automatically! 🐧
 */

class Store extends StoreBase {
    async getAvailableChampions(ipCost, currentCost = 0) {
        const response = await this.request("GET", "/storefront/v3/view/champions");
        return response.data.catalog
            .filter(champion => champion.ip === ipCost && !champion.owned)
            .filter(champion => (currentCost += champion.ip) <= response.data.player.ip)
            .map(champion => new Champion(champion.itemId, champion.ip));
    }
}

async function setupElements(selector) {
    const storeIFrame = document.querySelector("#rcp-fe-lol-store-iframe > iframe");
    const storeContainer = storeIFrame?.contentDocument.documentElement?.querySelector(selector);
    if (!storeContainer || storeContainer.hasAttribute("buy-button")) { return; }

    const store = new Store();
    storeContainer.setAttribute("buy-button", "true");
    storeContainer.insertBefore(newButton(store), storeContainer.firstChild);
}

function newButton(store) {
    const costsGenerator = championsCosts();
    let currentCost = costsGenerator.next().value;

    const button = document.createElement("lol-uikit-flat-button");
    button.classList.add("lol-uikit-flat-button-normal", "title-on-hover");
    button.textContent = `${currentCost} BE`;
    button.ariaLabel = getAriaLabel();
    button.onclick = async () => {
        button.setAttribute("disabled", "true");
        try {
            const champions = await store.getAvailableChampions(currentCost);
            if (champions.length) { await store.buyChampions(...champions); }
        } finally {
            button.removeAttribute("disabled");
        }
    };
    button.oncontextmenu = () => {
        currentCost = costsGenerator.next().value;
        button.textContent = `${currentCost} BE`;
    };
    return button;
}

function getAriaLabel() {
    const clientLocale = document.body.dataset.lang;
    return trans.tooltip[clientLocale] || trans.tooltip[trans.missing];
}

function* championsCosts() {
    const costs = [450, 1350, 3150, 4800, 6300];
    while (true) { // Infinite generator
        yield* costs;
    }
};

window.addEventListener("load", () => {
    addRoutines(() => setupElements("nav.navbar > .nav-right"));
    console.debug("buy-champions: Report bugs to Balaclava#1912");
});