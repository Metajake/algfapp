var hots = {},
originalCalendarWidths = [];

var turnCounts = {
  '1/3': 0.3,
  '1/2': 0.5,
  '2/3': 0.6,
  ' ': 0,
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
  colHeaders: ['Schedule #', 'Product Name', 'Distributor', 'Note/Fill Equipment', '+/- Turn'],
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
  licenseKey: 'non-commercial-and-evaluation'
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
      writeCalendarsFromServerData(JSON.parse(data))
      updateTurnCounts();
      updateWeekTurnCounts();
    },
  });
}

function afterCellChange(changes, source){
  var changedRow = changes[0][0], changedCol = changes[0][1], thisHot = this, cellValue;

  checkIfColOneChangeAndUpdateColTwo(changedCol, changedRow, cellValue, thisHot)

  var dayData = {
    data: thisHot.getData(),
  };

  ajaxUpdateCalendarDayData(dayData, thisHot);

  updateTurnCount(thisHot);
  updateWeekTurnCounts();
}

function afterCreateRemoveRow(index, amount, source){
  thisHot = hots[$(this.rootElement).parent().attr('id').slice(5)]
  if(thisHot){
    var dayData = {
      data: thisHot.getData(),
    };
    ajaxUpdateCalendarDayData(dayData, thisHot);
  }
}

function checkIfColOneChangeAndUpdateColTwo(changedColumn, changedRow, scheduleNumberValueToCheck, thisHotInstance){
  if(changedColumn === 0){
    scheduleNumberValueToCheck = thisHotInstance.getDataAtCell(changedRow, changedColumn);
    ajaxUpdateProductNameFromScheduleNumber(scheduleNumberValueToCheck, thisHotInstance, changedRow);
  }
}

function writeCalendarsFromServerData(calendarData){
  for (var key in calendarData){
    if (calendarData.hasOwnProperty(key)){
      writeWeeklyCalendar(key, calendarData[key])
    }
  }
}

function writeWeeklyCalendar(calendarWeekDate, calendarWeekData){
  var thisWeekContainer = document.createElement('div');
  thisWeekContainer.setAttribute('id', "week-"+calendarWeekDate);
  thisWeekContainer.classList.add('week-container')

  var thisWeekHeaderContainer = document.createElement('div');
  thisWeekHeaderContainer.classList.add('week-header', 'is-flex')
  var thisWeekHeadline = document.createElement('h6');
  thisWeekHeadline.innerHTML = "Week Total Turns: <span class=\"week-turn-count\"></span>"

  var thisWeekContentContainer = document.createElement('div');
  thisWeekContentContainer.classList.add('week-content-container', 'is-flex');


  thisWeekHeaderContainer.appendChild(thisWeekHeadline)
  thisWeekContainer.appendChild(thisWeekHeaderContainer)
  thisWeekContainer.appendChild(thisWeekContentContainer)
  document.getElementById("calendars").appendChild(thisWeekContainer)

  for (var weekDayIteration = 0;weekDayIteration < calendarWeekData.length; weekDayIteration++){
    writeDayCalendar(calendarWeekData, thisWeekContentContainer, weekDayIteration)
  }
}

function writeDayCalendar(calendarWeekData, thisWeekContainer, dayInWeek){
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
  $(hotToUpdate.rootElement).siblings('.day-header').find('.turn-count').html(turnCount.toFixed(1))
}

function updateWeekTurnCounts(){
  var weeks = $('.week-container')
  weeks.each(function(){
    var weekDaysTurns = $('.day-header .turn-count', this);
    weekDaysTurnsCount = 0.0
    weekDaysTurns.each(function(){
      weekDaysTurnsCount += parseFloat($(this).html());
    })
    $(this).find('.week-turn-count').html(weekDaysTurnsCount)
  })
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
  $(thisCalendarsRows).find('*:nth-child(4)').toggle();
  $(thisCalendarsRows).find('*:nth-child(5)').toggle();
}

function resizeColumnsForPrint(weekElement){
  if (!checkSaturdayHasTurns(weekElement)){
    $('.day-container', weekElement).each(function(){
      $(this).width(224);
      $(this).find('.ht_master table.htCore').width(224);
    })
  }else{
    $('.day-container', weekElement).each(function(){
      $(this).width(184);
      $(this).find('.ht_master table.htCore').width(184);
    })
  }
}

function resizeColumnsForWeb(){
  $('.day-container').each(function(index){
    $(this).width(getOriginalTableWidth())
    $(this).find('.ht_master table.htCore').width('100%');
  });
}

function getOriginalTableWidth(){
  sum = 0
  for (var i = 0; i < hotOptions.colWidths.length;i++){
    sum += hotOptions.colWidths[i]
  }
  sum += hotOptions.rowHeaderWidth
  return sum
}

function checkSaturdayHasTurns(weekToCheck){
  thisSaturdaysTurns = parseFloat($('.day-container:last-child .turn-count', weekToCheck).html())
  return thisSaturdaysTurns > 0.0
}

function toggleSaturdayIfProduct(){
  var weeks = $('.week-container')
  weeks.each(function(){
    if (!checkSaturdayHasTurns(this)){
      $('.day-container:last-child', this).toggle();
    }
  })
}

function showAllSaturdays(){
  var weeks = $('.week-container')
  weeks.each(function(){
    $('.day-container:last-child', this).show();
  })
}

function printSchedule(){
  toggleSaturdayIfProduct()
  togglePrintDisplay()

  $('.week-container').each(function(){
    resizeColumnsForPrint(this)
  })

  window.print()

  showAllSaturdays()
  resizeColumnsForWeb()
  togglePrintDisplay()
}

$('#btn-print').on('click', function(e){
  printSchedule()
})

ajaxLoadCalendars();
