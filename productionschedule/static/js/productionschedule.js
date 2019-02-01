$('.cell').draggable({
  cursor:'move',
  // snap: '.day',
  helper: 'clone',
  delay:350,
  connectToSortable: '.sortable',
  start: handleDragStart,
  stop: handleDragStop,
});

$('.cell').droppable({
  drop:handleCellDrop,
})
$('.day').droppable({
  drop: handleDayDrop,
})

$('.ui-duplicate').click(function(){
  var newCell = $(this).closest('.cell').clone(true, true);
  newCell.insertAfter($(this).closest('.cell'));
  var productCodeToSave = $(this).parent().find('.product-code p').text();
  var companyToSave = $(this).parent().find('.customer p').text();
  var dateToSave = $(this).parent().parent().parent().find('.production-date').text();
  if(productCodeToSave==''){productCodeToSave="_"}
  if(companyToSave==''){companyToSave="_"}
  ajaxSaveNew(productCodeToSave, companyToSave, dateToSave, newCell)
})

$('.ui-delete').click(function(){
  var idToDelete = parseInt( $(this).parent().attr('id') );
  var productionDate = $(this).parent().parent().parent().find('.production-date').text();
  var orderFrom = $(this).parent().parent();
  $(this).parent().remove();
  var order = constructDayItemOrder(orderFrom);
  ajaxDelete(idToDelete, productionDate, order)
});

var currentEditValue = '';

$(".column p").click(columnClickEvent);

function columnClickEvent(){
  currentEditValue = $(this).text();
  var thisForm = $(this).parent().find('form');
  $(this).css('display', 'none');
  thisForm.css('display', 'block');
  thisForm.find('input[type="text"]').val(currentEditValue).focus().blur(function(){
    var updateValue = $(this).val();
    flipBackToParagraph(this, updateValue);
    var id = thisForm.closest('.cell').attr('id');
    var productCodeToSave = thisForm.closest('.cell').find('.product-code p').text();
    var companyToSave = thisForm.closest('.cell').find('.customer p').text();
    var dateToSave = thisForm.parent().parent().parent().parent().find('.production-date').text();
    var order = constructDayItemOrder(this);
    ajaxUpdate(id, productCodeToSave, companyToSave, dateToSave, order);
  });
}

$(document).keyup(function(e) {
  if (e.keyCode === 27){ //ESCAPE KEY
      if($('.update-form').find('input').is(':focus')){
          cancelEdit();
      }
  }
});

$('.update-form').submit(function(e){
  e.preventDefault();
  var updateValue = $(this).find('input[type="text"]').val();
  $(this).find('input[type="text"]').off('blur');
  flipBackToParagraph(this, updateValue);
  var thisForm = $(this).parent().find('form');
  var id = $(this).parent().find('form').closest('.cell').attr('id');
  var productCodeToSave = thisForm.closest('.cell').find('.product-code p').text();
  var companyToSave = thisForm.closest('.cell').find('.customer p').text();
  var dateToSave = thisForm.parent().parent().parent().parent().find('.production-date').text();
  var order = constructDayItemOrder(this);
  ajaxUpdate(id, productCodeToSave, companyToSave, dateToSave, order);
})

$('.add-cell').click(function(){
  var cellToClone = $(this).parent().find('.sortable').find(".cell").last();
  // console.log(cellToClone.hasClass('clonable'))
  var newCell = cellToClone.clone(true, true);
  if(newCell.hasClass('clonable')){
    newCell.removeClass('clonable');
    newCell.find('.note').css('display', 'none')
  }
  newCell.find('.product-code p').html("&nbsp;");
  newCell.find('.customer p').html("&nbsp;");
  newCell.insertAfter(cellToClone);
  var productCodeToSave = newCell.find('.product-code p').text();
  var companyToSave = newCell.find('.customer p').text();
  var dateToSave = $(this).parent().find('.production-date').text();
  ajaxSaveNew(productCodeToSave, companyToSave, dateToSave, newCell)
})

function handleDragStop(){
  setTimeout(function(){
    $(".column p").click(columnClickEvent);
  }, 300)
}

