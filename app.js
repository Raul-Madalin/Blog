require('dotenv').config();

const express = require('express');
const cluster = require('cluster');
const os = require('os');

const app = express();
const PORT = process.env.PORT;

if (cluster.isMaster) {
    const numCPUs = os.cpus().length;

    console.log(`Master process ${process.pid} is running`);
    console.log(`Forking server for ${numCPUs} CPUs...\n`);

    // Fork workers for each CPU core
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Listen for worker exits and restart them if necessary
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} exited. Restarting...`);
        cluster.fork();
    });
    
} else {
    app.get('/', (req, res) => {
        res.send('Hello, Express!');
    });

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started`);
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}