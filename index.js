const Koa = require('koa')
const convert = require('koa-convert')
const loggerAsync = require('./middleware/logger-async')
const config = require('./config')
const app = new Koa()
const serve = require('koa-static')

app.use(async (ctx, next) => {
  // source_map入口添加响应头
  const { query } = ctx
  // 使用cookie判断是否可以进行sourceMap解析
  let showSourceMap = query.source_map === 'true'
  if (ctx.path === '/') {
    ctx.cookies.set('source_map', showSourceMap, {
      maxAge: 60 * 60 * 1000
    })
  } else {
    showSourceMap = ctx.cookies.get('source_map') === 'true'
  }
  if (showSourceMap) {
    setSourceMapResponseHeader(ctx)
  }
  await next()
})

function setSourceMapResponseHeader (ctx) {
  const { path } = ctx
  const isBundleFile = path.indexOf('.js') !== -1
  isBundleFile && ctx.set('SourceMap', 'sourcemaps' + path + '.map')
}

app.use(serve('./webapp/'))

app.use(convert(loggerAsync()))

app.listen(config.PORT)

console.log('start-quick is starting at port 3000')
