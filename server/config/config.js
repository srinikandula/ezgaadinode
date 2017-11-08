module.exports = {
    jwt: {
        secret: "info@easygaadi.com",
        options: {expiresIn: 60 * 60 * 24}
    },
    mongo:{
        url: 'mongodb://localhost/easygaadi'
    },
    smtp: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'easygaadinode@gmail.com',
            pass: 'easygaadi123'
        }
    },
    port: 3000
};
