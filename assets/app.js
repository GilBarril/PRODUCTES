angular.module('appLearn', ['ngResource','ngRoute']);
angular.module('appLearn')
    .service('SocketSrv', function($rootScope) {
    
    var socket = io().connect();
    
    socket.on('newProduct',function(producte) {
      
        $rootScope.$broadcast('newProduct',producte);
        
    });
    socket.on('updateProduct',function(producte) {
      
        $rootScope.$broadcast('updateProduct',producte);
        
    });
    socket.on('deleteProduct',function(producte) {
      
        $rootScope.$broadcast('deleteProduct',producte);
        
    });
});
angular.module('appLearn')
    .controller("ApplicationController", function($scope,$location,UserSvc) {
        $scope.$on('login', function(e,user) {
            /*
                Quan s'ha fet login s'emet l'event "login"
                i això fa que la variable de l'scope "currentUser"
                li diem quin usuari s'ha autenticant, d'aquesta manera
                fem que apareguin diferents opcions al menú
            */
            $scope.currentUser = user;
        });
        $scope.logout = function(){
            /*
                Quan fem logout esborrem el token i la variable
                de l'$scope "currentUser", d'aquesta forma desapareixen
                els menús sensibles a la autenticació
            */
            UserSvc.logOut();
            delete $scope.currentUser;
            $location.path('/');
        };
    });
angular.module('appLearn')
.service("BotiguesServei", function($resource) {
     this.srv = $resource('/api/botigues/:id', null, {
          'update': {
              method: 'PUT'
          }
      });

  this.edita = null;
  return this;
    
  })
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
angular.module('appLearn')
    .controller("LoginController", function($scope,$location,UserSvc){
         
    
         $scope.$watchGroup(['username','password'],function(newVal, oldVal) {
                /*
                 * Vigilem les variables de l'$scope "username"
                 * i "password" per esborrar el missatge d'error
                 * si hi ha.
                 */
                if (newVal!=oldVal)
                    $scope.error=null;
                
            });
        $scope.login = function(username,password) {
            if (!username || !password) {
                $scope.error = "Has d'emplenar tots els camps";
            } else{
                UserSvc.login(username,password,
                    function(error,status) {
                        /*
                            Funció que s'executarà si hi ha un error en el login
                        */
                        if (status == 401) {
                                $scope.error = error.missatge;
                        }
                    }).success(function() {
                        UserSvc.getUser().then(function(user){
                            /*
                                Si tot va bé, anem a la pàgina principal
                                i emeten un missatge de "login" per avisar
                                a la nostra app que l'usuari ha fet login
                                correctament.
                            */
                            $scope.$emit('login', user.data);  
                            $location.path('/');
                        });
                    });
            }
        };
    });
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
angular.module('appLearn')
.service("ProductesServei", function($resource) {
     this.srv = $resource('/api/productes/:id', null, {
          'update': {
              method: 'PUT'
          }
      });

  this.edita = null;
  return this;
    
  })
angular.module('appLearn')
    .controller("RegistreController", function($scope,$location,UserSvc) {
        
        $scope.registre = function(username,password,password2) {
            
            $scope.$watchGroup(['username','password','password2'],function(newVal, oldVal) {
                if (newVal!=oldVal)
                    $scope.error=null;
                
            });
            if (!password || !password2 || !username){
                $scope.error = "Has d'emplenar tots els camps";
                
            }else if (password === password2){
                UserSvc.registre(username,password)
                    .success(function(user) {
                        $location.path('/login');
                    })
                    .error(function(error,status){
                        if (status == 409)
                            $scope.error = error.missatge;
                    });
            } else {
                $scope.error = "Les contrasenyes no són iguals";
            }
        };
    });
