'use strict';

var module = angular.module('circle', []);

module.controller('circleCtrl', function($scope, $timeout) {
  $scope.$on('circle:memberGroupChanged', function(evt) {
    // console.log('circleCtrl got', evt);
    evt.stopPropagation();
    $scope.$broadcast('circle:re:memberGroupChanged');
  });

  $scope.$on('circle:filterMembersByGroupDone', function(evt, evtData) {
    evt.stopPropagation();
    // console.log('circleCtrl got', evt);
    // console.log('evtData', evtData);
    $scope.$broadcast('circle:re:filterMembersByGroupDone', evtData);
  });

  $scope.$on('circle:unfollowDone', function(evt) {
    $scope.$broadcast('circle:re:unfollowDone');
  })

  if ($('.ui.dimmer.page #friendGroupModal.ui.modal').attr('id') === 'friendGroupModal') {
    $('.ui.dimmer.page #friendGroupModal.ui.modal').detach();
  }

  if ($('.ui.dimmer.page #groupDeleteConfirmModal.ui.modal').attr('id') === 'groupDeleteConfirmModal') {
    $('.ui.dimmer.page #groupDeleteConfirmModal.ui.modal').detach();
  }

  if ($('.ui.dimmer.page #groupModifyModal.ui.modal').attr('id') === 'groupModifyModal') {
    $('.ui.dimmer.page #groupModifyModal.ui.modal').detach();
  }

});

module.controller('friendMgmtCtrl', function($scope, $timeout, circleService, userService, _) {
  //ken:f747e9b0-083d-11e4-a707-f35f2b23f2b5
  //b:29712160-08aa-11e4-ae96-bbc36a3dec67
  $scope.friendsSide = 'following';

  // console.log($('#friendGroupModal.ui.modal').attr('id'));
  
  // if ($('.ui.dimmer.page #friendGroupModal.ui.modal').attr('id') === 'friendGroupModal') {
  //   $('.ui.dimmer.page #friendGroupModal.ui.modal').detach();
  // }
  
  $timeout(function() {
    $('#friendsSwitchBar a.item').on('click', handler.activate);


    
    // console.log('selector:#friendGroupModal.ui.modal', $('#friendGroupModal').modal());
    // $('.ui.modal').modal('setting', {
    //   detachable : false
    // });




  }, 10);

  $scope.grcodeSearchKD = function(evt) {
    if (evt.keyCode && evt.keyCode === 13) {
      circleService.findFriendByGRcode($scope.grcode,
        function(data, status) {
          if (data.friendId == userService.getUserLocal()) {
            $scope.err = '汗，加自己吗？';
            $scope.searchResult = null;
            return
          }
          $scope.err = null;
          $scope.searchResult = data.friendId;
        },
        function(data, status) {
          $scope.searchedUser = null;
          console.error(data, status);
          $scope.err = data.err;
          $scope.searchResult = null;
        }
      );
    } else if (evt.keyCode && evt.keyCode === 27) {
      clearSearch();
    };
  }

  var clearSearch = function() {
    $scope.grcode = '';
    $scope.searchResult = null;
    $scope.searchedUser = null;
    $scope.err = null;
  }

  var resetFollowBtnState = function() {
    $('#followBtn').removeClass('disabled');
    $('#followBtn').attr('disabled', false);
    $scope.followBtnText = '+ 关注';
  };

  var setFollowBtnLoadState = function() {
    $('#followBtn').addClass('disabled');
    $('#followBtn').attr('disabled', true);
    $('#followBtn').addClass('loading');
  };

  $scope.$watch('searchResult', function(current, previous) {
    if (current && current != previous) {
      circleService.checkAlreadyFollowed(current, function(data, status) {
        if (data.check) {
          $scope.searchResult = '';
          $scope.searchedUser = null;
          $scope.err = '再关注一遍……这样真的好吗？';
        } else {
          userService.getOtherUserRemote(current,
            function(data, status) {
              $scope.searchedUser = data.user;
              resetFollowBtnState();
            },
            function(data, status){
              console.error(data, status);
            }
          );
        }
      }, function(data, status) {
        console.error(data, status);
      });
    }
  });

  $scope.followBtnClick = function() {
    setFollowBtnLoadState();
    circleService.followWithGRcode($scope.grcode, $scope.searchResult, function(data, status) {
      $('#followBtn').removeClass('loading');
      $scope.followBtnText = '关注成功';
      loadFollowing();
      loadFollower();
      $timeout(function() {
        clearSearch();
      }, 2000);
    }, function(data, status) {
      console.error(data, status);
      $('#followBtn').removeClass('loading');
      $scope.followBtnText = data.err;
      $timeout(function() {;
        resetFollowBtnState();
      }, 2000);
    })
  };

  $scope.unfollowBtnClick = function(target) {
    circleService.unfollow(target._id, function(data, status) {
      loadFollowing();
      loadFollower();
      $scope.$emit('circle:unfollowDone');
    }, function(data, status) {
      console.error(data, status);
    });
  };

  $scope.followItemClick = function(target, $event) {
    circleService.follow(target._id, function(data, status) {
      loadFollower();
      loadFollowing();
    }, function(data, status) {
      console.error(data, status);
    });
  }

  var loadFollowing = function() {
    circleService.listAllFollowings(function(data, status) {
      $scope.followingList = data.result;
      $scope.followingCount = data.count;
    }, function(data, status) {
      console.error(data, status);
    });
  }
  
  var loadFollower = function() {
    circleService.listAllFollowers(function(data, status) {
      $scope.mutualFollowerList = data.mutual;
      $scope.ignoredFollowerList = data.ignored;
      $scope.followerTotalCount = data.count;
    }, function(data, status) {
      console.error(data, status);
    });  
  }

  var loadFriendGroups = function(friend) {
    $scope.groupsLoaded = false;
    $scope.currentFriend = friend;
    var allGroupIds;
    var inGroupIds;
    circleService.groups(function(data, status) {
      $scope.allGroups = data.result;
      allGroupIds = _.pluck($scope.allGroups, 'id');

      circleService.groupsOfFriend(friend._id, function(data_1, status_1) {
        inGroupIds = _.pluck(data_1.result, 'id');

        for (var i = 0; i < allGroupIds.length; i++) {
          if (_.contains(inGroupIds, allGroupIds[i])) {
            $scope.allGroups[i].in = true;
          } else $scope.allGroups[i].in = false;
        }
        $scope.groupsLoaded = true;

      }, function(data_1, status_1) {
        console.error(data_1);
        $scope.groupsLoaded = true;
      });
    }, function(data, status) {
      console.error(data);
      $scope.groupsLoaded = true;
    });
  }


  $scope.toGroupingFriend = function(friend) {
    $scope.groupsLoaded = false;
    $scope.currentFriend = null;
    $scope.allGroups = null;

    $('#friendGroupModal').modal('setting', {
      onVisible : function() {
        loadFriendGroups(friend);
      }
    }).modal('show');
  }

  $scope.toggleGroupClick = function(group) {
    if ($scope.currentFriend) {
      var operation;
      if (group.in) {
        operation = 'removeMembers';
      } else {
        operation = 'addMembers';
      }
      circleService[operation]([$scope.currentFriend._id], group.id, function(data, status) {
        //success
        $scope.toggleGroupOptMsg = null;
        group.in = !group.in;
        $scope.$emit('circle:memberGroupChanged');
      }, function(data, status) {
        //failure
        $scope.toggleGroupOptMsg = data.err;
      });
    }
  }
  
  loadFollowing();
  loadFollower();

  $scope.$on('circle:re:filterMembersByGroupDone', function(evt, evtData) {
    $scope.followingList = evtData.result;
    $scope.groupFilterCount = evtData.count;
    $scope.groupFilterTitle = evtData.groupTitle;
  });

  $scope.clearGroupFilter = function() {
    loadFollowing();
    $scope.groupFilterCount = null;
    $scope.groupFilterTitle = null;
  }


});

