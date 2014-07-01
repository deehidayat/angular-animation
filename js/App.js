angular.module('DeeAngular', ['ui.bootstrap', 'ui.router', 'DeeDirective']).config(['$stateProvider', '$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

    var home = {
        name:'home',
        url:'/?dev',
        views : {
            '@' : {
                templateUrl:'./pages/home.html',
                controller : 'HomeCtrl'
            }
        },
        controller:'HomeCtrl'
    };

    // Default page ketika pertama kali load halaman
    $urlRouterProvider.otherwise(home.url, {dev:true});

    // Daftarkan state ke stateProvider
    $stateProvider.state(home);
}]).controller('HomeCtrl',['$scope', '$modal', function($scope, $modal){
}]).run([function(){
    // console.log('run');
}]);
