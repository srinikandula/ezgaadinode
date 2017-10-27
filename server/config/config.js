module.exports = {
    jwt: {
        secret: "info@easygaadi.com",
        options: {expiresIn: 60 * 60 * 24}
    },
    mongo:{
        url: 'mongodb://localhost/easygaadi'
    },
    port: 3000
};
