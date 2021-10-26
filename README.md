
## Description

* Name parser is a project that will get full name with prefix and suffix extract the first and last name and return if the name is valid or not,

* clone from Skeleton service contains network infrustructre, can handle messages online (using HTTP & websocket) and offline (using rabbit mq).

* In this case support only offline mode.

* Using parse-full-name package.

## Instructions
For using rabbit mq you have two options:
1. connect to rabbit with username: guest, password: guest
2. change the username & password on config.json

### RUN COMMANDS

## npm start
run the project on port 9004

## terminal command
node index.js --http_port=<http_port> --state=offline
