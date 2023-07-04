import { StoreBase } from "../controladoUtils"

/**
 * @name buy-champions
 * @author feminismo (balaclava)
 * @description Buy champions automatically! 🐧
 * @link https://github.com/controlado/buy-champions
 */

export class Store extends StoreBase {
    /**
     * Compra os campeões que da array recebida.
     * 
     * @async
     * @function
     * @summary Deve ser chamada após a conclusão do {@link auth}.
     * @param {JSON[]} champions - Objetos devem possuir `itemId` e `ip`.
     * @return {Promise<Response>} Resposta da solicitação.
     */
    async buyChampions(champions) {
        const items = champions.map(
            champion => (
                {
                    "inventoryType": "CHAMPION",
                    "itemId": champion.itemId,
                    "ipCost": champion.ip,
                    "quantity": 1
                }
            )
        )
        const requestBody = { "accountId": this.summoner.accountId, "items": items }
        return await this.request("POST", "/storefront/v3/purchase", requestBody)
    }

    /**
     * Retorna os campeões disponíveis na loja, que possuem o custo recebido.
     * 
     * @async
     * @function
     * @summary Deve ser chamada após a conclusão do {@link auth}.
     * @param {Number} cost - Custo dos campeões que devem ser retornados.
     * @return {Promise<JSON[]>} Array de campeões disponíveis.
     */
    async getAvailableChampionsByCost(cost) {
        const playerChampions = await this.getAvailableChampions()
        const availableChampions = []

        for (const champion of playerChampions.catalog) {
            if (!champion.owned && champion.ip == cost) {
                availableChampions.push(champion)
            }
        }

        return availableChampions
    }

    async getAvailableChampions() {
        const response = await this.request("GET", "/storefront/v3/view/champions")
        return response.data
    }
}
