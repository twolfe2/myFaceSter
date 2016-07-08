'use strict';

var app = angular.module('myApp');

app.service('User', function($http, $rootScope, $cookies, $state, $q, TOKENNAME) {


  this.getUsers = () => {
    return $http.get('/api/users')
      .catch(err => {
        if(err) console.log(err);
      });
  }
  this.getProfile = () => {
    return $http.get('/api/users/profile')
      .catch(err => {
        if(err) console.log(err);
      })
  };

  this.readToken = () => {
    let token = $cookies.get(TOKENNAME);

    if(typeof token === 'string') {
      let payload = JSON.parse(atob(token.split('.')[1]));
      console.log(payload);
      $rootScope.currentUser = payload;
    }
  };

  this.register = userObj => {
    return $http.post('/api/users/register', userObj);
  };

  this.login = userObj => {
    return $http.post('/api/users/login', userObj)  
      .then(res => {
        $rootScope.currentUser = res.data;
        return $q.resolve(res);
      });
  };

  this.logout = () => {
    $cookies.remove(TOKENNAME);
    $rootScope.currentUser = null;
    $state.go('home');
  };

  this.addFriend = (userId, friendId) => {
    console.log(userId,friendId);
    return $http.post(`/api/users/${userId}/addFriend/${friendId}`)
      .catch(err => {
        if(err) {
          console.log(err);
        }
      });
  }

});

app.service('Message', function($http, $rootScope, $cookies, $state, $q, TOKENNAME) {


  this.getMessages = () => {
    return $http.get('/api/messages/recievedMessages')
      .catch(err => {
        console.log(err);
      })
  }

  this.sendMessage = (messageObj) => {
    return $http.post('/api/messages/sendMessage', messageObj)
      .catch(err => {
        console.log(err);
      })
  }
});



