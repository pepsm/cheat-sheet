equire('dotenv/config')
const amqp = require('amqplib')

const MQ_PORT = process.env.RABBIT_PORT || 5672
const MQ_HOST = process.env.RABBIT_HOST || 'localhost'
const MQ_USERNAME = process.env.RABBIT_USERNAME || 'guest'
const MQ_PASSWORD = process.env.RABBIT_PASSWORD || 'guest'

const MQ_URL = `amqp://${MQ_USERNAME}:${MQ_PASSWORD}@${MQ_HOST}:${MQ_PORT}`
const EXCHANGE = 'exchange'
const QUEUE = 'queue'
const PREFETCH_COUNT = 2

let channel = null

/**
 * Connect to RabbitMQ and consume items
 */
const amqpConnectAndConsume = async () => {
  try {
    const mqConnection = await amqp.connect(MQ_URL)

    channel = await mqConnection.createChannel()

    await channel.assertExchange(EXCHANGE, 'fanout', {
      durable: false,
    })

    // Ensure that the queue exists or create one if it doesn't.
    await channel.assertQueue(QUEUE)
    await channel.bindQueue(QUEUE, EXCHANGE, '')

    // Only process <PREFETCH_COUNT> item at a time
    channel.prefetch(PREFETCH_COUNT)
    console.log(`AMQP - connection established at ${MQ_URL} with prefetch count ${PREFETCH_COUNT}`)

    channel.consume(QUEUE, (item) => {
      console.log(item)
    })
  } catch (ex) {
    console.log(
      `RabbitMQ setup unsuccessful - It will not be available in this API instance. AMQP - ${ex}`,
    )
  }
}

module.exports = {
  amqpConsume,
}
