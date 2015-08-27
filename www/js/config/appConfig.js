var app = angular.module('app.config', []);
app.constant('ENVIRONMENT',{'staging':1,'production':2})
app.constant('REQUEST',{'authenticated':1,'non_authenticated':2,'media_upload':3})
//Will add configration related code here. mostly returning the URLs based on the environemt and later on more environment specific changes may come
app.provider('config',function(ENVIRONMENT){
	var environment;
	var staging_endpoint = "http://mirfan.pythonanywhere.com/api/";
	var production_endpoint = "http://192.169.198.218/~contactapp/public/index.php/";
	return {
		setEnvironment: function(env)
		{
			environment = env
		},
		getBaseURL: function()
		{
			if (environment == ENVIRONMENT.staging)
			{
				return staging_endpoint;
			}
			else 
			{
				return production_endpoint;
			}
		},
		$get: function () {
			return {
				environment: environment,
				base_url : this.getBaseURL()
			}
		}
	}
});