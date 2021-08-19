window.addEventListener('DOMContentLoaded', () => {
  fetch('/common/head.html')
    .then(async (res) => {
      document.head.innerHTML += await res.text()
    })
    .catch(console.error)
  fetch('/common/header.html')
    .then(async (res) => {
      const header = document.querySelector('header')
      if (header) header.innerHTML = await res.text()
    })
    .catch(console.error)
})
