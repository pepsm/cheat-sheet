require('dotenv/config')
require('regenerator-runtime/runtime')

const amqp = require('amqplib')

const MQ_HOST = 'localhost'
const MQ_URL = `amqp://${MQ_HOST}:5672`
const EXCHANGE = 'exchange'
let channel = null

/**
 * Connect to RabbitMQ
 */
export const amqpConnect = async () => {
  try {
    const mqConnection = await amqp.connect(MQ_URL)
    menuChannel = await mqConnection.createChannel()

    await channel.assertExchange(EXCHANGE, 'fanout', {
      durable: false,
    })
    console.log(`AMQP - connection established at amqp://${MQ_HOST}:5672`)
  } catch (ex) {
    console.warn(
      `AMQP - Connection was unsuccesful at amqp://${MQ_HOST}:5672 - Broker will be unavailable.`,
    )
  }
}

/**
 * Publish item to queue
 * @param {string} item - a string variable
 */
const publishItemToExchange = (item) => {
  console.log(`AMQP - exchange: ${item}`)
  channel.publish(EXCHANGE, ' ', Buffer.from(item))
}

/**
 * An express middleware for injecting queue services into the request object.
 * @param {Object} req - express request object.
 * @param {Object} res - express response object.
 * @param {Function} next - express next() function.
 */
export const injectExchangeService = (req, res, next) => {
  // Add all exchange operations here.
  const exchangeServices = {
    publishItemToExchange,
  }
  // Inject exchangeServices in request object
  req.exchangeServices = exchangeServices
  next()
}
