### Implement RabbitMQ on Docker

`brew cask install docker` install docker with brew.

`docker ps -a` shows running and stopped containers.

`docker pull rabbitmq:3.8` install rabbitmq from docker hub.

`docker network create rabbits` every instance will run in the same network.

`docker run -d --rm --net rabbits --hostname rabbit-1 --name rabbit-1 rabbitmq:3.8` 

`docker exec -it rabbit-1 bash` go inside of the docker image.

`rabbitmq-plugins enable rabbitmq_management` will enable the management plugin.

`rabbitmq-plugins list` displays the rabbitmq plugins

[localhost:8080](http://localhost:8080/#/)
login: `guest`
password: `guest`


### Send Messages to RabbitMQ from a Producer

`mkdir -p rabbitmq/rabbitmq-producer`

`mkdir -p rabbitmq/rabbitmq-consumer`

**Producer**

`npm install`

`npm install amqplib` [amqplib Node library](https://www.npmjs.com/package/amqplib)

```js
cd rabbitmq/rabbitmq-producer
npx express-generator
npm install
npm install amqplib
```

Create a new file called message.js next to index.js.

```js
var express = require('express');
var router = express.Router();

var amqp = require('amqplib/callback_api');

const url = 'amqp://localhost';
const queue = 'my-queue';

let channel = null;

amqp.connect(url, function (err, conn) {
  if (!conn) {
    throw new Error(`AMQP connection not available on ${url}`);
  }
  conn.createChannel(function (err, ch) {
    channel = ch;
  });
});

process.on('exit', code => {
  channel.close();
  console.log(`Closing`);
});

router.post('/', function (req, res, next) {
  channel.sendToQueue(queue, new Buffer.from(req.body.message));
  res.render('index', { response: `Successfully sent: ${req.body.message}` });
});

module.exports = router;
```
`docker run --rm -it -p 15672:15672 -p 5672:5672 rabbitmq:3-management`
