#! /usr/bin/env bash

docker rm -f pilpoll
docker build -t pilpoll .
docker run -p 5984:5984 -d --name pilpolldb couchdb:1.7.1
docker run --name pilpoll --link pilpolldb:couchdb -p 5000:5000 pilpoll
