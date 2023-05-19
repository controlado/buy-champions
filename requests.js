import axios from "https://cdn.skypack.dev/axios"

/**
 * @author
 * Nome: Yan Gabriel  
 * Discord: Balaclava#1912  
 * GitHub: https://github.com/controlado
 */

export class Store {
    constructor() {
        this.url = null
        this.token = null
        this.summoner = null
        this.session = axios.create()
        this.auth()
    }

    /**
     * Compra os campeões que da array recebida.
     * 
     * @async
     * @function
     * @summary Deve ser chamada após a conclusão do `auth()`.
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
     * @summary Deve ser chamada após a conclusão do `auth()`.
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
        const endpoint = "/storefront/v3/view/champions"
        const response = await this.request("GET", endpoint)
        return response.data
    }

    /**
     * Faz uma requisição para a loja.
     *
     * @async
     * @function
     * @summary Deve ser chamada após a conclusão do `auth()`.
     * @param {String} method - Método HTTP da requisição, como `GET`.
     * @param {String} endpoint - Endpoint da requisição para a loja.
     * @param {JSON} [requestBody] - Parâmetro opcional, corpo da requisição.
     * @return {Promise<Response>} Resposta da requisição.
     */
    async request(method, endpoint, requestBody = undefined) {
        const requestParams = {
            "method": method,
            "headers": {
                "Authorization": `Bearer ${this.token}`
            }
        }
        if (requestBody) { requestParams.data = requestBody }
        return await this.session.request(this.url + endpoint, requestParams)
    }

    /**
     * Autentica a classe, definindo os atributos da instância.
     * 
     * @async
     * @function
     * @summary Essa função deve ser chamada antes de utilizar a classe.
     */
    async auth() {
        this.url = await this.getStoreUrl()
        this.token = await this.getSummonerToken()
        this.summoner = await this.getSummonerData()
    }

    async getStoreUrl() {
        const endpoint = "/lol-store/v1/getStoreUrl"
        const response = await fetch(endpoint)
        return await response.json()
    }

    async getSummonerToken() {
        const endpoint = "/lol-rso-auth/v1/authorization/access-token"
        const response = await fetch(endpoint)
        const responseData = await response.json()
        return responseData.token
    }

    async getSummonerData() {
        const endpoint = "/lol-summoner/v1/current-summoner"
        const response = await fetch(endpoint)
        return await response.json()
    }
}