module.controller('groupMgmtCtrl', function($scope, $timeout, circleService) {
  $scope.optMsg = null;

  var loadAllGroups = function() {
    circleService.groups(function(data, status) {
      $scope.groups = data.result;
      $timeout(function() {
        $('.groupItem').dimmer({
          on:'hover',
          duration: {
            show : 200,
            hide : 150
          }
        });
      }, 50);
      
    }, function(data, status) {
      console.error(data, status);
    });
  }

  var resetGroupOptMsgDisplay = function() {
    $scope.optMsg = null;
    $('#groupOptMsgBox').removeClass('error');
    $('#groupOptMsgBox').removeClass('success');
  }

  $scope.create = function(evt) {
    if (evt && evt.keyCode == 27) {
      $scope.displayTitle = null;
      resetGroupOptMsgDisplay();
    }
    if (evt && evt.keyCode == 13) {
      if (!$scope.displayTitle || !$scope.displayTitle.length) {
        $('#groupOptMsgBox').addClass('error');
        $scope.optMsg = '小组没名字怎么行？';
        return ; 
      }

      circleService.createGroup($scope.displayTitle, function(data, status) {
        $scope.displayTitle = null;
        $('#groupOptMsgBox').removeClass('error');
        $('#groupOptMsgBox').addClass('success');
        $scope.optMsg = '创建成功！';
        $timeout(function() {
          resetGroupOptMsgDisplay();
        }, 2000);

        loadAllGroups();

      }, function(data, status) {
        console.error(data, status);
        $('#groupOptMsgBox').addClass('error');
        $scope.optMsg = data.err;
      });

    };
  }

  $scope.rename = function() {
    circleService.renameGroup($scope.selectedGroupId, $scope.selectedGroupName, function(data, status) {
      $('#groupOptMsgBox').removeClass('error');
      $('#groupOptMsgBox').addClass('success');
      $scope.optMsg = '修改成功！';
      $timeout(function() {
        resetGroupOptMsgDisplay();
      }, 2000);

      loadAllGroups();
    }, function(data, status) {
      console.error(data, status);
      $('#groupOptMsgBox').addClass('error');
      $scope.optMsg = data.err;
    });
  }

  $scope.toRenameGroup = function(groupId, displayTitle) {
    $scope.selectedGroupId = groupId;
    $scope.selectedGroupName = displayTitle;
    $('#groupModifyModal')
    .modal('setting', {
      onDeny:function() {

      },
      onApprove:function() {
        $scope.rename();
      }
    })
    .modal('show');

  }

  $scope.renameGroupKD = function(evt) {
    if (evt && evt.keyCode === 13) {
      $scope.rename();
      $('#groupModifyModal').modal('hide');
    }
  }

  var deleteGroup = function(groupId) {
    circleService.deleteGroup(groupId, function(data, status) {
      $('#groupOptMsgBox').removeClass('error');
      $('#groupOptMsgBox').addClass('success');
      $scope.optMsg = '删除成功！';
      $timeout(function() {
        resetGroupOptMsgDisplay();
      }, 2000);
      loadAllGroups();
    }, function(data, status) {

      console.error('-----',data, status);
      $('#groupOptMsgBox').addClass('error');
      $scope.optMsg = data.err;
    });
  }

  $scope.toDeleteGroup = function(groupId, title) {
    $scope.deletingDisplayTitle = title;
    $('#groupDeleteConfirmModal')
    .modal('setting', {
      onDeny:function() {

      },
      onApprove:function() {
        deleteGroup(groupId);
      }
    })
    .modal('show');
  }

  $scope.filterMembersByGroup = function(groupId, title) {
    circleService.membersOfGroup(groupId, function(data, status) {
      $scope.$emit('circle:filterMembersByGroupDone', { result:data.result, groupTitle:title, count: data.result.length});
    }, function(data, status) {
      console.error(data);
    });
  }

  loadAllGroups();

  $scope.$on('circle:re:memberGroupChanged', function(evt) {
    loadAllGroups();
  });

  $scope.$on('circle:re:unfollowDone', function(evt) {
    loadAllGroups();
  });


});

