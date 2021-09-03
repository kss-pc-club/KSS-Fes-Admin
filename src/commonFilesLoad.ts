//----- 共通のファイルを読み込む -----//

// <header>と<meta>などは全ページでほぼ同じなので、それを読み込む。
window.addEventListener('DOMContentLoaded', () => {
  fetch('/common/head.html')
    .then(async (res) => {
      document.head.innerHTML += await res.text()
    })
    .catch(console.error)
  fetch('header.html')
    .then(async (res) => {
      const header = document.querySelector('header')
      if (res.ok && header) {
        header.innerHTML = await res.text()
      } else {
        fetch('/header.html')
          .then(async (res) => {
            if (header) header.innerHTML = await res.text()
          })
          .catch(console.error)
      }
    })
    .catch(console.error)
})
