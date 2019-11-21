var hotOptions = {
  colHeaders: true,
  rowHeaders: true,
  dropdownMenu: true,
  contextMenu: true,
  allowInsertRow: true,
  colWidths: 200,
  manualColumnResize: true,
  beforeChangeRender: afterCellChange,
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
  maxCols:4,
  colHeaders: false,
  rowHeaders: false,
  licenseKey: 'non-commercial-and-evaluation'
}

ajaxLoadCalendars();

function afterCellChange(changes, source){
  var changedRow = changes[0][0], changedCol = changes[0][1], thisHot = this, cellValue;

  checkIfColOneChangeAndUpdateColTwo(changedCol, changedRow, cellValue, thisHot)

  var dayData = {
    data: thisHot.getData(),
  };

  ajaxUpdateCalendarDayData(dayData, thisHot);
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
  thisWeekContainer.appendChild(thisDaysContainer)

  var thisHotOptions = hotOptions
  // console.log(calendarWeekData[i].data)
  thisHotOptions['data'] = calendarWeekData[dayInWeek].data;
  var thisHot = new Handsontable(thisDaysContainer, thisHotOptions)

  var thisHeadline = document.createElement('h6');
  thisHeadline.classList.add('text-center')
  thisHeadline.innerHTML = calendarWeekData[dayInWeek].date
  thisDaysContainerHeader.appendChild(thisHeadline)
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
      "date": calendarToUpdate.getInstance().rootElement.getAttribute('id').slice(5),
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
    },
  });
}
