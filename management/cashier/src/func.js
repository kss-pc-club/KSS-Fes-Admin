const $ = require('jquery')

const sleep = (t) => new Promise((r) => setTimeout(r, t))

const anim = async (before, after, isR2L = true) => {
  const outW = isR2L ? -window.outerWidth : window.outerWidth
  $(before).animate({ left: outW }, 500)
  $(before).find('footer').fadeOut(500)
  await sleep(500)
  $(before).removeClass('showing')
  await sleep(200)
  $(after).addClass('showing').css({ left: -outW }).animate({ left: 0 }, 500)
  $(after).find('footer').fadeIn(500)
}

const FetchPOST = (url, data) => {
  return fetch(url, {
    credentials: 'same-origin',
    method: 'POST',
    cache: 'no-cache',
    body: JSON.stringify(data),
    redirect: 'follow',
    referrer: 'no-referrer',
    headers: {
      Accept: 'application/json',
      'Content-type': 'application/json',
    },
  })
}

export { sleep, anim, FetchPOST }
