// 因为小程序的 callfunction 是 Promisify 的，所以这里需要用 Promise 处理一下
// 小程序中不支持 Promise，所以引入了 bluebird 这个库
import Promise from './bluebird'
export const test = (a,b) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: 'http://127.0.0.1:3000/api/test',
      {a,b},
      success: (res) => {
        resolve({result: res.data})
      },
      fail: (e) => {
        reject(e)
      }
    })
  })
}