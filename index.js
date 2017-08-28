#!/usr/bin/env node

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const child_process = require('child_process');
const env = require('process').env;

const PORT = env.PORT || 3000;
const FUSS = env.FUSS || "fuss";

app.use(express.static('static'));
app.use(bodyParser.json());

app.post('/compile', function (req, res) {

    if(!req.body || typeof req.body.fuss != "string"){
        res.sendStatus(400)
        return
    }

    const text = req.body.fuss;
    const fuss = child_process.spawn(FUSS, []);

    let stdout = "";
    let stderr = "";
    let bError = false;

    fuss.stdout.on('data', (data) => { stdout += data });
    fuss.stderr.on('data', (data) => { stderr += data });
    fuss.stdin.write(text);
    fuss.stdin.end();

    fuss.on('error', (err) => {
        bError = true;
        res.json({ error: `error running fuss: ${err}` })
    });
    fuss.on('close', (code) => {
        if(bError){
            return;
        }
        if (code !== 0) {
            res.json({ error: `fuss exited with non-zero code` });
            return;
        }
        res.json({
            output: stdout,
            error: stderr
        });
    });

})

app.listen(PORT, function () {
    console.log(`Started on port: ${PORT}`);
    console.log(`fuss command:    ${FUSS}`);
    console.log(`Pass {"css": "your-css"} to /compile to get back compiled FUSS.`);
})