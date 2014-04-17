ddescribe('rowSearcher', function() {
  var grid, $scope, $compile, recompile,
      rows, columns, rowSearcher, uiGridConstants;

  var data = [
    { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
    { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
    { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
    { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
  ];

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _rowSearcher_, Grid, GridRow, GridColumn, _uiGridConstants_) {
    $scope = $rootScope;
    rowSearcher = _rowSearcher_;
    uiGridConstants = _uiGridConstants_;

    // $compile = _$compile_;

    // $scope.gridOpts = {
    //   data: data
    // };

    // recompile = function () {
    //   grid = angular.element('<div style="width: 500px; height: 300px" ui-grid="gridOpts"></div>');
    //   // document.body.appendChild(grid[0]);
    //   $compile(grid)($scope);
    //   $scope.$digest();
    // };

    // recompile();

    grid = new Grid({
        id: 1,
        enableFiltering: true
    });

    rows = grid.rows = [
      new GridRow({ name: 'Bill' }, 0),
      new GridRow({ name: 'Frank' }, 1)
    ];

    columns = grid.columns = [
      new GridColumn({ name: 'name' }, 0)
    ];
  }));

  function setFilter(column, term, condition) {
    column.filters = [];
    column.filters.push({
      term: term,
      condition: condition
    });
  }

  afterEach(function () {
    // angular.element(grid).remove();
    grid = null;
  });

  describe('with one column filtered', function () {
    it('should run the search', function () {
      setFilter(columns[0], 'il', uiGridConstants.filter.CONTAINS);

      var ret = rowSearcher.search(grid, rows, columns);

      expect(ret[0].visible).toBe(true);
      expect(ret[1].visible).toBe(false);
    });
  });

});