function handleCellDrop(event,ui){
  var cellToDrop = $(ui.draggable);
  $('.day').droppable("disable");
  var oldDateToSave = cellToDrop.parent().parent().find('.production-date').text();
  var oldDay = cellToDrop.parent();
  var cellToDropOn = $(event.target);
  if(cellToDropOn){
    cellToDrop.insertBefore(cellToDropOn)
  }
  var dateToSave = cellToDropOn.parent().parent().find('.production-date').text();
  var order = constructDayItemOrder(cellToDropOn.parent());
  updateAjaxScheduleOrder(dateToSave, order)
  var oldDayReordered = constructDayItemOrder(oldDay);
  updateAjaxScheduleOrder(oldDateToSave, oldDayReordered);
  setTimeout(function(){
    $('.day').droppable("enable");
  }, 600)
}

var dayDropCellToDrop, dayDropOldDateToSave, dayDropOldDay, dayDropOldDayReordered;

function handleDragStart(){
  $('.column p').off("click");
  dayDropCellToDrop = $(this);
  dayDropOldDateToSave = dayDropCellToDrop.parent().parent().find('.production-date').text();
  dayDropOldDay = dayDropCellToDrop.parent();
  dayDropOldDayReordered = constructDayItemOrder(dayDropOldDay);
}

function handleDayDrop(event, ui){
  var targetDay = $(event.target);
  targetDay.find('.sortable').append(dayDropCellToDrop)
  var dayDropDateToSave = targetDay.find('.production-date').text();
  if(dayDropDateToSave != dayDropOldDateToSave){
    dayDropOldDayReordered = constructDayItemOrder(dayDropOldDay);
    updateAjaxScheduleOrder(dayDropOldDateToSave, dayDropOldDayReordered)
  }
  var dayDropOrder = constructDayItemOrder(targetDay.find('.sortable'));
  updateAjaxScheduleOrder(dayDropDateToSave, dayDropOrder)
}

function cancelEdit(){
  var closestForm = $(document.activeElement).closest('.update-form');
  closestForm.find('input[type="text"]').off('blur');
  closestForm.find('input[type="text"]').val('');
  closestForm.css('display','none');
  $(document.activeElement).closest('.column').find('p').css('display', 'block');
}

function flipBackToParagraph(element, newValue){
  $(element).closest('.column').find('p').text(newValue);
  $(element).closest('.update-form').css('display', 'none');
  $(element).closest('.column').find('p').css('display', 'block');
}

function constructDayItemOrder(dayToOrder){
  var itemListForDay = $(dayToOrder).closest('.sortable').find('.cell').not('.clonable');
  var idList = [];
  itemListForDay.each(function(){
    idList.push($(this).attr('id'));
  })
  return idList.toString()
}

function ajaxSaveNew(code, company, date, newCell){
  if(code==''){code="_"}
  if(company==''){company="_"}
  $.ajax({
    url: "/save/" + date + "/" + code + "/" + company,
    success: function(response){
      newCell.attr('id', response)
      updateAjaxScheduleOrder(date, constructDayItemOrder($(newCell).parent()) )
    },
    error: function(data){
      console.log("Error saving object.")
    }
  });
}

function ajaxUpdate(id, code, company, date, order){
  if(code==''){code="_"}
  if(company==''){company="_"}
  $.ajax({
    url: "/update/" + id + "/" + date + "/" + code + "/" + company + "/" + order,
    success: function(response){
      console.log(response)
    },
    error: function(data){
      console.log("Error updating object.")
    }
  });
}

function ajaxDelete(id, date, order){
  if (order==""){order="_"}
  $.ajax({
    url: "/delete/" + id + "/" + date + "/" + order,
    success: function(response){
      console.log(response)
    },
    error: function(data){
      console.log("Errorrr")
    }
  });
}

function updateAjaxScheduleOrder(date, order){
  if(order == ''){order="_"}
  $.ajax({
    url: "/updateScheduleDay/" + date + "/" + order,
    success: function(response){
      console.log(response)
    },
    error: function(data){
      console.log("Errorrr")
    }
  });
}
