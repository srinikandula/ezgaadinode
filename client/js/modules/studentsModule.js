app.factory('studentService',['$http',function($http){
return{
    addStudent:function(params,success,error){
        $http({
            url:'v1/students',
            method:'post',
            data:params
        }).then(success,error)
    },
    getStudents:function(success,error){
      $http({
        url:'v1/students/getStudents',
        method:'get'
    
       }).then(success,error)
    },
}
}])

app.controller("studentController", ['$scope','$http','studentService',function($scope,$http,studentService)
{
$scope.addorupdatestudent=function()
{
    $scope.student={name:'',age:'',schoolName:''}
    var params=$scope.student;

    studentService.addStudent(params,function(success){
        if(success.data.status)
        {
            console.log("student data added successfully");
        }
        else{
            console.log("error while adding student data.")             
        }
      
      },
     function(error){
      console.log(error);
     }) 
    }
}])