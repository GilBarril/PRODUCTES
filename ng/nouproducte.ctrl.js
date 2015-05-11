angular.module('appLearn')
    .controller('Nouproductecontroller',function($scope,$location,ProductesServei,BotiguesServei) {
        BotiguesServei.srv.query(function(botigues) {
          $scope.botigues = botigues;
      });
    
    
    $scope.botiques = [];
    
        $scope.afegirproducte = function() {
          ProductesServei.srv.save({
              Botiga: $scope.botiques,
              nom: $scope.nom,
              preu: $scope.preu,
              existencies: $scope.existencies
          }, function() {
              $location.path("/");
          });
          
      }
        
        
        $scope.toggle = function(buti) {
            var aux = $scope.botiques.indexOf(buti);
            
            if (aux == -1) {
                $scope.botiques.push(buti);
            } else {
                $scope.botiques.splice(aux, 1);
            }
            
        };
        
        
 });