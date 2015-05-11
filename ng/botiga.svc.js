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