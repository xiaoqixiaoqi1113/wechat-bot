import { WechatyBuilder, ScanStatus, log } from 'wechaty'
import qrTerminal from 'qrcode-terminal'
import { defaultMessage } from './sendMessage.js'

// 初始化机器人
export const bot = WechatyBuilder.build({
  name: 'WechatEveryDay',
  puppet: 'wechaty-puppet-wechat4u',
  puppetOptions: {
    uos: true,
  },
})

// 扫码
bot.on('scan', (qrcode, status) => {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    // 在控制台显示二维码
    qrTerminal.generate(qrcode, { small: true })
    const qrcodeImageUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode)].join('')
    console.log('onScan:', qrcodeImageUrl)
  } else {
    log.info('onScan: %s(%s)', ScanStatus[status], status)
  }
})

// 登录
bot.on('login', (user) => {
  console.log(`${user} 已登陆`)
  const date = new Date()
  console.log(`登陆时间:${date}`)
  console.log(`登陆成功！机器人已激活👌`)
})

// 登出
bot.on('logout', (user) => {
  console.log(`${user} 已注销`)
})

// 收到消息
bot.on('message', async (msg) => {
  await defaultMessage(msg, bot)
})

// 添加好友
bot.on('friendship', async (friendship) => {
  const frienddShipRe = /chatgpt|chat/
  if (friendship.type() === 2) {
    if (frienddShipRe.test(friendship.hello())) {
      await friendship.accept()
    }
  }
})

// 启动微信机器人
bot
  .start()
  .then(() => console.log('开始登陆微信...'))
  .catch((e) => console.error(e))
