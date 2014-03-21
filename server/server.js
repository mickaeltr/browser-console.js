var express = require("express"),
    path = require("path"),
    app = express(),
    port = 1337;

app.configure(function () {
    app.use(express.json());
});

app.listen(port);

app.get("/", function (req, res) {
    res.sendfile("index.html");
});

app.get("/console.js", function (req, res) {
    res.sendfile(path.resolve("../lib/console.js"));
});

app.post("/logs", function (req, res) {
    try {
        var method = req.body.level,
            message = req.body.message;
        if (console[method] && message) {
            console[method].call(this, message);
        }
    } catch (ignored) {
    }
    res.send(204);
});

console.log("Server running at http://localhost:" + port + "/");