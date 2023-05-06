import { getReply } from '../openai/index.js'
import { botName, roomWhiteList, aliasWhiteList } from '../../config.js'

/**
 * 默认消息发送
 * @param msg
 * @param bot
 * @returns {Promise<void>}
 */

// 群聊白名单
const roomArr = [...roomWhiteList]

// 私聊白名单
const aliasArr = [...aliasWhiteList]

export async function defaultMessage(msg, bot) {
  const contact = msg.talker() // 发消息人
  const receiver = msg.to() // 消息接收人
  const content = msg.text() // 消息内容
  const room = msg.room() // 是否是群消息
  const roomName = (await room?.topic()) || null // 群名称
  const alias = (await contact.alias()) || (await contact.name()) // 发消息人昵称
  const remarkName = await contact.alias() // 备注名称
  const name = await contact.name() // 微信名称
  const isText = msg.type() === bot.Message.Type.Text // 消息类型是否为文本
  const isRoom = roomArr.includes(roomName) && content.includes(`${botName}`) // 是否在群聊白名单内并且艾特了机器人
  const isAlias = aliasArr.includes(remarkName) || aliasArr.includes(name) // 发消息的人是否在联系人白名单内
  const isBotSelf = botName === remarkName || botName === name // 是否是机器人自己
  // TODO 你们可以根据自己的需求修改这里的逻辑
  if (isText && !isBotSelf) {
    try {

      const trimed = msg.payload.text

      // 区分群聊和私聊
      if (isRoom && room) {
        await room.say("查询中,请稍等......")
        await room.say(await getReply(trimed.replace(`${botName}`, '')))
        return
      }

      // 私人聊天，白名单内的直接发送
      if (!room) {

        // 接受到的指令
        let order = trimed.split('/')[0]

        // 接受到的名称
        let text = trimed.split('/')[1]

        // 等待提示语
        await contact.say("查询中,请稍等......")

        // 判断在不在名单内
        if (!isAlias) {
          await contact.say("权限不足,请联系管理员~~~~")
          return
        }

        // 删除某个群聊
        if (order === '管理删群') {

          if (roomArr.includes(text)) {

            roomArr.splice(roomArr.indexOf(text, 1))

            await contact.say('删除成功')

            let newStr = roomArr.reduce((prve, item) => {
              let str = `${item}\n${prve}`
              return str
            }, "")

            await contact.say(newStr)

          } else {

            await contact.say('群聊不存在')

          }

          return
        }

        // 动态添加用户("群聊")
        if (order === '管理加群') {

          roomArr.push(text)

          await contact.say('增加成功')

          let newStr = roomArr.reduce((prve, item) => {
            let str = `${item}\n${prve}`
            return str
          }, "")

          await contact.say(newStr)

          return
        }

        // 删除某个用户
        if (order === '管理删人') {

          if (aliasArr.includes(text)) {

            aliasArr.splice(aliasArr.indexOf(text, 1))

            await contact.say('删除成功')

            let newStr = aliasArr.reduce((prve, item) => {
              let str = `${item}\n${prve}`
              return str
            }, "")

            await contact.say(newStr)

          } else {

            await contact.say('群聊不存在')

          }

          return
        }

        // 动态添加用户("私聊")
        if (order === '管理加人') {

          aliasArr.push(trimed.split('/')[1])

          await contact.say('增加成功')

          let newStr = aliasArr.reduce((prve, item) => {
            let str = `${item}\n${prve}`
            return str
          }, "")

          await contact.say(newStr)

          return
        }

        await contact.say(await getReply(trimed))

      }

    } catch (e) {
      // 区分群聊和私聊
      if (isRoom && room) {
        await room.say("出错啦,联系作者修复一下~~~")
        return
      }

      // 私人聊天，白名单内的直接发送
      if (isAlias && !room) {
        await contact.say("出错啦,联系作者修复一下~~~")
      }

      console.error(e)
    }
  }
}
