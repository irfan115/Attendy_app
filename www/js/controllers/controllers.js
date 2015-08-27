angular.module('app.controllers', [])

.controller('dashCtrl', function($scope, $state, StorageManager) {

        $scope.logOut = function(){
            StorageManager.setObject("token", {});
            $state.go('login');
        };
    })

.controller('HomeCtrl', function($scope, $location, $state, $ionicPopup, StorageManager, UserManager) {

        $scope.user = {};

        $scope.loginUser = function(user){
            if(user.email == ""){alert("please enter emai");return}
            if(user.password == ""){alert("please enter password");return}
            UserManager.loginUser(user)
                .then(function (data){
                    if(data.success){
                        StorageManager.setObject("token", data.token);
//                        $ionicPopup.alert({
//                            title: "Success",
//                            content: data.message
//                        });
                        $state.go('app.classes');
                    }
                    else{
                        console.log(data);
                        if(data.errors)
                            errors = data.errors.join("\r\n");
                        else errors = data.message;
                        $ionicPopup.alert({
                            title: "Errors!",
                            content: errors
                        });
                    }

                }, function (error) {
                    $ionicPopup.alert({
                        title: "Errors!",
                        content: error.message
                    });
                    $state.go('login');
            })

        };

})
    .controller('AttednyCtrl', function($scope, $state, $cordovaToast, $stateParams,
                                        StorageManager, classes, UserManager, $rootScope, PushFactory) {

        $scope.user = {};
        $scope.classes = classes;
        $scope.students = {};
        $scope.attendance = {};
        $scope.today = new Date();

        var monthNames = [ "Jan", "Feb", "March", "April", "May", "June",
                "July", "Aug", "Sep", "Oct", "Nov", "Dec" ];
            $scope.weekDates = [];

        $scope.getStudents = function(class_id, batch_id){
            $state.go('app.see_attendance', {"class_id":class_id, "batch_id":batch_id, "date":new Date().toDateString()});
        }

        $rootScope.selectDate = function(date){
            console.log(date);
            date = new Date(date);
            $state.go('app.see_attendance', { "class_id":$stateParams.class_id, "batch_id":$stateParams.batch_id, "date": date.toDateString()});
        };

        $scope.getBatchStudents = function(batch_id, class_id){

            var d = new Date($stateParams.date + " UTC");
            param = "?date="+d.yyMmDd()+"&student_class=" + class_id
            UserManager.getAttendance(param)
                    .then(function(data)
                    {
                        $scope.attendance = data;

                    }
              );

              UserManager.getBatchStudents(batch_id)
                    .then(function(data)
                    {
                        $scope.students = data;

                    }
              );
        };       

        $scope.doRefresh = function(id){
              UserManager.getClasses()
                    .then(function(data)
                    {
                        $scope.classes = data;

                    }
              );
        };

        $scope.student_ids = {"ids":[]};

        $scope.goBack = function(){
            window.history.back();
        };


        $scope.markComplete = function() {
            console.log("logging");
            console.log($scope.student_ids);
            angular.forEach($scope.student_ids.ids, function(value, key) {
            data = {"student_class":$stateParams.class_id, "student":value, "date":new Date(new Date() + " UTC")};
            UserManager.postAttendence(data)
                    .then(function(data)
                    {
                        console.log(data);
                    }
              );
            });

            $cordovaToast.showLongBottom('Attendance Marked')
                .then(function(success) {

                }, function(error) {
                    //$scope.reloadList();
                });

        };


        $scope.reloadList = function(){

            if($stateParams.batch_id)
            {
               $scope.getBatchStudents($stateParams.batch_id, $stateParams.class_id);
            }

            else $scope.doRefresh('');

            $scope.$broadcast('scroll.refreshComplete');

            $cordovaToast.showLongBottom('Loaded')
                .then(function(success) {

                }, function(error) {
                    // Handle error
                });
        };

        if($stateParams.batch_id){
             $scope.getBatchStudents($stateParams.batch_id, $stateParams.class_id);
        }

        if($stateParams.date){
            $scope.selectedDate = new Date($stateParams.date);
            $scope.selectedMonth = monthNames[$scope.selectedDate.getMonth()];
            var weekDays = ['S','M','T','W','T','F','S'];
            var Dates = new Date().getWeek($stateParams.date);
            for(var i=0; i<Dates.length;i++){
                if(Dates[i].getDate() == new Date().getDate()){
                    
                    if(Dates[i].getDate() == new Date($stateParams.date).getDate())
                        $scope.weekDates[i] = {dateString:Dates[i].toDateString(),day:weekDays[i],date:Dates[i].getDate(),class:"_current _selected"};
                    else
                        $scope.weekDates[i] = {dateString:Dates[i].toDateString(),day:weekDays[i],date:Dates[i].getDate(),class:"_current"};
                }
                else if(Dates[i].getDate() == new Date($stateParams.date).getDate())
                    $scope.weekDates[i] = {dateString:Dates[i].toDateString(),day:weekDays[i],date:Dates[i].getDate(),class:"_selected"};
                
                else
                    $scope.weekDates[i]= {dateString:Dates[i].toDateString(),day:weekDays[i],date:Dates[i].getDate()};
                
                if(Dates[i].getDate()<10 && 'class' in $scope.weekDates[i] ){
                    $scope.weekDates[i]['circle'] = true;
                }else{
                    $scope.weekDates[i]['circle'] = false;
                }
            }
        } 

        $scope.onSwipeLeft = function(){
            var date = new Date($scope.selectedDate.getFullYear(), $scope.selectedDate.getMonth(), $scope.selectedDate.getDate()+1);
            $state.go('app.see_attendance', { "class_id":$stateParams.class_id, "batch_id":$stateParams.batch_id, date: date.toDateString()});

        };

        $scope.onSwipeRight = function(){
            var date = new Date($scope.selectedDate.getFullYear(), $scope.selectedDate.getMonth(), $scope.selectedDate.getDate()-1);                                             
             $state.go('app.see_attendance', { "class_id":$stateParams.class_id, "batch_id":$stateParams.batch_id, date: date.toDateString()});
        }; 



    });

    Date.prototype.getWeek =function (start)
    {
        var week = [];
        var curr = new Date(start); // get current date
        var first = curr.getDate()- curr.getDay();//to set first day on monday, not on sunday, first+1 :
        for (var i = 0; i < 7; i++) {
            var next = new Date(curr.getTime());
            next.setDate(first + i);
            week.push(next);
            //week[i] = next;
        }

        return week;
    };

    Date.prototype.yyMmDd = function() {

        var yy = this.getFullYear().toString();
        var mm = (this.getMonth() + 1).toString();
        var dd = this.getDate().toString();

        var date = yy +"-"+ (mm[1]?mm:"0" + mm[0]) +"-"+ (dd[1]?dd:"0"+dd[0]);
         console.log(date);
        return  date;
    };