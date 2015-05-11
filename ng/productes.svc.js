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