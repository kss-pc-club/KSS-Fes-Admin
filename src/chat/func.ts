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

const formatDate = (d: Date) =>
  `${month[d.getMonth()]} ${d.getDate()} | ${String(d.getHours()).padEnd(
    2,
    '0'
  )}:${String(d.getMinutes()).padEnd(2, '0')}`

export { scrollBtm, month, formatDate }
