//----- チャットシステムで用いる関数 -----//

/**
 * チャット履歴を最下部までスクロールします
 */
function scrollBtm() {
  const e = document.querySelector('main .chat .history')
  if (e) {
    e.scrollTo(0, e.scrollHeight - e.clientHeight)
  }
}

const month = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * 日付・時刻をフォーマットします
 * @param d - フォーマットする日付・時刻 as Date
 * @returns フォーマットされたString
 */
const formatDate = (d: Date) =>
  `${month[d.getMonth()]} ${d.getDate()} | ${String(d.getHours()).padStart(
    2,
    '0'
  )}:${String(d.getMinutes()).padStart(2, '0')}`

export { scrollBtm, month, formatDate }
