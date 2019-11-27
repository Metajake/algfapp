
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

function ajaxCheckProductGluten(scheduleNumber, tableToUpdate, rowToUpdate){
  $.ajax({
    url: 'ajax/check_gluten/',
    type: "POST",
    data:{
      "data": scheduleNumber,
    },
    success: function(data){
      // console.log("Success Ajax Call");
      if(data === ''){
        $(tableToUpdate.getCell(rowToUpdate, 0)).parent().removeClass('is-gluten');
      }else{
        console.log(data)
        $(tableToUpdate.getCell(rowToUpdate, 0)).parent().addClass('is-gluten');
        console.log($(tableToUpdate.getCell(rowToUpdate, 0)).parent())
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
      updateProductsGluten();
    },
  });
}
