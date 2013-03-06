/**
  Main namespace.
@namespace
*/
if (!window.ng) {
    window.ng = {};
}
window.ngGrid = {};
/**
  Model to house the i18n objects.
@namespace
*/
window.ngGrid.i18n = {};
var ngGridServices = angular.module('ngGrid.services', []);
var ngGridDirectives = angular.module('ngGrid.directives', []);
var ngGridFilters = angular.module('ngGrid.filters', []);