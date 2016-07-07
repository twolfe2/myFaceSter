'use strict';

var app = angular.module('myApp');

app.controller('mainCtrl', function($scope, $rootScope, User) {
  console.log('mainCtrl!');
  // debugger;
  // console.log($rootScope);
  $scope.isAuthenticated = () => $auth.isAuthenticated();

  $scope.logout = () => {
    $auth.logout();
    $state.go('home');
  };
});

app.controller('usersCtrl', function(Users, $scope) {
  $scope.users = Users.data;
})

app.controller('profileCtrl', function(CurrentUser, $scope) {
  console.log('profileCtrl!');
  console.log('CurrentUser:', CurrentUser);
  $scope.currentUser = CurrentUser.data;
})

app.controller('loginRegisterCtrl', function($scope, $state, User) {

  $scope.currentState = $state.current.name;

  $scope.submit = () => {
    console.log('$scope.user:', $scope.user);
    // console.log($scope.user.name);

    if ($scope.currentState === 'login') {
      // login stuff
      $auth.login($scope.user)
        .then(res => {
          console.log('res', res);
          $state.go('profile');
        })
        .catch(err => {
          console.log('err', err);
        })
    } else {
      // register stuff

      if ($scope.user.password !== $scope.user.password2) {
        // passwords don't match
        $scope.user.password = null;
        $scope.user.password2 = null;
        alert('Passwords must match.  Try again.');
      } else {
        // passwords are good
        $auth.signup($scope.user)
          .then(res => {
            console.log('res', res);
            $state.go('login');
          })
          .catch(err => {
            console.log('err', err);
          })
      }
    }
  };

});
