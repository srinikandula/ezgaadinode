app.factory('Utils', function ($http, $cookies) {
    return {
        isValidEmail: function (email) {
            return _.isString(email) && /^[a-zA-Z]\S*@\S+.\S+/.test(email)
        },
        isValidPassword: function (password) {
            password = password.trim();
            return _.isString(password) && (password.length > 7)
        },
        isLoggedIn: function () {
            return !!$cookies.get('token');
        },
        logout: function () {
            $cookies.remove('token');
            $cookies.remove('editAccounts');
            $cookies.remove('role');
            $cookies.remove('userName');
        },
        isValidPhoneNumber: function(phNumber) {
            return phNumber && /^[1-9]\d{9}$/.test(phNumber);
        }
    }
});

app.factory('CommonServices', function ($http) {
    return {
        login: function (loginData, success, error) {
            $http({
                url: '/v1/group/login',
                method: "POST",
                data: loginData
            }).then(success, error)
        }
    }
});