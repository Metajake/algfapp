var hots = {};

var turnCounts = {
  '1/3': 0.3,
  '1/2': 0.5,
  '2/3': 0.6,
  'x2': 2,
  'x3': 3,
  'x4': 4,
  'x5': 5,
  'x6': 6,
}

var weekdays = {
  0 : "Sunday",
  1 : "Monday",
  2 : "Tuesday",
  3 : "Wednesday",
  4 : "Thursday",
  5 : "Friday",
  6 :"Saturday",
}

var hotOptions = {
  contextMenu: true,
  allowInsertRow: true,
  colWidths: [80,140,140,140,60],
  manualColumnResize: true,
  beforeChangeRender: afterCellChange,
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
  colHeaders: ['Schedule #', 'Product Name', 'Distributor', 'Note', '+/- Turn'],
  dropdownMenu: false,
  rowHeaders: false,
  wordWrap: false,
  columns:[
    {},
    {},
    {},
    {},
    {
      editor: 'select',
      selectOptions: ['1/3', '1/2', '2/3', 'x2', 'x3', 'x4', 'x5', 'x6'],
    },
  ],
  licenseKey: 'non-commercial-and-evaluation'
}

function afterCellChange(changes, source){
  var changedRow = changes[0][0], changedCol = changes[0][1], thisHot = this, cellValue;

  checkIfColOneChangeAndUpdateColTwo(changedCol, changedRow, cellValue, thisHot)

  var dayData = {
    data: thisHot.getData(),
  };

  ajaxUpdateCalendarDayData(dayData, thisHot);

  updateTurnCounts();
}

function checkIfColOneChangeAndUpdateColTwo(changedColumn, changedRow, scheduleNumberValueToCheck, thisHotInstance){
  if(changedColumn === 0){
    scheduleNumberValueToCheck = thisHotInstance.getDataAtCell(changedRow, changedColumn);
    ajaxUpdateProductNameFromScheduleNumber(scheduleNumberValueToCheck, thisHotInstance, changedRow);
  }
}

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

  for (var weekDayIteration = 0;weekDayIteration < calendarWeekData.length; weekDayIteration++){
    createDayCalendar(calendarWeekData, thisWeekContainer, weekDayIteration)
  }
}

function createDayCalendar(calendarWeekData, thisWeekContainer, dayInWeek){
  var thisDaysContainer = document.createElement('div');
  thisDaysContainer.setAttribute('id', "date-"+calendarWeekData[dayInWeek].date);
  thisDaysContainer.classList.add('day-container');
  var thisDaysContainerHeader = document.createElement('div')
  thisDaysContainerHeader.classList.add('day-header', 'is-flex')
  var thisDaysContainerContent = document.createElement('div')
  thisDaysContainerContent.classList.add('day-content')
  thisWeekContainer.appendChild(thisDaysContainer)
  $(thisDaysContainer).append(thisDaysContainerContent)

  var thisHotOptions = hotOptions
  // console.log(calendarWeekData[i].data)
  thisHotOptions['data'] = calendarWeekData[dayInWeek].data;
  var thisHot = new Handsontable(thisDaysContainerContent, thisHotOptions)
  hots[calendarWeekData[dayInWeek].date] = thisHot;


  calendarDateObject = new Date( Date.parse(calendarWeekData[dayInWeek].date) )
  var thisHeadline = document.createElement('h6');
  thisHeadline.innerHTML = weekdays[calendarDateObject.getDay()] + ' - ' + calendarWeekData[dayInWeek].date.slice(3,5);
  thisDaysContainerHeader.appendChild(thisHeadline)

  var thisTurnCount = document.createElement('h6');
  thisTurnCount.innerHTML = "Turns: <span class=\"turn-count\"></span>"
  thisDaysContainerHeader.appendChild(thisTurnCount)

  $(thisDaysContainer).prepend(thisDaysContainerHeader)
}

function ajaxUpdateProductNameFromScheduleNumber(scheduleNumber, tableToUpdate, rowToUpdate){
  $.ajax({
    url: 'ajax/check_product_name/',
    type: "POST",
    data:{
      "data": scheduleNumber,
    },
    success: function(data){
      // console.log("Success Ajax Call");
      if(data === ''){
        // console.log("Product Does Not Exist in Database yet.");
      }else{
        tableToUpdate.setDataAtCell(rowToUpdate, 1, data)
      }
    }
  });
}

function ajaxUpdateCalendarDayData(dataToUpdate, calendarToUpdate){
  $.ajax({
    url: 'ajax/update_day_schedule/',
    type: "POST",
    data:{
      "date": calendarToUpdate.getInstance().rootElement.parentNode.id.slice(5),
      "data": JSON.stringify(dataToUpdate),
    },
    success: function(data){
      // console.log("Success Ajax Call: Update Schedule Day");
    }
  });
}

function ajaxLoadCalendars(){
  $.ajax({
    url: 'ajax/get_calendars/',
    dataType:'html',
    success: function(data){
      createCalendars(JSON.parse(data))
      updateTurnCounts();
    },
  });
}

function updateTurnCounts(){
  for (var [date, hot] of Object.entries(hots)){
    updateTurnCount(hot);
  }
}

function updateTurnCount(hotToUpdate){
  turnCount = 0;
  for(var i = 0; i < hotToUpdate.countRows(); i++){
    rowData = hotToUpdate.getDataAtRow(i);
    if ( rowData[0] ){
      if (rowData[4] ){
        turnCount += turnCounts[rowData[4]]
      }else{
        turnCount += 1
      }
    }
  }
  $(hotToUpdate.rootElement).siblings('.day-header').find('.turn-count').html(turnCount.toFixed(2))
}

function togglePrintDisplay(){
  calendarTableHeaders = $('.htCore thead')
  calendarTableBodies = $('.day-content .htCore tbody').not('.ht_clone_top .htCore tbody').not('.ht_clone_bottom .htCore tbody').not('.ht_clone_left .htCore tbody')

  calendarTableHeaders.each(function(){
    toggleNonPrintingColumns(this)
  })

  calendarTableBodies.each(function(){
    toggleNonPrintingColumns(this)
  })
}

function toggleNonPrintingColumns(tableToToggle){
  thisCalendarsRows = $(tableToToggle).find('tr')
  $(thisCalendarsRows).find('*:nth-child(3)').toggle();
  $(thisCalendarsRows).find('*:nth-child(4)').toggle();
  $(thisCalendarsRows).find('*:nth-child(5)').toggle();
}

function printSchedule(){
  var originalCalendarWidths = [];

  togglePrintDisplay()

  for (var [date, hot] of Object.entries(hots)){
    //TODO Manually Resize 2nd Column for printing
    // hot.manualColumnResize(1,50);
  }

  $('.day-container').each(function(){
    col1Width = $('.htCore thead tr:nth-child(1) th:nth-child(1)', this).width()
    col2Width = $('.htCore thead tr:nth-child(1) th:nth-child(2)', this).width()
    originalWidth = $(this).width()
    originalCalendarWidths.push(originalWidth)
    $(this).width(col1Width+col2Width)
  })

  window.print()

  $('.day-container').each(function(index){
    $(this).width(originalCalendarWidths[index])
  });
  togglePrintDisplay()
}

$('#btn-print').on('click', function(e){
  printSchedule()
})

ajaxLoadCalendars();

console.log(hots)
