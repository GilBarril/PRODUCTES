angular.module('appLearn')
.controller('BotiguesController', function($scope, BotiguesServei, $location) {
      var id;
      BotiguesServei.srv.query(function(botigues) {
          $scope.botigues = botigues;
      });
      $scope.refresh = function() {
          BotiguesServei.srv.query(function(botigues) {
              $scope.botigues = botigues;
          });
      }
      $scope.editarbotiga = function(botiga) {
          $scope.nomE = botiga.nom;
          $scope.poblacioE = botiga.poblacio;
         // $scope.productepereditar = producte;
          BotiguesServei.edita =botiga;
          $location.path('/editarBotiga');
      }
     
      $scope.borrarbotiga = function(botiga) {
          BotiguesServei.srv.remove({id:botiga.nom});
          $scope.refresh();
      }
  });