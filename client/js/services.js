app.factory('ValidatorService', function ($http) {
    return {
        isValidEmail: function (email) {
            return _.isString(email) && /^[a-zA-Z]\S*@\S+.\S+/.test(email)
        },

        isValidPassword: function (password) {
            password = password.trim();
            return _.isString(password) && (password.length > 7)
        }
    }
});


app.factory('CommonServices', function ($http, $cookies) {
    return {
        login: function (loginData, success, error) {
            $http({
                url: '/v1/user/login',
                method: "POST",
                data: loginData
            }).then(success, error)
        },
        isLoggedIn: function() {
            return !!$cookies.get('token');
        }
    }
});