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
}]).controller('HomeCtrl',['$scope', '$modal', function($scope, $modal){
    // console.log('homectrl');
    $scope.openSetting = function() {
        createjs.Ticker.setPaused(!createjs.Ticker.getPaused());
        $modal.open({
            templateUrl : './pages/setting.html',
            backdrop : 'static',
            controller : ['$scope', '$modalInstance', function($scope, $modalInstance){
                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
            }],
        }).result.then(function(){
            createjs.Ticker.setPaused(false);
        }, function(){
            createjs.Ticker.setPaused(false);
        });
    };
    $scope.openHelp = function() {
        $modal.open({
            templateUrl : './pages/help.html',
            backdrop : 'static',
            controller : ['$scope', '$modalInstance', function($scope, $modalInstance){
                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
            }],
        });
    };
    $scope.openAbout = function() {
        $modal.open({
            templateUrl : './pages/about.html',
            backdrop : 'static',
            controller : ['$scope', '$modalInstance', function($scope, $modalInstance){
                $scope.close = function () {
                    $modalInstance.dismiss('close');
                };
            }],
        });
    };
}]).run([function(){
    // console.log('run');
}]);
