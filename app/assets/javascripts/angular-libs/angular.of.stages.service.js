openFarmApp.factory('stageService', ['$http', '$log', '$q', 'alertsService',
  function stageService($http, $log, $q, alertsService) {

    // Should return Stage model:
    // {
    //   id: '',
    //   name: '',
    //   location: '',
    //   ...
    //   stages: [],
    //
    // }


    var calcTimeLength = function(length, length_type){
      if (length && length_type){
        switch (length_type){
        case 'minutes':
          return length;
        case 'hours':
          return length * 60;
        case 'action_days': // A special case of days,
          // for actions we're measuring in minutes, not days;
          return length * 60 * 24;
        case 'months':
          return length * 30;
        case 'years':
          return length * 365;
        case 'weeks':
          return length * 7;
        default:
          return length;
        }
      } else {
        return null;
      }
    };

    var buildStageWithPromise = function(data, included) {
      var stage = data.attributes;

      stage.id = data.id;
      console.log(data.id);
      // The toExecute array gathers all the $q promises
      // generated by the missing data and will execute them
      // all in the $q.all that returns at the end of this
      // function.
      var toExecute = [];

      if (data.relationships.stage_actions.data === undefined ||
            data.relationships.stage_actions.data.length === 0) {
        stage.stage_actions = [];
      } else {
        toExecute.push($http.get(data.relationships.stage_actions.links.related));
      }

      if (data.relationships.pictures.data === undefined &&
            data.relationships.pictures.data.length === 0) {
        stage.pictures = [];
      } else {
        toExecute.push($http.get(data.relationships.pictures.links.related));
      }
      return $q.all(toExecute).then(function (data) {
        data.forEach(function (datum) {
          // if we need to get really meta here
          // we can get services based on their name
          if (datum.data && datum.data.data && datum.data.data.length > 0) {
            stage[datum.data.data[0].type] = datum.data.data.map(function (obj) {
              return obj.attributes;
            });
            if (datum.data.data[0].type === 'stages-pictures') {
              stage.pictures = stage[datum.data.data[0].type];
            }
          }
        });
        return stage;
      });
    };

    var buildStage = function(data, included) {
      var stage = data.attributes;
      stage.id = data.id;

      var stageActions = (included || []).filter(function(obj) {
        return obj.type === 'stage-actions';
      });

      if (data.relationships.stage_actions.data === undefined ||
          data.relationships.stage_actions.data.length === 0) {
        stage.stage_actions = [];
      } else if (stageActions.length > 0) {
        relevantStageActionIds = data.relationships.stage_actions.data.map(function(sa) {
          return sa.id;
        });
        stage.stage_actions = stageActions.filter(function(stageAction) {
          return relevantStageActionIds.indexOf(stageAction.id) > -1;
        }).map(function(stageAction) {
          return buildStageAction(stageAction);
        });
      }

      if (data.relationships.pictures.data === undefined &&
          data.relationships.pictures.data.length === 0) {
        stage.pictures = [];
      } else {
        var mappedIds = data.relationships.pictures.data.map(function (pic) {
          return pic.id;
        });
        if (included) {
          stage.pictures = included.filter(function (pic) {
            return mappedIds.indexOf(pic.id) !== -1 &&
                   pic.type === 'stages-pictures' &&
                   pic.attributes.id === stage.id;
          }).map(function(pic) {
            return pic.attributes;
          });
        }
      }
      return stage;
    };

    var buildStageAction = function(data) {
      return data.attributes;
    };

    var getStage = function(id) {
      return $http.get('/api/v1/stages/' + id + '/')
        .then(function (stage) {
          console.log('retrieved data', stage.data.data)
          return buildStageWithPromise(stage.data.data);
        }).then(function (stage) {
          console.log('finished with', stage)
          return stage;
        });
    };

    var getPictures = function(id) {
      return $http.get('/api/v1/stages/' + id + '/pictures')
        .success(function(pictures) {
          return pictures.data;
        });
    };

    var createStage = function(params, callback){
      $http.post('/api/v1/stages/', params)
        .success(function (response) {
          return callback (true, buildStage(response.stage, response.included));
        }).error(function (response, code) {
          alertsService.pushToAlerts(response.errors, code);
        });
    };

    var createStageWithPromise = function(params) {
      return $q(function (resolve, reject) {
        $http.post('/api/v1/stages/', params)
          .success(function (response) {
            resolve(buildStage(response.data, response.included));
          }).error(function (response, code) {
            reject();
            alertsService.pushToAlerts(response.errors, code);
          });
      });
    };

    var updateStage = function(stageId, params, callback){
      $http.put('/api/v1/stages/' + stageId + '/', params)
        .success(function (response) {
          return callback (true, response.stage);
        })
        .error(function (response, code) {
          alertsService.pushToAlerts(response.errors, code);
        });
    };

    var updateStageWithPromise = function(stageId, params) {
      return $q(function (resolve, reject) {
        $http.put('/api/v1/stages/' + stageId + '/', params)
          .success(function (response) {
            resolve(buildStage(response.data));
          }).error(function (response, code) {
            $log.error("error when updating a stage", response, code);
            reject();
            alertsService.pushToAlerts(response.errors, code);
          });
      });
    };

    var deleteStage = function(stageId, callback){
      $http.delete('/api/v1/stages/' + stageId + '/')
        .success(function(response){
          return callback (true, response);
        })
        .error(function (response, code){
          alertsService.pushToAlerts(response.errors, code);
        });
    };

    var deleteStageWithPromise = function(stageId) {
      return $q(function (resolve, reject) {
        $http.delete('/api/v1/stages/' + stageId + '/')
          .success(function (response) {
            resolve();
          }).error(function (response, code) {
            reject();
            alertsService.pushToAlerts(response.errors, code);
          });
      });
    };

    var deleteStageAction = function(stageId, actionId) {
      return $q(function (resolve, reject) {
        $http.delete('/api/v1/stages/' + stageId + '/stage_actions/' + actionId)
          .success(function (response) {
            resolve();
          }).error(function (response, code) {
            reject();
            alertsService.pushToAlerts(response.errors, code);
          });
      });
    };

    return {
      // 'getGuide': getStage,
      'utilities': {
        'buildStage': buildStage,
        'buildStageWithPromise': buildStageWithPromise
      },
      'getStage': getStage,
      'createStageWithPromise': createStageWithPromise,
      'updateStageWithPromise': updateStageWithPromise,
      'deleteStageWithPromise': deleteStageWithPromise,
      'deleteStageAction': deleteStageAction,
      'deleteStage': deleteStage,
      'createStage': createStage,
      'updateStage': updateStage,
      'getPictures': getPictures,
      'calcTimeLength': calcTimeLength
    };
  }]);
