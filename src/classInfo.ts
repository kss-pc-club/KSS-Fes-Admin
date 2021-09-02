type menuType = {
  icon: string
  name: string
  status: number
  price: number
  customers: number
  amount: number
}

const classInfo = {
  name: '',
  isFood: false,
  menus: [] as menuType[],
  shop_name: '',
  uid: '',
  time: '',
}

export { classInfo, menuType }
