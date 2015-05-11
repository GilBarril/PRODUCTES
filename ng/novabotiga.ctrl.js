angular.module('appLearn')
    .controller('Novabotigacontroller',function($scope,$location,BotiguesServei) {
        $scope.afegirbotiga = function() {
          BotiguesServei.srv.save({
              nom: $scope.nom,
              poblacio: $scope.poblacio,
             
          },function() {
               $location.path("/botigues");
          });
         
      }
 });