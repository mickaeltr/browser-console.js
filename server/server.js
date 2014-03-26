(function () {
    "use strict";

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

    app.get("/lib/console.js", function (req, res) {
        res.sendfile(path.resolve("../lib/console.js"));
    });

    app.post("/logs", function (req, res) {
        try {
            var method = req.body.level;
            if (console[method]) {
                console[method].call(this,
                    "[" + req.get("Referer") + "] " + req.get("User-Agent") + "\n" +
                        (req.body.message ? req.body.message + "\n" : "") +
                        (req.body.stackTrace ? req.body.stackTrace + "\n" : "")
                );
            }
        } catch (ignored) {
        }
        res.send(204);
    });

    console.log("Server running at http://localhost:" + port + "/\n");

}());