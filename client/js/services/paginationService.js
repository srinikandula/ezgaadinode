angular.module('paginationService', ['ngTable'])

    .factory('paginationService', function () {
        return {
            pagination: function (tableParams, callback) {
                var sortingProps = tableParams.sorting();
                // for (var prop in sortingProps) {
                //     if(sortingProps[prop] == "asc"){
                //         sortingProps[prop] = 1;
                //     }else if (sortingProps[prop] == "desc"){
                //         sortingProps[prop] = -1;
                //     }
                // }
                console.log("Sorting options are "+ sortingProps);
                callback(sortingProps);
            }
        }
    });