module.exports = {
    jwt: {
        secret: "info@easygaadi.com",
        options: {expiresIn: 60 * 60 * 24}
    },
    mongo:{
        url: 'mongodb://35.154.47.181/easygaadi'
    },
    port: 3000
};
