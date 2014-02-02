/**
 * Created by Tim on 2/1/14.
 */

(function(){
    'use strict';
    var uiI18n = angular.module('ui.i18n', []);
    uiI18n.value('uiI18n.packs', {
        i18n: {},
        lang: null
    });
    uiI18n.i18n = {
        add: function(langs, strings){
            var packs = angular.injector(['ng','ui.i18n']).get('uiI18n.packs');
            if (typeof(langs) === "object"){
                angular.forEach(langs, function(lang){
                    if (lang){
                        var lower = lang.toLowerCase();
                        var combined = angular.extend(packs.i18n[lang] || {}, strings);
                        packs.i18n[lower] = combined;
                    }
                });
            } else {
                var lower = langs.toLowerCase();
                var combined = angular.extend(packs.i18n[langs] || {}, strings);
                packs.i18n[lower] = combined;
            }
            uiI18n.value('uiI18n.packs', packs);
        }
    };

    /**
     * @ngdoc directive
     * @name ui.i18n
     * @restrict A
     *
     * @description
     * Allows you to localize your project by being able to specify a language on a tag
     *
     * @example
     <doc:example module="app">
     <doc:source>
     <script>
     var app = angular.module('app', ['ui.i18n']);

     app.controller('main', ['$scope', function($scope){
        $scope.language = 'en';
        $scope.changeLanguage = function(){
          $scope.language = $scope.language == 'es' ? 'en' : 'es';
        };
     }]);
     //Declare your i18n strings, this is enclosed in order to show that this can be done anywhere in the application
     (function(){
        var uiI18n = angular.module('ui.i18n');
        uiI18n.i18n.add(['en', 'en-us'],{
            example: 'This is an example of i18n',
            aggregate:{
                label: 'items'
            },
            groupPanel:{
                description: 'Drag a column header here and drop it to group by that column.'
            }
        });
        uiI18n.i18n.add('es',{
            example: 'no habla espaniol...',
            aggregate:{
                label: 'Artículos'
            },
            groupPanel:{
                description: 'Arrastre un encabezado de columna aquí y soltarlo para agrupar por esa columna.'
            }
        });
    })();
     </script>

     <div ng-controller="main" ui-i18n="language">
         <button ng-click="changeLanguage()">toggle lang</button>
         <span>{{language}}</span>
         <h1>{{"example" | t}}</h1>

         <p>{{"groupPanel.description" | t}}</p>

         <p ui-t="search.placeholder"></p>

         <p ui-t="invalid.translation.path"></p>

         <p>{{"invalid.translation.again" | t}}</p>
     </div>
     </doc:source>
     </doc:example>
     */
    uiI18n.directive('uiI18n',['uiI18n.packs', function(packs) {
        return {
            link: function($scope, $elm, $attrs) {
                // check for watchable property
                var lang = $scope.$eval($attrs.uiI18n);
                if (lang){
                    $scope.$watch($attrs.uiI18n, function(newLang){
                        if (newLang){
                            packs.lang = newLang.toLowerCase();
                        }
                    });
                } else {
                    // fall back to the string value
                    lang = $attrs.uiI18n;
                }
                packs.lang = lang;
            }
        };
    }]);

    // directive syntax
    uiI18n.directive('uiT',['$parse', 'uiI18n.packs', function($parse, packs) {
        return {
            require: '?^uiI18n',
            link: function($scope, $elm, $attrs) {
                var getter = $parse($attrs.uiT);

                $scope.$watch(function(){
                    return packs.lang;
                }, function(){
                    // set text based on i18n current language
                    $elm.html(getter(packs.i18n[packs.lang]) || "Missing translation: " + $attrs.uiT);
                });
            }
        };
    }]);

    // optional filter syntax
    uiI18n.filter('t', ['$parse', 'uiI18n.packs', function($parse, packs) {
        return function(data) {
            var getter = $parse(data);
            // set text based on i18n current language
            return getter(packs.i18n[packs.lang]) || "Missing translation: " + data;
        };
    }]);
})();