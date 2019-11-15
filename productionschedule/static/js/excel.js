console.log('yo');

var data = [
  [10, 11, 12, 13]
];
var container = document.getElementById('example');

var hotOptions = {
  colHeaders: true,
  rowHeaders: true,
  dropdownMenu: true,
  contextMenu: true,
  allowInsertRow: true,
  // width: '100%',
  // height: '100%',
  colWidths: 200,
  manualColumnResize: true,
  manualRowResize: true,
  afterChange: afterCellChange,
  afterPaste: afterCellChange,
  contextMenu: {
    items:{
      'Add Note': {
        name: "Add Note",
      },
      "col_left": {},
      "col_right": {},
      "row_below": {},
      "row_above": {},
      'copy':{},
      'cut': {},
      'undo': {},
      'redo': {},
    },
  },
  minRows: 2,
  licenseKey: 'non-commercial-and-evaluation'
}

// var hot = new Handsontable(container, {
//   data: data,
//   colHeaders: true,
//   rowHeaders: true,
//   dropdownMenu: true,
//   contextMenu: true,
//   allowInsertRow: true,
//   // width: '100%',
//   // height: '100%',
//   colWidths: 200,
//   manualColumnResize: true,
//   manualRowResize: true,
//   afterChange: afterCellChange,
//   afterPaste: afterCellChange,
//   contextMenu: {
//     items:{
//       'Add Note': {
//         name: "Add Note",
//       },
//       "col_left": {},
//       "col_right": {},
//       "row_below": {},
//       "row_above": {},
//       'copy':{},
//       'cut': {},
//       'undo': {},
//       'redo': {},
//     },
//   },
//   licenseKey: 'non-commercial-and-evaluation'
// });

function afterCellChange(){
  console.log("cell change");
}

$.ajax({
  url: 'ajax/get_calendars/',
  dataType:'html',
  success: function(data){
    // $('#calendar-data').html('');
    // $('#calendar-data').html(data);
    createCalendars(JSON.parse(data))
  },
});

function createCalendars(calendarData){
  for (i=0;i<calendarData.length;i++){
    createCalendar(calendarData[i]);
  }
}

function createCalendar(calendarData){
  var thisContainer = document.createElement('div');
  thisContainer.setAttribute('id', "week-"+calendarData[0]);
  document.getElementById("calendars").appendChild(thisContainer)

  var thisHotOptions = hotOptions
  thisHotOptions['colHeaders'] = calendarData[0];
  // thisHotOptions['data'] = calendarData;
  var thisHot = new Handsontable(thisContainer, thisHotOptions)
}
