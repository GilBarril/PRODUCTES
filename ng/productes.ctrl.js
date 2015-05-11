angular.module('appLearn')
.controller('ProductesController', function($scope, ProductesServei, SocketSrv, $location) {
       var id;
       $scope.productes=[];
     

      $scope.$on('newProduct',function(e,p){
          
          console.log("llista a producte"+e);
          $scope.$apply(function() {$scope.productes.unshift(p)});
          
      });    
    
      $scope.$on('updateProduct',function(e,p){
        
          $scope.productes.forEach(function(b,i,a){
                if(b._id==p._id){
                    a[i]=p;
                    console.log(b);
                }
          })
          
          $scope.$apply();
          
      });    
     $scope.$on('deleteProduct',function(e,p){
    
         $scope.productes.forEach(function(b,i,a){
                if(b._id==p){
                    a.splice(i,1);
                    
                }
          })
         console.log($scope.productes);
          $scope.$apply();
          
      }); 
    
      ProductesServei.srv.query(function(productes) {
          $scope.productes = productes;
      });
      $scope.refresh = function() {
          ProductesServei.srv.query(function(productes) {
              $scope.productes = productes;
          });
      }
      $scope.editarproducte = function(producte) {
          $scope.nomE = producte.nom;
          $scope.preuE = producte.preu;
         // $scope.productepereditar = producte;
          ProductesServei.edita =producte;
          $location.path('/editarProducte');
      }
     
      $scope.borrarproducte = function(producte) {
          ProductesServei.srv.remove({id:producte.nom});
          $scope.refresh();
      }
  });