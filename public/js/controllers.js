'use strict';

var app = angular.module('myApp');

app.controller('mainCtrl', function($scope, $rootScope, User, $auth, $state) {
  console.log('mainCtrl!');
  // debugger;
  // console.log($rootScope);
  $scope.isAuthenticated = () => {
    // $rootScope.currentUser = $auth.getPayload();
    return $auth.isAuthenticated();
  };
  if($scope.isAuthenticated) {
    $rootScope.currentUser = $auth.getPayload();
  }
  $scope.logout = () => {
    $auth.logout();
    $rootScope.currentUser = null;
    $state.go('home');
  };
});

app.controller('usersCtrl', function(Users, $scope,$rootScope, User) {
  $scope.users = Users.data;

  $scope.addFriend = (friendId) => {
    User.addFriend($rootScope.currentUser._id, friendId)
      .then(() => {
        alert('friend added');
      })

  }
})

app.controller('profileCtrl', function(CurrentUser, $scope, $rootScope) {
  console.log('profileCtrl!');
  console.log('CurrentUser:', CurrentUser);
  $rootScope.currentUser = CurrentUser.data;
})

app.controller('loginRegisterCtrl', function($scope, $state, User, $auth) {

  $scope.currentState = $state.current.name;
  $scope.authenticate = function(provider) {
    $auth.authenticate(provider)
      .then(() => {
        $state.go('profile');

      })
  };

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
