const http = require("http");
const path = require("path");
const readline = require("readline");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

process.stdin.setEncoding("utf8");

require("dotenv").config({
    path: path.resolve(__dirname, "credentialsDontPost/.env"),
    quiet: true,
});

if (process.argv.length != 3) {
  process.stdout.write(`Usage: node app.js <port_number>`);
  process.exit(1);
}

const port = process.argv[2];
const app = express();

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongoose connected successfully");
    } catch (err) {
        console.error("Mongoose connection error:", err);
    }
})();

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "templates"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.resolve(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

/* stockRoutes.js as middleware */
const stockRoutes = require("./routes/stockRoutes");
app.use("/", stockRoutes);

const rl = readline.createInterface({ 
    input: process.stdin,
    output: process.stdout,
    prompt: 'Stop to shutdown the server: '
});

const server = app.listen(port, () => {
  console.log(`Web server started and running at http://localhost:${port}`);
  rl.prompt();
});

rl.on('line', (line) => {
  let cmd = line.trim();
  if (cmd === 'stop') {
    console.log("Shutting down the server"); 
    server.close();
    mongoose.disconnect();
    process.exit(0); 
  } else if (cmd.length > 0) {
    console.log(`Invalid command: ${cmd}`);
    rl.prompt();
  }
});