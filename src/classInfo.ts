//----- クラスの情報を保存する -----//

import { type_menu } from './type'

const classInfo = {
  admin: false,
  name: '',
  isFood: false,
  menus: [] as type_menu[],
  shop_name: '',
  uid: '',
  time: '',
}

export { classInfo }
