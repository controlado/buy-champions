import { Champion, StoreBase } from "../controladoUtils";

/**
 * @author balaclava
 * @name buy-champions
 * @link https://github.com/controlado/buy-champions
 * @description Buy champions automatically! 🐧
 */

export class Store extends StoreBase {
  /**
   * Retorna os campeões disponíveis na loja, que possuem o custo recebido.
   *
   * @async
   * @function
   * @summary Deve ser chamada após a conclusão do {@link auth}.
   * @param {number} cost - Custo dos campeões que devem ser retornados.
   * @return {Promise<Champion[]>} Array de campeões disponíveis.
   */
  async getAvailableChampionsByCost(cost) {
    const playerChampions = await this.getAvailableChampions();
    const availableChampions = [];

    for (const champion of playerChampions.catalog) {
      if (!champion.owned && champion.ip == cost) {
        availableChampions.push(new Champion(champion.itemId, champion.ip));
      }
    }

    return availableChampions;
  }

  async getAvailableChampions() {
    const response = await this.request("GET", "/storefront/v3/view/champions");
    return response.data;
  }
}
