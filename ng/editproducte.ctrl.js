angular.module('appLearn')
    .controller('Editaproductecontroller',function($scope,$location,ProductesServei) {
    $scope.preuS;
    $scope.nomE = ProductesServei.edita.nom;
    $scope.preuE = ProductesServei.edita.preu;
    $scope.productepereditar=ProductesServei.edita;
    $scope.modificarproducte = function() {
          ProductesServei.srv.update({id:$scope.productepereditar.nom}, {
              nom: $scope.nomE,
              preu: $scope.preuE
          }, function(producte) {
             
              $location.path('/');
          });
         
      }
 });