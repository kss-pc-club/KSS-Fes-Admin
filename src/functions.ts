//----- 共通で使う関数 -----//

/**
 * async関数内において待機
 * @param t - 待機する時間（ミリ秒）
 * @example await sleep(700)  // 700ms待機
 */
const sleep = (t: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, t))

export { sleep }
