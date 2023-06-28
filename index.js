import { addRoutines } from "../controladoUtils"
import { Store } from "./requests"

/**
 * @author
 * Nome: Yan Gabriel    
 * Discord: Balaclava#1912 (854886148455399436)    
 * GitHub: https://github.com/controlado
 */

export const plugin = {
  "name": "Buy Champions",
  "url": "https://github.com/controlado/buy-champions",
  "version": "1.0.1",
}
const buttonId = "buy-450-champions-button"

const onMutation = () => {
  const frameStore = document.querySelector("#rcp-fe-lol-store-iframe > iframe")
  const storeDocument = frameStore?.contentDocument.documentElement
  if (!frameStore || storeDocument.querySelector(`#${buttonId}`)) { return }

  const store = new Store() // autenticando a loja

  // criação do botão pra comprar os campeões
  const buyChampionButton = document.createElement("lol-uikit-flat-button")
  buyChampionButton.id = buttonId
  buyChampionButton.textContent = "450 EA"
  buyChampionButton.style.marginRight = "18px"

  // callback do botão de compra
  buyChampionButton.onclick = async () => {
    buyChampionButton.setAttribute("disabled", "true")
    try {
      const availableChampions = await store.getAvailableChampionsByCost(450)
      if (availableChampions.length > 0) { await store.buyChampions(availableChampions) }
    }
    catch (error) { console.error(`${plugin.name}:`, error) }
    finally { buyChampionButton.removeAttribute("disabled") }
  }

  // selecionar o local onde os botões vão ser colocados
  const navBar = storeDocument.querySelector(".nav.nav-right")
  navBar.insertBefore(buyChampionButton, navBar.firstChild)
}

window.addEventListener("load", () => {
  console.debug(`${plugin.name}: Report bugs to Balaclava#1912`)
  addRoutines(onMutation)
})