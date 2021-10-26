
## Description

Skeleton service contains network infrustructre, can handle messages online (using HTTP & websocket) and offline (using rabbit mq).


## Instructions

### RUN COMMANDS

### online
node index.js --http_port=<http_port> --ws_port=<ws_port> --state=online
### offline
node index.js --http_port=<http_port> --state=offline
