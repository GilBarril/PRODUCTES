angular.module('appLearn')
    .controller('Editabotigacontroller',function($scope,$location,BotiguesServei) {
    
    $scope.nomE = BotiguesServei.edita.nom;
    $scope.poblacioE = BotiguesServei.edita.poblacio;
    $scope.botigapereditar=BotiguesServei.edita;
    $scope.modificarbotiga = function() {
          BotiguesServei.srv.update({id:$scope.botigapereditar.nom}, {
              nom: $scope.nomE,
              poblacio: $scope.poblacioE
          }, function(botiga) {
             
              $location.path('/botigues');
          });
         
      }
 });