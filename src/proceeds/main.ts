//----- メインの処理 -----//
import './chart'

// ブラウザ「戻る」ボタンは何もしない
window.onpopstate = (e) => {
  e.preventDefault()
  return false
}

// 右クリックは何もしない
window.oncontextmenu = () => false
