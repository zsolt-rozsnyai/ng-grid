(function(){
  'use strict';

  angular.module('ui.grid.grouping').directive('uiGridGroupPanel', ["$compile", "gridUtil", function($compile, gridUtil) {
    var defaultTemplate = 'ui-grid/ui-grid-group-panel';

    return {
      restrict: 'EA',
      replace: true,
      require: '?^uiGrid',
      scope: false,
      compile: function() {
        return {
          pre: function ($scope, $elm) {
              var groupPanelTemplate = $scope.grid.options.groupPanelTemplate  || defaultTemplate;

              $scope.groupings = [];

              gridUtil.getTemplate(groupPanelTemplate).then(function (contents) {
                  var template = angular.element(contents);

                  var newElm = $compile(template)($scope);
                  $elm.append(newElm);
              });
          },

          post: function ($scope, $elm) {
            $elm.bind('$destroy', function() {
            });
          }
        };
      }
    };
  }]);
})();