import './chart'

window.onpopstate = (e) => {
  e.preventDefault()
  return false
}

window.oncontextmenu = () => false