angular.module('appLearn').config(function($routeProvider, $locationProvider) {
    $routeProvider.when("/", {
        controller: 'ProductesController',
        templateUrl: 'producte.html',
        autoritzat: false
    }).when("/botigues", {
        controller: 'BotiguesController',
        templateUrl: 'botiga.html',
        autoritzat: false
    }).when("/editarBotiga", {
        controller: 'Editabotigacontroller',
        templateUrl: 'editarbotiga.html',
        autoritzat: false
    }).when("/nouproducte", {
        controller: 'Nouproductecontroller',
        templateUrl: 'creaproducte.html',
        autoritzat: false
    }).when("/novabotiga", {
        controller: 'Novabotigacontroller',
        templateUrl: 'crearbotiga.html',
        autoritzat: false
    }).when("/editarProducte", {
        controller: 'Editaproductecontroller',
        templateUrl: 'editarproducte.html',
        autoritzat: false
    }).when("/registre", {
                controller: "RegisterController",
                templateUrl: "registre.html",
                autoritzat: false
    }).when("/login", {
                controller: "LoginController",
                templateUrl: "login.html",
                autoritzat: false
    }).when("/registre", {
                controller: "RegistreController",
                templateUrl: "registre.html",
                autoritzat: false
    }).otherwise({
        redirectTo: '/'
    });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
}) .run(function($rootScope,UserSvc) {
        /*
            Cada vegada que canviem de pàgina se dispara el
            event $routeChangeStart,
            Si la pàgina que volem veure té la propietat 
            "autoritzat": a true i no ho està llavors no 
            farà el canvi
        */
        $rootScope.$on('$routeChangeStart', function(event, next) {
           if (next)
                if (!UserSvc.auth & next.autoritzat) 
                    event.preventDefault();
        });
});
angular.module('appLearn')
    .service('UserSvc', function($http) {
        var srv = this;
        srv.auth= false;
        srv.getUser = function() {
            return $http.get('/api/users');
        };
        srv.login = function (username, password,noLogin) {
            return $http.post('/api/sessions', {
                username: username,
                password: password
            }).success(function(data,status) {
                /*
                    Si l'autenticació és correcte li diem a l'angular que cada 
                    vegada que es comuniqui amb el servidor afegeixi el token 
                    al header 'x-auth'
                */
                $http.defaults.headers.common['x-auth'] = data;
                if (data) srv.auth = true;
            }).error(function(error,status){
                /*
                    Si l'usuari i contrasenya no és correcte executa la
                    función callback que li hem passat com paràmetre
                */
                noLogin(error, status);
            });
        };
        this.registre = function(username,password){
            /*
                Per registrar un usuari nou, només hem de fer un post
                a l'api d'usuaris
            */
            return $http.post('/api/users', {
                username: username,
                password: password
            });
        };
        this.logOut = function() {
            /*
                Quan l'usuari fa logout s'esborra el token
                i posem la propietat del servei "auth" a false
            */
            srv.auth = false;
            $http.defaults.headers.common['x-auth'] ="";
        };
        
        
    
    
    
    });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1vZHVsZS5qcyIsIlNvY2tldFNydi5qcyIsImFwcGxpY2F0aW9uLmN0cmwuanMiLCJib3RpZ2Euc3ZjLmpzIiwiYm90aWd1ZXMuY3RybC5qcyIsImVkaXRib3RpZ2EuY3RybC5qcyIsImVkaXRwcm9kdWN0ZS5jdHJsLmpzIiwibG9naW4uY3RybC5qcyIsIm5vdXByb2R1Y3RlLmN0cmwuanMiLCJub3ZhYm90aWdhLmN0cmwuanMiLCJwcm9kdWN0ZXMuY3RybC5qcyIsInByb2R1Y3Rlcy5zdmMuanMiLCJyZWdpc3RyZS5jdHJsLmpzIiwicm91dGVzLmpzIiwidXNlci5zcnYuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJywgWyduZ1Jlc291cmNlJywnbmdSb3V0ZSddKTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5zZXJ2aWNlKCdTb2NrZXRTcnYnLCBmdW5jdGlvbigkcm9vdFNjb3BlKSB7XG4gICAgXG4gICAgdmFyIHNvY2tldCA9IGlvKCkuY29ubmVjdCgpO1xuICAgIFxuICAgIHNvY2tldC5vbignbmV3UHJvZHVjdCcsZnVuY3Rpb24ocHJvZHVjdGUpIHtcbiAgICAgIFxuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ25ld1Byb2R1Y3QnLHByb2R1Y3RlKTtcbiAgICAgICAgXG4gICAgfSk7XG4gICAgc29ja2V0Lm9uKCd1cGRhdGVQcm9kdWN0JyxmdW5jdGlvbihwcm9kdWN0ZSkge1xuICAgICAgXG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgndXBkYXRlUHJvZHVjdCcscHJvZHVjdGUpO1xuICAgICAgICBcbiAgICB9KTtcbiAgICBzb2NrZXQub24oJ2RlbGV0ZVByb2R1Y3QnLGZ1bmN0aW9uKHByb2R1Y3RlKSB7XG4gICAgICBcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdkZWxldGVQcm9kdWN0Jyxwcm9kdWN0ZSk7XG4gICAgICAgIFxuICAgIH0pO1xufSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIkFwcGxpY2F0aW9uQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsJGxvY2F0aW9uLFVzZXJTdmMpIHtcbiAgICAgICAgJHNjb3BlLiRvbignbG9naW4nLCBmdW5jdGlvbihlLHVzZXIpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUXVhbiBzJ2hhIGZldCBsb2dpbiBzJ2VtZXQgbCdldmVudCBcImxvZ2luXCJcbiAgICAgICAgICAgICAgICBpIGFpeMOyIGZhIHF1ZSBsYSB2YXJpYWJsZSBkZSBsJ3Njb3BlIFwiY3VycmVudFVzZXJcIlxuICAgICAgICAgICAgICAgIGxpIGRpZW0gcXVpbiB1c3VhcmkgcydoYSBhdXRlbnRpY2FudCwgZCdhcXVlc3RhIG1hbmVyYVxuICAgICAgICAgICAgICAgIGZlbSBxdWUgYXBhcmVndWluIGRpZmVyZW50cyBvcGNpb25zIGFsIG1lbsO6XG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRVc2VyID0gdXNlcjtcbiAgICAgICAgfSk7XG4gICAgICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICBRdWFuIGZlbSBsb2dvdXQgZXNib3JyZW0gZWwgdG9rZW4gaSBsYSB2YXJpYWJsZVxuICAgICAgICAgICAgICAgIGRlIGwnJHNjb3BlIFwiY3VycmVudFVzZXJcIiwgZCdhcXVlc3RhIGZvcm1hIGRlc2FwYXJlaXhlblxuICAgICAgICAgICAgICAgIGVscyBtZW7DunMgc2Vuc2libGVzIGEgbGEgYXV0ZW50aWNhY2nDs1xuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIFVzZXJTdmMubG9nT3V0KCk7XG4gICAgICAgICAgICBkZWxldGUgJHNjb3BlLmN1cnJlbnRVc2VyO1xuICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgICAgICAgfTtcbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuLnNlcnZpY2UoXCJCb3RpZ3Vlc1NlcnZlaVwiLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICAgdGhpcy5zcnYgPSAkcmVzb3VyY2UoJy9hcGkvYm90aWd1ZXMvOmlkJywgbnVsbCwge1xuICAgICAgICAgICd1cGRhdGUnOiB7XG4gICAgICAgICAgICAgIG1ldGhvZDogJ1BVVCdcbiAgICAgICAgICB9XG4gICAgICB9KTtcblxuICB0aGlzLmVkaXRhID0gbnVsbDtcbiAgcmV0dXJuIHRoaXM7XG4gICAgXG4gIH0pIiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbi5jb250cm9sbGVyKCdCb3RpZ3Vlc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsIEJvdGlndWVzU2VydmVpLCAkbG9jYXRpb24pIHtcbiAgICAgIHZhciBpZDtcbiAgICAgIEJvdGlndWVzU2VydmVpLnNydi5xdWVyeShmdW5jdGlvbihib3RpZ3Vlcykge1xuICAgICAgICAgICRzY29wZS5ib3RpZ3VlcyA9IGJvdGlndWVzO1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUucmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIEJvdGlndWVzU2VydmVpLnNydi5xdWVyeShmdW5jdGlvbihib3RpZ3Vlcykge1xuICAgICAgICAgICAgICAkc2NvcGUuYm90aWd1ZXMgPSBib3RpZ3VlcztcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgICRzY29wZS5lZGl0YXJib3RpZ2EgPSBmdW5jdGlvbihib3RpZ2EpIHtcbiAgICAgICAgICAkc2NvcGUubm9tRSA9IGJvdGlnYS5ub207XG4gICAgICAgICAgJHNjb3BlLnBvYmxhY2lvRSA9IGJvdGlnYS5wb2JsYWNpbztcbiAgICAgICAgIC8vICRzY29wZS5wcm9kdWN0ZXBlcmVkaXRhciA9IHByb2R1Y3RlO1xuICAgICAgICAgIEJvdGlndWVzU2VydmVpLmVkaXRhID1ib3RpZ2E7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9lZGl0YXJCb3RpZ2EnKTtcbiAgICAgIH1cbiAgICAgXG4gICAgICAkc2NvcGUuYm9ycmFyYm90aWdhID0gZnVuY3Rpb24oYm90aWdhKSB7XG4gICAgICAgICAgQm90aWd1ZXNTZXJ2ZWkuc3J2LnJlbW92ZSh7aWQ6Ym90aWdhLm5vbX0pO1xuICAgICAgICAgICRzY29wZS5yZWZyZXNoKCk7XG4gICAgICB9XG4gIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4gICAgLmNvbnRyb2xsZXIoJ0VkaXRhYm90aWdhY29udHJvbGxlcicsZnVuY3Rpb24oJHNjb3BlLCRsb2NhdGlvbixCb3RpZ3Vlc1NlcnZlaSkge1xuICAgIFxuICAgICRzY29wZS5ub21FID0gQm90aWd1ZXNTZXJ2ZWkuZWRpdGEubm9tO1xuICAgICRzY29wZS5wb2JsYWNpb0UgPSBCb3RpZ3Vlc1NlcnZlaS5lZGl0YS5wb2JsYWNpbztcbiAgICAkc2NvcGUuYm90aWdhcGVyZWRpdGFyPUJvdGlndWVzU2VydmVpLmVkaXRhO1xuICAgICRzY29wZS5tb2RpZmljYXJib3RpZ2EgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBCb3RpZ3Vlc1NlcnZlaS5zcnYudXBkYXRlKHtpZDokc2NvcGUuYm90aWdhcGVyZWRpdGFyLm5vbX0sIHtcbiAgICAgICAgICAgICAgbm9tOiAkc2NvcGUubm9tRSxcbiAgICAgICAgICAgICAgcG9ibGFjaW86ICRzY29wZS5wb2JsYWNpb0VcbiAgICAgICAgICB9LCBmdW5jdGlvbihib3RpZ2EpIHtcbiAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9ib3RpZ3VlcycpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgXG4gICAgICB9XG4gfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcignRWRpdGFwcm9kdWN0ZWNvbnRyb2xsZXInLGZ1bmN0aW9uKCRzY29wZSwkbG9jYXRpb24sUHJvZHVjdGVzU2VydmVpKSB7XG4gICAgJHNjb3BlLnByZXVTO1xuICAgICRzY29wZS5ub21FID0gUHJvZHVjdGVzU2VydmVpLmVkaXRhLm5vbTtcbiAgICAkc2NvcGUucHJldUUgPSBQcm9kdWN0ZXNTZXJ2ZWkuZWRpdGEucHJldTtcbiAgICAkc2NvcGUucHJvZHVjdGVwZXJlZGl0YXI9UHJvZHVjdGVzU2VydmVpLmVkaXRhO1xuICAgICRzY29wZS5tb2RpZmljYXJwcm9kdWN0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIFByb2R1Y3Rlc1NlcnZlaS5zcnYudXBkYXRlKHtpZDokc2NvcGUucHJvZHVjdGVwZXJlZGl0YXIubm9tfSwge1xuICAgICAgICAgICAgICBub206ICRzY29wZS5ub21FLFxuICAgICAgICAgICAgICBwcmV1OiAkc2NvcGUucHJldUVcbiAgICAgICAgICB9LCBmdW5jdGlvbihwcm9kdWN0ZSkge1xuICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aCgnLycpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgXG4gICAgICB9XG4gfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcihcIkxvZ2luQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsJGxvY2F0aW9uLFVzZXJTdmMpe1xuICAgICAgICAgXG4gICAgXG4gICAgICAgICAkc2NvcGUuJHdhdGNoR3JvdXAoWyd1c2VybmFtZScsJ3Bhc3N3b3JkJ10sZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIFZpZ2lsZW0gbGVzIHZhcmlhYmxlcyBkZSBsJyRzY29wZSBcInVzZXJuYW1lXCJcbiAgICAgICAgICAgICAgICAgKiBpIFwicGFzc3dvcmRcIiBwZXIgZXNib3JyYXIgZWwgbWlzc2F0Z2UgZCdlcnJvclxuICAgICAgICAgICAgICAgICAqIHNpIGhpIGhhLlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlmIChuZXdWYWwhPW9sZFZhbClcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yPW51bGw7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24odXNlcm5hbWUscGFzc3dvcmQpIHtcbiAgICAgICAgICAgIGlmICghdXNlcm5hbWUgfHwgIXBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gXCJIYXMgZCdlbXBsZW5hciB0b3RzIGVscyBjYW1wc1wiO1xuICAgICAgICAgICAgfSBlbHNle1xuICAgICAgICAgICAgICAgIFVzZXJTdmMubG9naW4odXNlcm5hbWUscGFzc3dvcmQsXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKGVycm9yLHN0YXR1cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBGdW5jacOzIHF1ZSBzJ2V4ZWN1dGFyw6Agc2kgaGkgaGEgdW4gZXJyb3IgZW4gZWwgbG9naW5cbiAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IDQwMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBlcnJvci5taXNzYXRnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkuc3VjY2VzcyhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFVzZXJTdmMuZ2V0VXNlcigpLnRoZW4oZnVuY3Rpb24odXNlcil7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU2kgdG90IHZhIGLDqSwgYW5lbSBhIGxhIHDDoGdpbmEgcHJpbmNpcGFsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGkgZW1ldGVuIHVuIG1pc3NhdGdlIGRlIFwibG9naW5cIiBwZXIgYXZpc2FyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGEgbGEgbm9zdHJhIGFwcCBxdWUgbCd1c3VhcmkgaGEgZmV0IGxvZ2luXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvcnJlY3RhbWVudC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kZW1pdCgnbG9naW4nLCB1c2VyLmRhdGEpOyAgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy8nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTsiLCJhbmd1bGFyLm1vZHVsZSgnYXBwTGVhcm4nKVxuICAgIC5jb250cm9sbGVyKCdOb3Vwcm9kdWN0ZWNvbnRyb2xsZXInLGZ1bmN0aW9uKCRzY29wZSwkbG9jYXRpb24sUHJvZHVjdGVzU2VydmVpLEJvdGlndWVzU2VydmVpKSB7XG4gICAgICAgIEJvdGlndWVzU2VydmVpLnNydi5xdWVyeShmdW5jdGlvbihib3RpZ3Vlcykge1xuICAgICAgICAgICRzY29wZS5ib3RpZ3VlcyA9IGJvdGlndWVzO1xuICAgICAgfSk7XG4gICAgXG4gICAgXG4gICAgJHNjb3BlLmJvdGlxdWVzID0gW107XG4gICAgXG4gICAgICAgICRzY29wZS5hZmVnaXJwcm9kdWN0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIFByb2R1Y3Rlc1NlcnZlaS5zcnYuc2F2ZSh7XG4gICAgICAgICAgICAgIEJvdGlnYTogJHNjb3BlLmJvdGlxdWVzLFxuICAgICAgICAgICAgICBub206ICRzY29wZS5ub20sXG4gICAgICAgICAgICAgIHByZXU6ICRzY29wZS5wcmV1LFxuICAgICAgICAgICAgICBleGlzdGVuY2llczogJHNjb3BlLmV4aXN0ZW5jaWVzXG4gICAgICAgICAgfSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL1wiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBcbiAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIFxuICAgICAgICAkc2NvcGUudG9nZ2xlID0gZnVuY3Rpb24oYnV0aSkge1xuICAgICAgICAgICAgdmFyIGF1eCA9ICRzY29wZS5ib3RpcXVlcy5pbmRleE9mKGJ1dGkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoYXV4ID09IC0xKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmJvdGlxdWVzLnB1c2goYnV0aSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzY29wZS5ib3RpcXVlcy5zcGxpY2UoYXV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgXG4gfSk7IiwiYW5ndWxhci5tb2R1bGUoJ2FwcExlYXJuJylcbiAgICAuY29udHJvbGxlcignTm92YWJvdGlnYWNvbnRyb2xsZXInLGZ1bmN0aW9uKCRzY29wZSwkbG9jYXRpb24sQm90aWd1ZXNTZXJ2ZWkpIHtcbiAgICAgICAgJHNjb3BlLmFmZWdpcmJvdGlnYSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIEJvdGlndWVzU2VydmVpLnNydi5zYXZlKHtcbiAgICAgICAgICAgICAgbm9tOiAkc2NvcGUubm9tLFxuICAgICAgICAgICAgICBwb2JsYWNpbzogJHNjb3BlLnBvYmxhY2lvLFxuICAgICAgICAgICAgIFxuICAgICAgICAgIH0sZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAkbG9jYXRpb24ucGF0aChcIi9ib3RpZ3Vlc1wiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgIFxuICAgICAgfVxuIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4uY29udHJvbGxlcignUHJvZHVjdGVzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgUHJvZHVjdGVzU2VydmVpLCBTb2NrZXRTcnYsICRsb2NhdGlvbikge1xuICAgICAgIHZhciBpZDtcbiAgICAgICAkc2NvcGUucHJvZHVjdGVzPVtdO1xuICAgICBcblxuICAgICAgJHNjb3BlLiRvbignbmV3UHJvZHVjdCcsZnVuY3Rpb24oZSxwKXtcbiAgICAgICAgICBcbiAgICAgICAgICBjb25zb2xlLmxvZyhcImxsaXN0YSBhIHByb2R1Y3RlXCIrZSk7XG4gICAgICAgICAgJHNjb3BlLiRhcHBseShmdW5jdGlvbigpIHskc2NvcGUucHJvZHVjdGVzLnVuc2hpZnQocCl9KTtcbiAgICAgICAgICBcbiAgICAgIH0pOyAgICBcbiAgICBcbiAgICAgICRzY29wZS4kb24oJ3VwZGF0ZVByb2R1Y3QnLGZ1bmN0aW9uKGUscCl7XG4gICAgICAgIFxuICAgICAgICAgICRzY29wZS5wcm9kdWN0ZXMuZm9yRWFjaChmdW5jdGlvbihiLGksYSl7XG4gICAgICAgICAgICAgICAgaWYoYi5faWQ9PXAuX2lkKXtcbiAgICAgICAgICAgICAgICAgICAgYVtpXT1wO1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICBcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgXG4gICAgICB9KTsgICAgXG4gICAgICRzY29wZS4kb24oJ2RlbGV0ZVByb2R1Y3QnLGZ1bmN0aW9uKGUscCl7XG4gICAgXG4gICAgICAgICAkc2NvcGUucHJvZHVjdGVzLmZvckVhY2goZnVuY3Rpb24oYixpLGEpe1xuICAgICAgICAgICAgICAgIGlmKGIuX2lkPT1wKXtcbiAgICAgICAgICAgICAgICAgICAgYS5zcGxpY2UoaSwxKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucHJvZHVjdGVzKTtcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgXG4gICAgICB9KTsgXG4gICAgXG4gICAgICBQcm9kdWN0ZXNTZXJ2ZWkuc3J2LnF1ZXJ5KGZ1bmN0aW9uKHByb2R1Y3Rlcykge1xuICAgICAgICAgICRzY29wZS5wcm9kdWN0ZXMgPSBwcm9kdWN0ZXM7XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5yZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgUHJvZHVjdGVzU2VydmVpLnNydi5xdWVyeShmdW5jdGlvbihwcm9kdWN0ZXMpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2R1Y3RlcyA9IHByb2R1Y3RlcztcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgICRzY29wZS5lZGl0YXJwcm9kdWN0ZSA9IGZ1bmN0aW9uKHByb2R1Y3RlKSB7XG4gICAgICAgICAgJHNjb3BlLm5vbUUgPSBwcm9kdWN0ZS5ub207XG4gICAgICAgICAgJHNjb3BlLnByZXVFID0gcHJvZHVjdGUucHJldTtcbiAgICAgICAgIC8vICRzY29wZS5wcm9kdWN0ZXBlcmVkaXRhciA9IHByb2R1Y3RlO1xuICAgICAgICAgIFByb2R1Y3Rlc1NlcnZlaS5lZGl0YSA9cHJvZHVjdGU7XG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoJy9lZGl0YXJQcm9kdWN0ZScpO1xuICAgICAgfVxuICAgICBcbiAgICAgICRzY29wZS5ib3JyYXJwcm9kdWN0ZSA9IGZ1bmN0aW9uKHByb2R1Y3RlKSB7XG4gICAgICAgICAgUHJvZHVjdGVzU2VydmVpLnNydi5yZW1vdmUoe2lkOnByb2R1Y3RlLm5vbX0pO1xuICAgICAgICAgICRzY29wZS5yZWZyZXNoKCk7XG4gICAgICB9XG4gIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4uc2VydmljZShcIlByb2R1Y3Rlc1NlcnZlaVwiLCBmdW5jdGlvbigkcmVzb3VyY2UpIHtcbiAgICAgdGhpcy5zcnYgPSAkcmVzb3VyY2UoJy9hcGkvcHJvZHVjdGVzLzppZCcsIG51bGwsIHtcbiAgICAgICAgICAndXBkYXRlJzoge1xuICAgICAgICAgICAgICBtZXRob2Q6ICdQVVQnXG4gICAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgdGhpcy5lZGl0YSA9IG51bGw7XG4gIHJldHVybiB0aGlzO1xuICAgIFxuICB9KSIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4gICAgLmNvbnRyb2xsZXIoXCJSZWdpc3RyZUNvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCRsb2NhdGlvbixVc2VyU3ZjKSB7XG4gICAgICAgIFxuICAgICAgICAkc2NvcGUucmVnaXN0cmUgPSBmdW5jdGlvbih1c2VybmFtZSxwYXNzd29yZCxwYXNzd29yZDIpIHtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgJHNjb3BlLiR3YXRjaEdyb3VwKFsndXNlcm5hbWUnLCdwYXNzd29yZCcsJ3Bhc3N3b3JkMiddLGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5ld1ZhbCE9b2xkVmFsKVxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3I9bnVsbDtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCFwYXNzd29yZCB8fCAhcGFzc3dvcmQyIHx8ICF1c2VybmFtZSl7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gXCJIYXMgZCdlbXBsZW5hciB0b3RzIGVscyBjYW1wc1wiO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfWVsc2UgaWYgKHBhc3N3b3JkID09PSBwYXNzd29yZDIpe1xuICAgICAgICAgICAgICAgIFVzZXJTdmMucmVnaXN0cmUodXNlcm5hbWUscGFzc3dvcmQpXG4gICAgICAgICAgICAgICAgICAgIC5zdWNjZXNzKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRsb2NhdGlvbi5wYXRoKCcvbG9naW4nKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmVycm9yKGZ1bmN0aW9uKGVycm9yLHN0YXR1cyl7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IDQwOSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSBlcnJvci5taXNzYXRnZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvciA9IFwiTGVzIGNvbnRyYXNlbnllcyBubyBzw7NuIGlndWFsc1wiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpLmNvbmZpZyhmdW5jdGlvbigkcm91dGVQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAkcm91dGVQcm92aWRlci53aGVuKFwiL1wiLCB7XG4gICAgICAgIGNvbnRyb2xsZXI6ICdQcm9kdWN0ZXNDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdwcm9kdWN0ZS5odG1sJyxcbiAgICAgICAgYXV0b3JpdHphdDogZmFsc2VcbiAgICB9KS53aGVuKFwiL2JvdGlndWVzXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogJ0JvdGlndWVzQ29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnYm90aWdhLmh0bWwnLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLndoZW4oXCIvZWRpdGFyQm90aWdhXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogJ0VkaXRhYm90aWdhY29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnZWRpdGFyYm90aWdhLmh0bWwnLFxuICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLndoZW4oXCIvbm91cHJvZHVjdGVcIiwge1xuICAgICAgICBjb250cm9sbGVyOiAnTm91cHJvZHVjdGVjb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdjcmVhcHJvZHVjdGUuaHRtbCcsXG4gICAgICAgIGF1dG9yaXR6YXQ6IGZhbHNlXG4gICAgfSkud2hlbihcIi9ub3ZhYm90aWdhXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogJ05vdmFib3RpZ2Fjb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdjcmVhcmJvdGlnYS5odG1sJyxcbiAgICAgICAgYXV0b3JpdHphdDogZmFsc2VcbiAgICB9KS53aGVuKFwiL2VkaXRhclByb2R1Y3RlXCIsIHtcbiAgICAgICAgY29udHJvbGxlcjogJ0VkaXRhcHJvZHVjdGVjb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdlZGl0YXJwcm9kdWN0ZS5odG1sJyxcbiAgICAgICAgYXV0b3JpdHphdDogZmFsc2VcbiAgICB9KS53aGVuKFwiL3JlZ2lzdHJlXCIsIHtcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBcIlJlZ2lzdGVyQ29udHJvbGxlclwiLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiBcInJlZ2lzdHJlLmh0bWxcIixcbiAgICAgICAgICAgICAgICBhdXRvcml0emF0OiBmYWxzZVxuICAgIH0pLndoZW4oXCIvbG9naW5cIiwge1xuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IFwiTG9naW5Db250cm9sbGVyXCIsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6IFwibG9naW4uaHRtbFwiLFxuICAgICAgICAgICAgICAgIGF1dG9yaXR6YXQ6IGZhbHNlXG4gICAgfSkud2hlbihcIi9yZWdpc3RyZVwiLCB7XG4gICAgICAgICAgICAgICAgY29udHJvbGxlcjogXCJSZWdpc3RyZUNvbnRyb2xsZXJcIixcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogXCJyZWdpc3RyZS5odG1sXCIsXG4gICAgICAgICAgICAgICAgYXV0b3JpdHphdDogZmFsc2VcbiAgICB9KS5vdGhlcndpc2Uoe1xuICAgICAgICByZWRpcmVjdFRvOiAnLydcbiAgICB9KTtcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUoe1xuICAgICAgICBlbmFibGVkOiB0cnVlLFxuICAgICAgICByZXF1aXJlQmFzZTogZmFsc2VcbiAgICB9KTtcbn0pIC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSxVc2VyU3ZjKSB7XG4gICAgICAgIC8qXG4gICAgICAgICAgICBDYWRhIHZlZ2FkYSBxdWUgY2FudmllbSBkZSBww6BnaW5hIHNlIGRpc3BhcmEgZWxcbiAgICAgICAgICAgIGV2ZW50ICRyb3V0ZUNoYW5nZVN0YXJ0LFxuICAgICAgICAgICAgU2kgbGEgcMOgZ2luYSBxdWUgdm9sZW0gdmV1cmUgdMOpIGxhIHByb3BpZXRhdCBcbiAgICAgICAgICAgIFwiYXV0b3JpdHphdFwiOiBhIHRydWUgaSBubyBobyBlc3TDoCBsbGF2b3JzIG5vIFxuICAgICAgICAgICAgZmFyw6AgZWwgY2FudmlcbiAgICAgICAgKi9cbiAgICAgICAgJHJvb3RTY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIG5leHQpIHtcbiAgICAgICAgICAgaWYgKG5leHQpXG4gICAgICAgICAgICAgICAgaWYgKCFVc2VyU3ZjLmF1dGggJiBuZXh0LmF1dG9yaXR6YXQpIFxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9KTtcbn0pOyIsImFuZ3VsYXIubW9kdWxlKCdhcHBMZWFybicpXG4gICAgLnNlcnZpY2UoJ1VzZXJTdmMnLCBmdW5jdGlvbigkaHR0cCkge1xuICAgICAgICB2YXIgc3J2ID0gdGhpcztcbiAgICAgICAgc3J2LmF1dGg9IGZhbHNlO1xuICAgICAgICBzcnYuZ2V0VXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2VycycpO1xuICAgICAgICB9O1xuICAgICAgICBzcnYubG9naW4gPSBmdW5jdGlvbiAodXNlcm5hbWUsIHBhc3N3b3JkLG5vTG9naW4pIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3Nlc3Npb25zJywge1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmRcbiAgICAgICAgICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSxzdGF0dXMpIHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAgICBTaSBsJ2F1dGVudGljYWNpw7Mgw6lzIGNvcnJlY3RlIGxpIGRpZW0gYSBsJ2FuZ3VsYXIgcXVlIGNhZGEgXG4gICAgICAgICAgICAgICAgICAgIHZlZ2FkYSBxdWUgZXMgY29tdW5pcXVpIGFtYiBlbCBzZXJ2aWRvciBhZmVnZWl4aSBlbCB0b2tlbiBcbiAgICAgICAgICAgICAgICAgICAgYWwgaGVhZGVyICd4LWF1dGgnXG4gICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAkaHR0cC5kZWZhdWx0cy5oZWFkZXJzLmNvbW1vblsneC1hdXRoJ10gPSBkYXRhO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhKSBzcnYuYXV0aCA9IHRydWU7XG4gICAgICAgICAgICB9KS5lcnJvcihmdW5jdGlvbihlcnJvcixzdGF0dXMpe1xuICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgIFNpIGwndXN1YXJpIGkgY29udHJhc2VueWEgbm8gw6lzIGNvcnJlY3RlIGV4ZWN1dGEgbGFcbiAgICAgICAgICAgICAgICAgICAgZnVuY2nDs24gY2FsbGJhY2sgcXVlIGxpIGhlbSBwYXNzYXQgY29tIHBhcsOgbWV0cmVcbiAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIG5vTG9naW4oZXJyb3IsIHN0YXR1cyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5yZWdpc3RyZSA9IGZ1bmN0aW9uKHVzZXJuYW1lLHBhc3N3b3JkKXtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUGVyIHJlZ2lzdHJhciB1biB1c3Vhcmkgbm91LCBub23DqXMgaGVtIGRlIGZlciB1biBwb3N0XG4gICAgICAgICAgICAgICAgYSBsJ2FwaSBkJ3VzdWFyaXNcbiAgICAgICAgICAgICovXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2VycycsIHtcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXG4gICAgICAgICAgICAgICAgcGFzc3dvcmQ6IHBhc3N3b3JkXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5sb2dPdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgUXVhbiBsJ3VzdWFyaSBmYSBsb2dvdXQgcydlc2JvcnJhIGVsIHRva2VuXG4gICAgICAgICAgICAgICAgaSBwb3NlbSBsYSBwcm9waWV0YXQgZGVsIHNlcnZlaSBcImF1dGhcIiBhIGZhbHNlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgc3J2LmF1dGggPSBmYWxzZTtcbiAgICAgICAgICAgICRodHRwLmRlZmF1bHRzLmhlYWRlcnMuY29tbW9uWyd4LWF1dGgnXSA9XCJcIjtcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIFxuICAgIFxuICAgIFxuICAgIFxuICAgIH0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==