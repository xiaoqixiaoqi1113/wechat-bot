import axios from 'axios'

// 请求接口获取信息
export async function getReply(prompt) {
  console.log('🚀🚀🚀 / prompt', prompt)

  let { data: { message } } = await axios.post('你的接口信息', { prompt })

  const reply = message

  console.log('🚀🚀🚀 / reply', reply)

  return reply
}