const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const argv = require('yargs').argv;
const CONFIG = require('./utils').CONFIG;

(async function () {
    let http_port = argv.http_port ? argv.http_port : 443;

    // express
    const app = express();

    server = http.createServer(app);

    app.use(bodyParser.raw({
        type: 'application/json',
        limit: '20mb'
    }));


    app.use(function (req, res, next) {
        if (!!req.originalUrl) {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            console.log(`${ip} Request: ${req.method} originalUrl: ${req.originalUrl}`);
        }
        next();
    });

    app.use(function (req, res, next) {
        if (req.body) {
            if (req.headers['content-type'] === 'application/json') {
                try {
                    req.body = JSON.parse(req.body);
                    if (!req.body) throw new Error();
                } catch (e) {
                    res.status(400).json({"error": "failed parsing JSON", "exception": e});
                    return;
                }
            }
        } else {
            res.status(400).json({"error": "missing body"});
            return;
        }

        next();
    });

    const router = require('./routes/index');
    app.use('/', router);

    const Service = require('./service');
    server.listen(http_port);
    console.log(`${CONFIG.service_name} is running @ port ${http_port}`);
    await Service.init(argv.state,app);
    await Service.run();
})();
