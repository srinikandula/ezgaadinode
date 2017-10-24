app.factory('Utils', function ($http) {
    return {
        isValidEmail: function (email) {
            return _.isString(email) && /^[a-zA-Z]\S*@\S+.\S+/.test(email)
        },

        isValidPassword: function (password) {
            password = password.trim();
            return _.isString(password) && (password.length > 7)
        },
        isLoggedIn: function() {
            return !!$cookies.get('token');
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
        }
    }
});

app.factory('AdminServices', function ($http, $cookies) {
    return {
        addAccount: function (accountInfo, success, error) {
            $http({
                url: '/v1/admin/accounts/add',
                method: "POST",
                data: accountInfo
            }).then(success, error)
        }
    }
});