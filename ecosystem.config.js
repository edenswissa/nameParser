module.exports = {
    apps: [
        {
            name: "service-online",
            script: "index.js",
            args: "--port=443 --wss_port=1337 --state=online",
        },
        {
            name: "service-offline",
            script: "index.js",
            args: "--port=443 --state=offline",
        }
    ]
};


