/**
 * Created by imrantufail on 16/03/15.
 */

(function(){
    'use strict';

    angular
        .module('app.services')
        .factory('StorageManager', StorageManager)
        .service('UtilsFactory', UtilsFactory)
        .factory('RequestManager', RequestManager)
        .service('UserManager', UserManager)
        .service('MessageManager', MessageManager)
        .service('DeviceManager', DeviceManager)
        .factory('PushFactory', PushFactory);

    PushFactory.$inject =['StorageManager', '$cordovaDialogs', '$cordovaPush', 'UserManager']
    function PushFactory(StorageManager, $cordovaDialogs, $cordovaPush, UserManager){

        return {

            androidConfig : function(){
                return {
                    "senderID": "339839877410"
                };
            },

            registerDevice : function(){
                $cordovaPush.register(this.androidConfig()).then(function(result) {
                    console.log("hey");
                    console.log(result);
                    // Success
                }, function(err) {
                    console.log(err);
                    // Error
                });
            },

            getUDID : function(){
                var device_udid = StorageManager.getValue('udid');
                return device_udid;
            },

            onNotificationReceived : function(event, notification){
                if (ionic.Platform.isAndroid()) {
                    this.handleAndroid(notification);
                }
                else if (ionic.Platform.isIOS()) {
                    this.handleIOS(notification);
                }
            },

            handleAndroid : function(notification){
                if (notification.event == 'registered') {
                    console.log("udid");
                    console.log(notification.regid);
                    StorageManager.setValue('udid', notification.regid);
                    var user_data = StorageManager.getObject("user_info");

                    user_data.device_id = 112233;
                    user_data.device_udid = this.getUDID();

                    UserManager.updateUser(user_data)
                        .then(function (data){

                        });
                }
                else if (notification.event == 'message') {
                    console.log(notification);
                    $cordovaDialogs.alert(notification.payload.title, notification.payload.message);
                }
                else if (notification.event == 'error') {
                    $cordovaDialogs.alert(notification.msg, "Push notification error event");
                } else {
                    $cordovaDialogs.alert(notification.event, "Push notification handler - Unprocessed Event");
                }
            }
        }
    }


    StorageManager.$inject =['$ionicLoading']
    function StorageManager($ionicLoading){
        return {
            setValue: function(key, value) {
                localStorage[key] = value;
            },
            getValue: function(key, defaultValue) {
                return localStorage[key] || defaultValue;
            },
            setObject: function(key, value) {
                localStorage[key] = JSON.stringify(value);
            },
            getObject: function(key) {
                try
                {
                    if(localStorage[key])return JSON.parse(localStorage[key]);
                    else return undefined;
                }
                catch(err)
                {
                    return err;
                }
            },
            deleteByKey: function(key) {
                localStorage.removeItem(key)
            }
        }
    }

    UtilsFactory.$inject =['StorageManager', 'REQUEST']
    function UtilsFactory(StorageManager, REQUEST){
        return {
            'getRequestHeaders': function (type) {
                var request_headers = {
                    'Accept': '*/*',
                    'Content-Type': 'application/json;charset=UTF-8',
                    'Access-Control-Allow-Origin': '*'
                };

                if (type == REQUEST.authenticated) {
                    var token = StorageManager.getObject('token');
                    request_headers['Authorization'] = "Token "+token;
                }
                else if (type==REQUEST.media_upload){
                    var token = StorageManager.getObject('token');
                    request_headers['Authorization'] = "Token "+token;
                    request_headers['Connection'] = "close";
                }
                console.log(request_headers);
                console.log("type = "+type);
                return request_headers;
            }
        }
    }

    RequestManager.$inject =['$rootScope','$http', '$q', '$ionicLoading', 'config', 'REQUEST', 'UtilsFactory']
    function RequestManager($rootScope, $http, $q, $ionicLoading, config,  REQUEST, UtilsFactory){
        delete $http.defaults.headers.common['X-Requested-With'];
        $http.defaults.useXDomain = true;
        return {
            get: function (url, type) {
                var request_headers = UtilsFactory.getRequestHeaders(type);
                $ionicLoading.show();
                var deferred = $q.defer();
                $http({
                    method: "get",
                    url: config.base_url + url,
                    headers: request_headers
                }).success(function (data) {
                    deferred.resolve(data);
                    $ionicLoading.hide();

                }).error(function (err) {
                    console.log(err);
                    deferred.reject(err);
                    $ionicLoading.hide();

                });
                return deferred.promise;
            },
            post: function (url, type, data) {
                var request_headers = UtilsFactory.getRequestHeaders(type);
                $ionicLoading.show();
                var deferred = $q.defer();
                $http({
                    method: "post",
                    url: config.base_url + url,
                    headers: request_headers,
                    data: data
                }).success(function (data) {
                    deferred.resolve(data);
                    $ionicLoading.hide();
                }).error(function (data) {
                    deferred.reject(data);
                    $ionicLoading.hide();
                });
                return deferred.promise;
            },
            put: function (url, type, data) {
                var request_headers = UtilsFactory.getRequestHeaders(type);
                $ionicLoading.show();
                var deferred = $q.defer();
                $http({
                    method: "put",
                    url: config.base_url + url,
                    headers: request_headers,
                    data: data
                }).success(function (data) {
                    deferred.resolve(data);
                    $ionicLoading.hide();
                }).error(function (data) {
                    deferred.reject(data);
                    $ionicLoading.hide();
                });
                return deferred.promise;
            }
        }
    }

    UserManager.$inject =['RequestManager', 'REQUEST', 'StorageManager']
    function UserManager(RequestManager,REQUEST,StorageManager){
        return{

            updateUser:function(userData)
            {
                return RequestManager.put('user',REQUEST.non_authenticated,userData)
            },
            getBatchStudents:function(batch_id)
            {
                return RequestManager.get('class/students/'+batch_id, REQUEST.authenticated);
            },
            registerUser:function(userData)
            {
                return RequestManager.post('user',REQUEST.non_authenticated,userData)
            },
            loginUser:function(userData)
            {
                return RequestManager.post('login/',REQUEST.non_authenticated,userData)
            },
            postAttendence:function(userData)
            {
                return RequestManager.post('class/attendence/',REQUEST.authenticated,userData)
            },
            getClasses:function()
            {
                return RequestManager.get('class/',REQUEST.authenticated)
            },
            getAttendance:function(param)
            {
                return RequestManager.get('class/attendance'+param,REQUEST.authenticated)
            }

        }

    }

    MessageManager.$inject =['RequestManager', 'REQUEST', 'StorageManager']
    function MessageManager(RequestManager,REQUEST,StorageManager){
        return{
            sendContactRequest:function(device_id)
            {
                return RequestManager.get('contact_request/'+device_id, REQUEST.non_authenticated);
            },
            getAllMessages:function(params)
            {
                return RequestManager.get('messages?'+params, REQUEST.non_authenticated);
            }
            ,
            getUserUnreadMessages:function(user_id)
            {
                return RequestManager.get('get_unread_messages_by_sender?sender_id='+user_id, REQUEST.non_authenticated);
            },
            getMessageShouts:function(message_id)
            {
                return RequestManager.get('message/shouts?message_id='+message_id,REQUEST.non_authenticated)
            }
            ,
            getCompletedMessages:function(message_id)
            {
                return RequestManager.get('message/completed/shouts?message_id='+message_id,REQUEST.non_authenticated)
            },
            markComplete:function(userData)
            {
                return RequestManager.post('message/complete', REQUEST.non_authenticated, userData)
            },
            markRead:function(data)
            {
                return RequestManager.post('message/update', REQUEST.non_authenticated, data);
            },
            sendPush:function(data)
            {
                return RequestManager.post('message/push', REQUEST.non_authenticated, data);
            }
        }

    }

    DeviceManager.$inject =['$cordovaDevice']
    function DeviceManager($cordovaDevice){

        return{

            getUUID:function()
            {
                try {

                    var uuid = $cordovaDevice.getUUID();
                    console.log(uuid);
                    return uuid;

                }
                catch (err) {
                    console.log("Error " + err.message);
                    return null;
                }
            },
            getDevice:function()
            {
                try {
                    var device = $cordovaDevice.getDevice();
                    console.log(device);
                    return device;

                }
                catch (err) {
                    console.log("Error " + err.message);
                    return null;
                }
            }
        }

    }



})();