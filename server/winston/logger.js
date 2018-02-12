var winston = require('winston');

function getLogger(module) {
    var logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        datePattern: 'dd-MM-yyyy.',
        transports: [
            new winston.transports.File({filename: __dirname.replace('winston', 'logs/combined.log')})
        ]
    });

    if (process.env.NODE_ENV !== 'production') {
        logger.add(new winston.transports.Console());
    }

    return logger;
}

module.exports = getLogger;