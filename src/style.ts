//----- 各ページ用のスタイルを読み込み -----//

window.addEventListener('DOMContentLoaded', () => {
  let path = location.pathname
  if (path.endsWith('/')) path += 'index'
  if (path.endsWith('.html')) path = path.replace('.html', '')
  const css = document.createElement('link')
  css.href = `/css/pages${path}.css`
  css.rel = 'stylesheet'
  document.head.appendChild(css)
})
