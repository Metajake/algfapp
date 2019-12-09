var hots = {},
originalCalendarWidths = [],
notedHots = {};

var turnCounts = {
  '1/3': 0.3,
  '1/2': 0.5,
  '2/3': 0.6,
  ' ': 1,
  'x2': 2,
  'x3': 3,
  'x4': 4,
  'x5': 5,
  'x6': 6,
  'x7': 7,
  'x8': 8,
  'x9': 9,
}

var weekdays = {
  0 : "SUN",
  1 : "MON",
  2 : "TUES",
  3 : "WED",
  4 : "THURS",
  5 : "FRI",
  6 :"SAT",
}

var hotOptions = {
  allowInsertRow: true,
  colWidths: [80,140,140,180,60],
  rowHeaderWidth: 20,
  manualColumnResize: true,
  manualRowMove: true,
  beforeChangeRender: afterCellChange,
  afterCreateRow: afterCreateRemoveRow,
  afterRemoveRow: afterCreateRemoveRow,
  afterRowMove: afterCreateRemoveRow,
  contextMenu: true,
  contextMenu: {
    items:{
      "row_below": {},
      "row_above": {},
      "remove_row": {},
      'copy':{},
      'cut': {},
      'undo': {},
      'redo': {},
    },
  },
  minRows: 10,
  colHeaders: ['#', 'Product Name', 'Distributor', 'Note/Fill Equipment', '+/- Turn'],
  dropdownMenu: false,
  rowHeaders: function(){return'&#9868;'},
  wordWrap: false,
  columns:[
    {},
    {},
    {},
    {},
    {
      editor: 'select',
      selectOptions: ['1/3', '1/2', '2/3', ' ', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9'],
    },
  ],
  mergeCells: true,
  licenseKey: 'non-commercial-and-evaluation'
}

//----------------EVENTS-------------------//
$('#btn-print').on('click', function(e){
  printSchedule()
})

//------------INIT---------------//
ajaxLoadCalendars();
