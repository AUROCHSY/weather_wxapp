export const test = (a, b) => {
    return wx.cloud.callFunction({
      name: 'test',
      data: {
        a, b
      }
    })
}