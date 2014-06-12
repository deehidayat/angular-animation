angular.module('DeeAngular', ['ui.bootstrap', 'ui.router', 'DeeDirective']).config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

    var home = {
        name:'home',
        url:'/',
        views : {
            '@' : {
                templateUrl:'./pages/home.html',
                controller : 'HomeCtrl'
            }
        },
        controller:'HomeCtrl'
    };

    // Default page ketika pertama kali load halaman
    $urlRouterProvider.otherwise(home.url);

    // Daftarkan state ke stateProvider
    $stateProvider.state(home);
}]).controller('HomeCtrl',['$scope',function($scope){
    // console.log('homectrl');
}]).run([function(){
    // console.log('run');
}]);
