app.directive('customizedFileUpload', function ($rootScope,Upload,$http) {
    return {
        restrict: 'E',
        scope: {
            ngModel: "=",
            folder:"=",

        },
        template:   '<div class="form-group " ng-repeat="f in files">\n' +
        '<input type="file"   class="form-control"  ng-model="f" ngf-select   placeholder="Upload File"                 ng-change="uploadFile($index,f);"/>\n' +
            '<h5 style="color: red;" ng-show="$last">{{errMsg}}</h5>' +
        '<div>' +
        '<button class="btn btn-xs btn-danger" style="float: right ;margin: 2px" ng-show="!$last" ng-click="removeFile($index)">-</button>'+
        '<button class="btn btn-xs btn-info " style="float: right;margin: 2px" ng-show="$last" ng-click="addFile();">+</button>'+
        '</div>' +


        '</div> \n',
        require: 'ngModel',
        link: function (scope) {
            scope.errMsg=undefined;
            if(!scope.ngModel){
                scope.ngModel=[{}];
            };
            if(!scope.files){
                scope.files=[{}];
            };
            scope.addFile=function () {
                if(scope.ngModel[scope.ngModel.length-1].key){
                    scope.ngModel.push({});
                    scope.files.push({});
                    scope.errMsg=undefined;
                }else{
                    scope.errMsg="Please upload file";
                }

            };
            scope.removeFile=function (index) {
                $http({
                    url: '/v1/events/deleteFile',
                    method: "DELETE",
                    params:{
                        key:scope.ngModel[index].key
                    }
                }).then(function (success) {
                    if(success.data.status){
                        scope.ngModel.splice(index, 1);
                        scope.files.splice(index, 1);
                    }else{
                        scope.errMsg=success.data.messages[0];
                    }

                }, function (error) {

                })

            };
            scope.uploadFile=function (index,file) {
                Upload.upload({
                    url: '/v1/events/uploadFile',
                    data: {
                        files: file,
                        content:{
                            folder:scope.folder
                        }
                    },
                }).then(function (success) {
                    if (success.data.status) {
                        scope.ngModel[index]=success.data.data;
                        scope.errMsg=undefined;
                    } else {
                        scope.errMsg=success.data.messages[0];
                    }
                });

            }


        }
    };

});