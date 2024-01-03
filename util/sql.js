const { Sequelize, DataTypes, Transaction, Op } = require('sequelize');


const config = {
  host: 'localhost',
  prot: '3306',
  user: 'user',
  password: 'wo123456',
  database: 'liq-alarm',
  dialect: 'mysql'
}

const seq = new Sequelize(config.database, config.user, config.password, {
  host: config.host,
  dialect: config.dialect,
  pool: { max: 30, min: 0 },
  timezone: "+08:00",
  logging: false,
})

const user = seq.define("user", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING },
  account: { type: DataTypes.STRING },
  img: { type: DataTypes.STRING },
  company: { type: DataTypes.STRING },
  password: { type: DataTypes.STRING },
  expire: { type: DataTypes.STRING },
  type: { type: DataTypes.STRING },
});

const device = seq.define("device", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  deviceName: { type: DataTypes.STRING },
  deviceDes: { type: DataTypes.STRING },
  deviceLoc: { type: DataTypes.STRING },
  ratedPressure: { type: DataTypes.STRING },
  alarmPressure: { type: DataTypes.STRING },
  curPressure: { type: DataTypes.STRING },
  // liqPoint: { type: DataTypes.STRING },
  company: { type: DataTypes.STRING },
});

const temp = seq.define("temp", {
  // id: {
  //   type: DataTypes.INTEGER,
  //   autoIncrement: true,
  //   primaryKey: true
  // },
  deviceLoc: { type: DataTypes.STRING, primaryKey: true },
  temp1: { type: DataTypes.STRING },
  temp2: { type: DataTypes.STRING },
  temp3: { type: DataTypes.STRING },
  temp4: { type: DataTypes.STRING },
  temp5: { type: DataTypes.STRING },
  temp6: { type: DataTypes.STRING },
  temp7: { type: DataTypes.STRING },
});

device.belongsTo(temp, { foreignKey: 'deviceLoc', targetKey: 'deviceLoc' })


const mpa = seq.define("mpa", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  pressure: { type: DataTypes.STRING },
  liqPoint: { type: DataTypes.STRING },
});
const sys = seq.define("sys", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  pressure: { type: DataTypes.STRING },
  temp: { type: DataTypes.STRING }
});

// User.sync() - 如果表不存在,则创建该表(如果已经存在,则不执行任何操作)
// User.sync({ force: true }) - 将创建表,如果表已经存在,则将其首先删除
// User.sync({ alter: true }) - 这将检查数据库中表的当前状态(它具有哪些列,它们的数据类型等),然后在表中进行必要的更改以使其与模型匹配.

seq.sync({ alter: true })
// seq.sync()

module.exports = {
  user,
  device,
  temp,
  mpa,
  sys
}

