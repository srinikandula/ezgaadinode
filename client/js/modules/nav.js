
app.controller('NavCtrl', ['$scope', '$state', 'Utils', 'AccountServices', '$cookies', '$rootScope', function ($scope, $state, Utils, AccountServices, $cookies, $rootScope) {
    $scope.logout = function () {
        Utils.logout();
        $cookies.remove('token');
        $cookies.remove('userName');
        $scope.displayName = "";
        $rootScope.loggedTrue();
        $state.go('login');
    };
    $scope.isLoggedIn = function () {
        return $cookies.get('token') != undefined;
    }
    $scope.loggedInName=function(){
        $scope.displayName=$cookies.get('userName');

    }
    $scope.loggedInName();

    $scope.isLoggedInn = '';

    $rootScope.loggedTrue = function () {
        if ($cookies.get('token')) {
            $scope.isLoggedInn = true;            
        }
        else {
            $scope.isLoggedInn = false;
            $state.go('login');
        }
    };
    $rootScope.loggedTrue();
    
    $scope.isLoggedin=$cookies.get('token');

    $scope.loginParams = {
        userName: '',
        password: '',
        contactPhone: '',
        email: '',
        errors: []
    };

   /* $scope.templates = {
        'myProfile': 'views/templates/userProfile/myProfile.html',
        'myGroup': 'views/templates/userProfile/myGroup.html',
        'addingGroup': 'views/templates/userProfile/addingGroup.html',
    }
    $scope.template = $scope.templates.myProfile;
    $scope.activated = 'myProfile';

    $scope.myProfile= function () {
        $scope.template = $scope.templates.myProfile;
        $scope.activated = 'myProfile';
    }
    $scope.myGroup= function () {
        $scope.template = $scope.templates.myGroup;
        $scope.activated = 'myGroup';
    }
    $scope.addingGroup= function () {
        $scope.template = $scope.templates.addingGroup;
        $scope.activated = 'addingGroup';
    }*/

}]).controller('LeftNavCtrl', ['$scope', '$rootScope', '$state', 'Utils', '$cookies', '$stateParams', function ($scope, $rootScope, $state, Utils, $cookies, $stateParams) {

    $scope.canEditAccounts = function () {
        return $cookies.get('editAccounts') == "true";
    };
 /*   $scope.templates = ['/views/templates/dashboard.html']*/

    $scope.erpReports = function () {
        $scope.template = $scope.templates[0];
        $scope.activated = 0;
    };

}]);