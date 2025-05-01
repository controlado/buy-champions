import { addRoutines, Champion, StoreBase } from "https://cdn.skypack.dev/balaclava-utils@latest";
import { version } from "../package.json";
import trans from "./trans.json"; // If you want to help me translate this, please open a PR! :)

const logPrefix = `buy-champions(${version}):`

/**
 * @author balaclava
 * @name buy-champions
 * @link https://github.com/controlado/buy-champions
 * @description Buy champions automatically! 🐧
 */

class AvailableChampions {
    constructor(rawResponse) {
        this.rawResponse = rawResponse;
        this.playerIP = rawResponse.data.player.ip || 0;
        this.storeData = rawResponse.data.catalog || [];
    }

    /**
     * @param {number} priceToFilter - The Blue Essence price to filter by.
     * @returns {Champion[]} An array of Champion instances matching the criteria.
     */
    filterByPrice(priceToFilter) {
        return this.storeData
            .filter(champion => champion.ip === priceToFilter && !champion.owned)
            .filter(champion => (priceToFilter += champion.ip) <= this.playerIP)
            .map(champion => new Champion(champion.itemId, champion.ip));
    }

    /**
     * @returns {number[]} A sorted array of unique prices.
     */
    get prices() {
        const uniquePrices = new Set(this.storeData.map(champion => champion.ip));
        return Array.from(uniquePrices).sort((a, b) => a - b);
    }
}

class Store extends StoreBase {
    async getAvailableChampions() {
        const response = await this.request("GET", "/storefront/v3/view/champions");
        return new AvailableChampions(response);
    }
}

/**
 * @param {Store} store - Authenticated store.
 * @param {string} selector - Button position.
 * @returns 
 */
async function setupElements(store, selector) {
    const storeIFrame = document.querySelector("#rcp-fe-lol-store-iframe > iframe");
    const storeContainer = storeIFrame?.contentDocument.documentElement?.querySelector(selector);
    if (!storeContainer || storeContainer.hasAttribute("buy-button")) { return; }

    try {
        const availableChampions = await store.getAvailableChampions();
        var button = newButton(store, availableChampions);
    } catch (e) {
        errorLog("Failed to fetch champions available for purchase", e);
        return;
    }

    try {
        storeContainer.setAttribute("buy-button", "true");
        storeContainer.insertBefore(button, storeContainer.firstChild);
    } catch (e) {
        errorLog("Failed to set button in store UI", e);
        return;
    }

    infoLog("Button set without errors")
}

/**
 * @param {Store} store - Authenticated store.
 * @param {AvailableChampions} availableChampions - All the champions available for purchase.
 * @returns {HTMLElement} - The button that has been created and configured.
 */
function newButton(store, availableChampions) {
    const costsGenerator = yieldChampionPrices(availableChampions.prices);
    const currentPrice = costsGenerator.next();

    const button = document.createElement("lol-uikit-flat-button");
    button.classList.add("lol-uikit-flat-button-normal", "title-on-hover");
    button.textContent = formatChampionPrice(currentPrice.value);
    button.ariaLabel = getTransAriaLabel();

    button.onclick = async () => {
        button.setAttribute("disabled", "true");
        try {
            const buyingChampions = availableChampions.filterByPrice(currentPrice.value);
            if (buyingChampions.length) { await store.buyChampions(...buyingChampions) }
        } finally {
            button.removeAttribute("disabled");
        }
    };

    button.oncontextmenu = () => {
        const currentPrice = costsGenerator.next();
        button.textContent = formatChampionPrice(currentPrice.value);
    };

    return button;
}

function getTransAriaLabel() {
    const clientLocale = document.body.dataset.lang;
    return trans.tooltip[clientLocale] || trans.tooltip[trans.missing];
}

/**
 * @param {number} price 
 * @returns {string} - Price formatted. For example: 450 BE
 */
function formatChampionPrice(price) {
    return `${price} BE`;
}

/**
 * @param {number[]} allPrices
 * @yields {number}
 */
function* yieldChampionPrices(allPrices) {
    while (true) { yield* allPrices }
};

/**
 * @param {string} msg
 */
function debugLog(msg) {
    console.debug(`${logPrefix} ${msg}`);
}

/**
 * @param {string} msg
 */
function infoLog(msg) {
    console.info(`${logPrefix} ${msg}`);
}

/**
 * @param {string} msg
 * @param {Error} err
 */
function errorLog(msg, err) {
    console.error(`${logPrefix} ${msg}: ${err.message}`);
}

window.addEventListener("load", async () => {
    const store = new Store();
    await store.wait(1000);

    addRoutines(() => setupElements(store, "nav.navbar > .nav-right"));
    debugLog("Report bugs to Balaclava#1912 (@feminismo)");
});