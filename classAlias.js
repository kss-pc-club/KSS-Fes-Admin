const alias = {
  '7-1': '文藝部',
}

module.exports.alias = alias
module.exports.getName = (id) => (alias[id] ? alias[id] : id)
