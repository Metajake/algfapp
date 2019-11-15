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
  minRows: 5,
  colHeaders: false,
  rowHeaders: false,
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
  var cellValue = this.getValue();
  console.log(cellValue);
  // console.log(this.getData());
  url: 'ajax/check_product_name/',
  data:{
    "date": cellValue,
  },
  success: function(data){
    console.log("Success Ajax Call");
  }
}

$.ajax({
  url: 'ajax/get_calendars/',
  dataType:'html',
  success: function(data){
    createCalendars(JSON.parse(data))
  },
});

function createCalendars(calendarData){
  for (var key in calendarData){
    if (calendarData.hasOwnProperty(key)){
      createWeeklyCalendar(key, calendarData[key])
    }
  }
}

function createWeeklyCalendar(calendarWeekDate, calendarWeekData){
  var thisWeekContainer = document.createElement('div');
  thisWeekContainer.setAttribute('id', "week-"+calendarWeekDate);
  thisWeekContainer.classList.add('is-flex')
  document.getElementById("calendars").appendChild(thisWeekContainer)

  for (var i = 0;i < calendarWeekData.length; i++){
    var thisDaysContainer = document.createElement('div');
    thisDaysContainer.setAttribute('id', "date-"+calendarWeekData[i].date);
    var thisDaysContainerHeader = document.createElement('div')
    thisWeekContainer.appendChild(thisDaysContainer)

    var thisHotOptions = hotOptions
    thisHotOptions['data'] = calendarWeekData[i].data;
    var thisHot = new Handsontable(thisDaysContainer, thisHotOptions)

    var thisHeadline = document.createElement('h6');
    thisHeadline.classList.add('text-center')
    thisHeadline.innerHTML = calendarWeekData[i].date
    thisDaysContainerHeader.appendChild(thisHeadline)
    $(thisDaysContainer).prepend(thisDaysContainerHeader)
  }
}
