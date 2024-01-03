const Koa = require("koa")
const cors = require('koa2-cors')
const static = require('koa-static')
const Router = require("koa-router")
const { koaBody } = require('koa-body');
const path = require('path')
const db = require('./util/sql.js');
const { Op } = require('sequelize');

const app = new Koa()
const router = new Router()

app.use(cors())
app.use(static(path.join(__dirname + '/public')))
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, 'public'), // 上传文件保存路径
    keepExtensions: true,
  }
}));

// 处理错误
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    console.log('error:', e)
    ctx.body = { code: 0, msg: JSON.stringify(e) }
  }
})


const ops = ['get', 'add', 'edit', 'del']
const tables = ['user', 'mpa', 'device', 'temp', 'sys']
app.use(async (ctx, next) => {
  const { url } = ctx.request
  const [a, table, op] = url.split('/')
  console.log(new Date().toLocaleString(), table, op)
  if (!ops.includes(op)) return await next()
  if (!tables.includes(table)) return await next()

  const dt = {
    get,
    edit,
    del,
    add
  }
  const ret = await dt[op](table, ctx)
  ctx.body = ret
  await next()
})


app.use(router.routes()).use(router.allowedMethods())
app.listen(8004, () => console.log("run in port 8004"))

router.post('/user/login', async ctx => {
  const { account, password } = ctx.request.body
  const data = await db.user.findAll({ where: { account, password } })
  ctx.body = { code: data.length ? 1 : 0, data }
})

router.post('/alarm/get', async ctx => {
  const ret = {
    code: 1
  }
  const { company, pageSize = 10, pageNumber = 1 } = ctx.request.body
  const devs = await db.device.findAll({ include: db.temp })

  ret.data = devs.map(v => {
    const ret = { ...v.dataValues, ...v.temp.dataValues }
    delete ret.temp
    return ret
  })

  ctx.body = ret

})

const noWhere = ['total', 'pageSize', 'pageNumber']

const get = (table, ctx) => {
  return new Promise(async (resolve) => {
    const ret = {
      code: 1
    }
    const params = ctx.request.body
    const where = { ...params }
    noWhere.forEach(k => delete where[k])
    if (!params || !params.pageSize) {
      ret.data = await db[table].findAll()
      ret.total = await db[table].count({ where })
      resolve(ret)
      return
    }
    ret.data = await db[table].findAll({
      limit: params.pageSize,
      offset: (params.pageNumber - 1) * params.pageSize,
      where
    })
    ret.total = await db[table].count({ where })
    resolve(ret)
  })
}
const add = (table, ctx) => {
  return new Promise(async (resolve) => {
    const params = ctx.request.body
    const ret = { code: 1, msg: '添加成功' }
    const data = { ...params }
    delete data.id
    ret.data = await db[table].create(data)

    resolve(ret)
  })
}
const edit = (table, ctx) => {
  return new Promise(async (resolve) => {
    const params = ctx.request.body
    const ret = { code: 1, msg: '更新成功' }
    const data = { ...params }
    ret.data = await db[table].update(data, { where: { id: data.id } })
    resolve(ret)
  })
}
const del = (table, ctx) => {
  return new Promise(async (resolve) => {
    const ret = { code: 1, msg: '删除成功' }
    const { ids } = ctx.request.body
    ret.data = await db[table].destroy({ where: { id: { [Op.or]: ids } } })
    resolve(ret)
  })
}
