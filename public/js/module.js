'use strict';


var app = angular.module('myApp', ['ui.router', 'ngCookies', 'satellizer']);

app.constant('TOKENNAME', 'authtoken');

app.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: '/html/home.html'
    })
    .state('login', {
      url: '/login',
      templateUrl: '/html/loginregister.html',
      controller: 'loginRegisterCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl: '/html/loginregister.html',
      controller: 'loginRegisterCtrl'
    })
    .state('profile', {
      url: '/profile',
      templateUrl: '/html/profile.html',
      controller: 'profileCtrl',
      resolve: {
        CurrentUser: function(User) {
          return User.getProfile();
        },
        Messages: function(Message) {
          return Message.getMessages();
        }
      }
    })
    .state('users', {
      url: '/users', 
      templateUrl: '/html/users.html',
      controller: 'usersCtrl', 
      resolve: {
        Users: function(User) {
          return User.getUsers();
        }
      }
    })
    .state('sendMessage', {
      url:'/sendMessage', 
      templateUrl: '/html/sendMessage.html',
      controller: 'sendMessageCtrl',
      params: {friend: null}
    })

  $urlRouterProvider.otherwise('/');
})

app.config(function($authProvider) {
  $authProvider.loginUrl = '/api/users/login';
$authProvider.signupUrl = '/api/users/signup';

  $authProvider.facebook({
    clientId: '277768235911300',
    url: '/api/users/facebook'
  });

  $authProvider.google({
    clientId: '776247137078-hablb4tromkh01g1tiom53fatjuvjual.apps.googleusercontent.com',
    url: '/api/users/google'
  })


})