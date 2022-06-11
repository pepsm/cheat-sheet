# RabbitMQ 
A cheat sheet on how to quickly spin up a message broker instance with Docker and run an example, consumer and producer, with Node.js

## Table of contents

1. [Prerequisites](#prerequisites)
   1. [Install Docker](#install-docker)
   2. [Install RabbitMQ](#install-rabbitmq)
2. [Producer](#producer)
3. [Consumer](#consumer)


## Prerequisites

### Install Docker

`brew cask install docker` - Install docker with brew.

`docker ps -a` - Show running and stopped containers.



### Install RabbitMQ

`docker pull rabbitmq` - Pull the latest image from [docker hub](https://hub.docker.com/_/rabbitmq).

`docker network create rabbits` - Every instance will run in the same network.

`docker run -d --rm --net rabbits --hostname rabbit-1 --name rabbit-1 rabbitmq` 

`docker exec -it rabbit-1 bash` - Enter inside the container.

`rabbitmq-plugins enable rabbitmq_management` - Enable the management plugin.

`rabbitmq-plugins list` - Display the all plugins.


### Install RabbitMQ with the management plugin

`docker pull rabbitmq:3.10-management` - Pull rabbitmq with the management plugin enabled by default.

`docker run --rm -it -p 15672:15672 -p 5672:5672 rabbitmq:3.10-management` - Run the container and goes inside of the image.

`Ctrl+C` - Kill the container. In order to run it in detached mode, use the `-d` flag.

[http://localhost:8080](http://localhost:8080/#/)
login: `guest`
password: `guest`



## Producer

`npm install` the [amqplib](https://www.npmjs.com/package/amqplib) library and client for Node.js

```
cd rabbitmq/rabbitmq-producer
npx express-generator
npm install
npm install amqplib
```

Create a new file called `mqService.js` next to index.js.

```js
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
```

Add to `index.js`.
```js
import { injectExchangeService, amqpConnect } from './mqService'

// Middleware to inject message-queue services
app.use(injectExchangeService)

amqpConnect()
```

## Consumer

`npm install` the [amqplib](https://www.npmjs.com/package/amqplib) library and client for Node.js

```
cd rabbitmq/rabbitmq-consumer
npx express-generator
npm install
npm install amqplib
```

Create `mqService.js` file.

```js
require('dotenv/config')
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
```

Add to `index.js`

```js
import { amqpConsume } from './mqService'
amqpConsume()
```
