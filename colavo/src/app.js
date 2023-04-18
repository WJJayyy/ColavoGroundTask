"use strict";
exports.__esModule = true;
var express = require("express");
var app = express();
var port = 8000;
app.get('/', function (req, res) {
    res.send('Hello World!');
});
app.listen(port, function () {
    console.log("app listening at http://localhost:".concat(port, "!"));
});
