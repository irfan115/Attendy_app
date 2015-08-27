var app = angular.module('app.routes', []);

//routing defined here
app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

        // setup an abstract state for the tabs directive

        .state('login' , {
            url: "/login",
            templateUrl:"templates/login.html",
            controller:"HomeCtrl"
        })
        .state('main' , {
            url: "/main",
            controller: function(StorageManager, $state){

                var user = StorageManager.getObject("token");
                console.log("user found on login");
                console.log(user);

                if (typeof user == 'undefined') {
                    // User isn’t authenticated

                    $state.go( "login" );
                    //event.preventDefault();
                }
                else{
                    $state.go( "app.classes" );
                }
            }
        })

        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "templates/menu.html",
            controller: 'dashCtrl'

        })
        .state('app.classes', {
            url: "/classes",
            views: {
                    'menuContent': {
                       templateUrl: "templates/classes.html",
                        controller: 'AttednyCtrl'
                    }
                },

            resolve : {
                classes : function(UserManager){
                    return UserManager.getClasses();
                }
            }
        })
        .state('app.class_students', {
            url: "/students/:class_id/:batch_id",
            views: {
                'menuContent': {
                    templateUrl: "templates/students.html",
                    controller: 'AttednyCtrl'
                }
            },

            resolve : {
                classes : function(UserManager){
                    return {};
                }
            }
        })
        .state('app.see_attendance', {
            url: "/see_attendance/:class_id/:batch_id/:date",
            views: {
                'menuContent': {
                    templateUrl: "templates/students.html",
                    controller: 'AttednyCtrl'
                }
            },

            resolve : {
                classes : function(UserManager){
                    return {};
                }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/main');

});