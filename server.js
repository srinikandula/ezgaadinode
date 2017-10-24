var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();

var Users = require('./server/routes/users');
var config = require('./server/config/config');

var authMiddleware = require('./server/middleware/auth');

app.set('port', config.port);
app.use(morgan('dev'));
// app.use(express.static('client', {index: "/views/index.html"}));

app.use(bodyParser.json({limit: config.bodyParserLimit}));
// app.use(bodyParser.urlencoded({limit: config.bodyParserLimit, extended: true}));
app.use(cookieParser());

app.use(function (req, res, next) {
    if (/^\/v1\//.test(req.url)) {
        next();
    } else {
        res.sendFile(__dirname + '/client/views/index.html');
    }
});

app.use('/v1/user', Users.OpenRouter);

app.use(authMiddleware);

app.use('/v1/user', Users.AuthRouter);

var server = app.listen(app.get('port'), function () {
    console.log('Listening on port ' + server.address().port);
});
