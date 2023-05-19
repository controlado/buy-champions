import utils from "../_utils"
import * as requests from "./requests"

/**
 * @author Yan Gabriel <Balaclava#1912>
 */

const pluginName = "buy-champions"
const buttonId = "buy-450-champions-button"

const onMutation = () => {
  const frameStore = document.querySelector("#rcp-fe-lol-store-iframe > iframe")
  if (!frameStore) { console.debug("frameStore não foi reconhecido"); return }

  const storeDocument = frameStore.contentDocument.documentElement
  if (storeDocument.querySelector(`#${buttonId}`)) { console.debug("botão já criado"); return }

  // autenticando a loja
  const store = new requests.Store()

  // criação do botão pra comprar os campeões
  const buyChampionButton = document.createElement("lol-uikit-flat-button")
  buyChampionButton.id = buttonId
  buyChampionButton.textContent = "450 EA"
  buyChampionButton.style.marginRight = "18px"

  buyChampionButton.addEventListener("click", () => {
    buyChampionButton.setAttribute("disabled", "true")
    store.getAvailableChampionsByCost(450)
      .then(champions => {
        if (champions.length > 0) {
          store.buyChampions(champions)
            .then(response => console.log(pluginName, response))
            .catch(error => console.error(pluginName, error))
        }
      })
      .finally(buyChampionButton.removeAttribute("disabled"))
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