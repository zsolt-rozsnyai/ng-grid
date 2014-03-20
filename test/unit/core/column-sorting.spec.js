
describe('columnSorter', function() {
  var grid, $scope, $compile, recompile, uiGridConstants, columnSorter, Grid, GridColumn, GridRow;

  var data = [
    { "name": "Ethel Price", "gender": "female", "company": "Enersol" },
    { "name": "Claudine Neal", "gender": "female", "company": "Sealoud" },
    { "name": "Beryl Rice", "gender": "female", "company": "Velity" },
    { "name": "Wilder Gonzales", "gender": "male", "company": "Geekko" }
  ];

  beforeEach(module('ui.grid'));

  beforeEach(inject(function (_$compile_, $rootScope, _uiGridConstants_, _columnSorter_, _Grid_, _GridColumn_, _GridRow_) {
    $scope = $rootScope;
    $compile = _$compile_;
    uiGridConstants = _uiGridConstants_;
    columnSorter = _columnSorter_;
    Grid = _Grid_;
    GridColumn = _GridColumn_;
    GridRow = _GridRow_;

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
  }));

  afterEach(function () {
    // grid = null;
  });

  // TODO(c0bra): Add test for grid sorting constants?

  describe('guessSortFn', function () {
    it('should guess a number', function () {
      var guessFn = columnSorter.guessSortFn(5);
      expect(guessFn).toBe(columnSorter.sortNumber);
    });

    it('should guess a date', function () {
      var guessFn = columnSorter.guessSortFn(new Date());

      expect(guessFn).toBe(columnSorter.sortDate);
    });

    it('should guess a string', function () {
      var guessFn = columnSorter.guessSortFn("hi there!");

      expect(guessFn).toBe(columnSorter.sortAlpha);
    });

    it('should guess a number when a number is signed', function () {
      var guessFn = columnSorter.guessSortFn(-50);
      expect(guessFn).toBe(columnSorter.sortNumber, 'Negative signed number');

      guessFn = columnSorter.guessSortFn(+50);
      expect(guessFn).toBe(columnSorter.sortNumber, 'Positive signed number');
    });

    it('should guess a number-string when the value is a numeric string', function () {
      var guessFn = columnSorter.guessSortFn('500');
      expect(guessFn).toBe(columnSorter.sortNumberStr, '500');

      guessFn = columnSorter.guessSortFn('500.00');
      expect(guessFn).toBe(columnSorter.sortNumberStr, '500.00');

      guessFn = columnSorter.guessSortFn('-500.00');
      expect(guessFn).toBe(columnSorter.sortNumberStr, '-500.00');
    });

    it('should guess a number-string when the value is currency', function () {
      var guessFn = columnSorter.guessSortFn('$500');
      expect(guessFn).toBe(columnSorter.sortNumberStr, '$500');

      guessFn = columnSorter.guessSortFn('¥500');
      expect(guessFn).toBe(columnSorter.sortNumberStr, '¥500');
    });

    it('should allow a currency symbol to come after the number', function () {
      var guessFn = columnSorter.guessSortFn('500$');
      expect(guessFn).toBe(columnSorter.sortNumberStr, '500$');
    });

    it('should allow percents', function () {
      var guessFn = columnSorter.guessSortFn('75.25%');
      expect(guessFn).toBe(columnSorter.sortNumberStr, '75.25%');
    });

    it('should not allow percent signs before the number', function () {
      var guessFn = columnSorter.guessSortFn('%75.25');
      expect(guessFn).toBe(columnSorter.sortAlpha, '%75.25');
    });

    it('should allow booleans', function () {
      var guessFn = columnSorter.guessSortFn(true);
      expect(guessFn).toBe(columnSorter.sortBool, true);

      guessFn = columnSorter.guessSortFn(false);
      expect(guessFn).toBe(columnSorter.sortBool, false);
    });

    it('should use basicSort for objects', function () {
      function WeirdObject() {}
      var val = new WeirdObject();

      var guessFn = columnSorter.guessSortFn(val);
      expect(guessFn).toBe(columnSorter.basicSort, 'WeirdObject');
    });
  });

  describe('sort', function() {
    var grid, rows, cols;

    beforeEach(function() {
      grid = new Grid(123);

      var e1 = { name: 'Bob' };
      var e2 = { name: 'Jim' };

      rows = [
        new GridRow(e1, 0),
        new GridRow(e2, 1)
      ];

      cols = [
        new GridColumn({
          name: 'name',
          sort: {
            direction: uiGridConstants.ASC,
            priority: 0
          }
        }, 0)
      ];
    });

    it('should sort this ascending', function() {
      var ret = columnSorter.sort(grid, rows, cols);

      expect(ret[0].entity.name).toEqual('Bob');
    });

    it('should sort things descending', function() {
      cols[0].sort.direction = uiGridConstants.DESC;

      var ret = columnSorter.sort(grid, rows, cols);

      expect(ret[0].entity.name).toEqual('Jim');
    });

  });

  // it("should use the column's specified sorting algorithm if it has one", function () {
      
  // });

  describe('refreshRows', function() {
    it('should do something', function () {
      // TODO(c0bra) ...
    });
  });

});