/**
 * @description nがd桁に届かない場合は先頭に0を挿入
 * @param {Number} n 数字
 * @param {Number} d 桁
 */
const addZero = (n, d) => {
  let sn = String(n)
  if (sn.length < d) {
    sn = '0'.repeat(d - sn.length) + sn
  }
  return sn
}

/**
 * @description 3桁ごとにカンマ挿入,
 * @param {Number} n 数字
 * @returns {String}
 */
const formatNum = (n) => {
  if (typeof n !== 'number') return n
  let _ = ''
  const sn = String(n)
  for (let i = 0; i < Math.ceil(sn.length / 3); i++) {
    const t = Math.floor((n / 1000 ** i) % 1000)
    if (sn.length - i * 3 > 3) {
      _ = ',' + addZero(t, 3) + _
    } else {
      _ = String(t) + _
    }
  }
  return _
}

const sleep = (t) => new Promise((r) => setTimeout(r, t))
export { formatNum, addZero, sleep }
