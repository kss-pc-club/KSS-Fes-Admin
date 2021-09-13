//----- メニュー項目をHTMLに変換する処理 -----//
import { type_menu } from '../type'
import { availableIconsList } from './availableIcons'

// 使えるアイコンのリスト
let available_icons = ''
for (const key in availableIconsList) {
  if (availableIconsList.hasOwnProperty(key)) {
    available_icons += `<li><a href="#" class="dropdown-item" data-icon="${key}"><img src="https://monitor.festival.kss-pc.club/icons/${key}.png"> ${availableIconsList[key]}</a></li>`
  }
}

// ステータス         営業中    休憩中     終了
const statusColor = ['green', 'yellow', 'red']
const statusFood = ['op', 'sh', 'so']
const statusNotFood = ['no', 'pa', 'en']

/**
 * メニュー項目をHTMLに変換します
 * @param item - メニュー項目
 * @param idx - メニュー項目のindex
 * @returns 変換されたHTML
 */
const itemElem = (item: type_menu, idx: number) => `
<div class="input-group mt-3" data-idx="${idx}">
  <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="iconSelect">アイコン <img src="https://monitor.festival.kss-pc.club/icons/${
    item.icon
  }.png"></button>
  <ul class="dropdown-menu dropdown-icon">${available_icons}</ul>
  <span class="input-group-text">商品名: </span>
  <input type="text" class="form-control" value="${
    item.name
  }" placeholder="商品名">
</div>
<div class="input-group mb-3" data-idx="${idx}">
  <span class="input-group-text">値段: ￥</span>
  <input type="number" class="form-control" value="${
    item.price
  }" placeholder="値段">
  <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" id="statusSelect">ステータス <span class="circle ${
    statusColor[item.status]
  }-circle"></span></button>
  <ul class="dropdown-menu dropdown-status">
    <li><a href="#" class="dropdown-item" data-statusId="0"><span class="circle green-circle"></span> 販売中・営業中</a></li>
    <li><a href="#" class="dropdown-item" data-statusId="1"><span class="circle yellow-circle"></span> 品薄・休憩中</a></li>
    <li><a href="#" class="dropdown-item" data-statusId="2"><span class="circle red-circle"></span> 品切れ・終了</a></li>
  </ul>
  <button class="btn btn-outline-danger" type="button" id="removeItem"><i class="bi bi-x-circle"></i> 削除</button>
</div>
`

/**
 * メニュー項目から待ち時間モニターのプレビューのHTMLに変換します
 * @param item - メニュー項目
 * @param isFood - 食販かどうか
 * @returns 変換されたHTML
 */
const previewItemElem = (item: type_menu, isFood: boolean) => `
<div><img src="https://monitor.festival.kss-pc.club/icons/${
  item.icon
}.png" class="icon" data-status="${
  (isFood ? statusFood : statusNotFood)[item.status]
}"><p></p></div>
`

export { itemElem, previewItemElem }