module.factory('circleService', function($http) {
  return {
    findFriendByGRcode: function(grcode, success, failure) {
      $http.get('/friend/findPeopleByGRcode', { method:'GET', params:{grcode:grcode} }).success(success).error(failure);
    },
    follow: function(target, success, failure) {
      $http.post('/friend/follow', { target:target }, { method:'POST' }).success(success).error(failure);
    },
    followWithGRcode: function(grcode, target, success, failure) {
      $http.post('/friend/followWithGRcode', { grcode:grcode, target:target }, { method:'POST' }).success(success).error(failure);
    },
    unfollow: function(target, success, failure) {
      $http.post('/friend/unfollow', { target:target }, { method:'POST' }).success(success).error(failure);
    },
    checkAlreadyFollowed: function(target, success, failure) {
      $http.get('/friend/checkAlreadyFollowed', { method:'GET', params:{target:target} }).success(success).error(failure);
    },
    listAllFollowings: function(success, failure) {
      $http.get('/friend/followings', { method:'GET' }).success(success).error(failure);
    },
    listAllFollowers: function(success, failure) {
      $http.get('/friend/followers', { method:'GET' }).success(success).error(failure);
    },
    groups:function(success, failure) {
      $http.get('/group/all', { method:'GET' }).success(success).error(failure);
    },
    createGroup:function(displayTitle, success, failure) {
      $http.post('/group/create', { displayTitle:displayTitle }, { method:'POST' }).success(success).error(failure);
    },
    renameGroup:function(groupId, displayTitle, success, failure) {
      $http.post('/group/rename', { groupId:groupId, displayTitle:displayTitle }, { method:'POST' }).success(success).error(failure);
    },
    deleteGroup:function(groupId, success, failure) {
      $http.post('/group/delete', { groupId:groupId }, { method:'POST' }).success(success).error(failure);
    },
    groupsOfFriend:function(friendId, success, failure) {
      $http.get('/group/groupsOfFriend', { method:'GET', params:{friendId:friendId} }).success(success).error(failure);
    },
    membersOfGroup:function(groupId, success, failure) {
      $http.post('/group/membersOfGroup', {groupIds:[groupId]}, { method:'POST' }).success(success).error(failure);
    },
    addMembers:function(userIds, groupId, success, failure) {
      $http.post('/group/addMembers', { userIds:userIds, groupId:groupId }, { method:'POST' }).success(success).error(failure);
    },
    removeMembers:function(userIds, groupId, success, failure) {
      $http.post('/group/removeMembers', { userIds:userIds, groupId:groupId }, { method:'POST' }).success(success).error(failure);
    },
    moveMembers:function(userIds, src, dest, success, failure) {
      $http.post('/group/moveMembers', { userIds:userIds, srcGroupId:src, destGroupId:dest }, { method:'POST' }).success(success).error(failure);
    }
  }
});

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("Text", ev.target.id);
}

function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("Text");
  ev.target.appendChild(document.getElementById(data));
}

