import utils from "../_utils"
import { Store } from "./requests"

/**
 * @author
 * Nome: Yan Gabriel  
 * Discord: Balaclava#1912  
 * GitHub: https://github.com/controlado
 */

const pluginName = "buy-champions"
const buttonId = "buy-450-champions-button"

const onMutation = () => {
  const frameStore = document.querySelector("#rcp-fe-lol-store-iframe > iframe")
  const storeDocument = frameStore?.contentDocument.documentElement
  if (!frameStore || storeDocument.querySelector(`#${buttonId}`)) { return }

  // autenticando a loja
  const store = new Store()

  // criação do botão pra comprar os campeões
  const buyChampionButton = document.createElement("lol-uikit-flat-button")
  buyChampionButton.id = buttonId
  buyChampionButton.textContent = "450 EA"
  buyChampionButton.style.marginRight = "18px"

  buyChampionButton.addEventListener("click", async () => {
    buyChampionButton.setAttribute("disabled", "true")
    try {
      const availableChampions = await store.getAvailableChampionsByCost(450)
      if (availableChampions.length > 0) { await store.buyChampions(availableChampions) }
    }
    catch (error) { console.error(pluginName, error) }
    finally { buyChampionButton.removeAttribute("disabled") }
  })

  // selecionar o local onde os botões vão ser colocados
  const navBar = storeDocument.querySelector(".nav.nav-right")
  navBar.insertBefore(buyChampionButton, navBar.firstChild)
}

window.addEventListener("load", () => {
  console.debug(pluginName, "feito com carinho pelo Balaclava#1912")
  utils.routineAddCallback(onMutation, ["rcp-fe-lol-store-iframe"])
  console.debug(pluginName, "plugin configurado com sucesso...")
})