### Docker

`brew cask install docker` install docker with brew.

`docker ps -a` shows running and stopped containers.

`docker exec -it rabbit-1 bash` go inside of the docker image.


### RabbitMQ

`docker network create rabbits` run local docker network called rabbit-1 every instance will run in the same network.

`docker run -d --rm --net rabbits --hostname rabbit-1 --name rabbit-1 rabbitmq:3.8`
