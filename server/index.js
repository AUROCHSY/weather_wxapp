const express = require('express')
const {PORT} = require('../config.server.json')
const app = express()

// 添加static
/*
app.use(
    '/static',
    express.static(path.join(__dirname, 'static'), {
      index: false,
      maxage: '30d'
    })
  )
*/
//实现云函数服务模拟

const test = require('./cloud-functions/test/').main

app.get('/api/test', (req, res, next) => {
  // 将 req.query 传入
  test(req.query).then(res.json.bind(res)).catch((e) => {
    console.error(e)
    next(e)
  })
  // next()
})



app.listen(PORT, () => {
  console.log(`开发服务器启动成功：http://127.0.0.1:${PORT}`)
})


