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

$('.ui-add-note').click(function(ui){
  var thisNote = $(this).parent().find('.note');
  thisNote.addClass('visible');
  $(this).find('svg').css('display','none');
  toggleParagraphToForm(thisNote.find('p'));
  thisNote.find('input[type="text"]').focus().blur(function(){
    var updateValue = $(this).val();
    if(updateValue==""){updateValue="&nbsp;"}
    thisNote.find('form').css('display', 'none');
    thisNote.find('p').html(updateValue);
    thisNote.find('p').css('display', 'block');
    var id = thisNote.parent().attr('id');
    ajaxUpdateNote(id, updateValue);
  });
})

$('.remove-note').click(function(){
  var thisNote = $(this).parent();
  thisNote.removeClass('visible');
  thisNote.parent().find('.ui-add-note').addClass('visible')
  var id = thisNote.parent().attr('id');
  thisNote.parent().find('.ui-add-note').find('svg').css('display','inline-block');
  ajaxUpdateNote(id, '');
})

$(".column p").click(columnClickEvent);
$(".note p").click(noteClickEvent);

$(document).keyup(function(e) {
  if (e.keyCode === 27){ //ESCAPE
      if($('.update-form').find('input').is(':focus')){
        cancelEdit();
      }else if($('.update-note').find('input').is(':focus')){
        cancelNoteEdit()
      }
  }
  switch(e.which) {
    case 37: handleLeftClick()
    break;

    case 38: handleUpClick()
    break;

    case 39: handleRightClick()
    break;

    case 40: handleDownClick()
    break;

    default: return;
  }
});

$('.update-form').submit(function(e){
  e.preventDefault();
  var updateValue = $(this).find('input[type="text"]').val();
  $(this).find('input[type="text"]').off('blur');
  flipBackToParagraph(this, updateValue);
  var thisForm = $(this);
  var id = thisForm.closest('.cell').attr('id');
  var productCodeToSave = thisForm.closest('.cell').find('.product-code p').text();
  var companyToSave = thisForm.closest('.cell').find('.customer p').text();
  var dateToSave = thisForm.parent().parent().parent().parent().find('.production-date').text();
  var order = constructDayItemOrder(this);
  ajaxUpdate(id, productCodeToSave, companyToSave, dateToSave, order);
})

$('.update-note').submit(function(e){
  e.preventDefault();
  var updateValue = $(this).find('input[type="text"]').val();
  $(this).find('input[type="text"]').off('blur');
  flipBackToParagraph(this, updateValue);
  var thisForm = $(this);
  var id = thisForm.parent().parent().attr('id');
  ajaxUpdateNote(id, updateValue);
})

var selectedColumn, selectedColumnDay, selectedColumnRow, selectedColumnIndex, selectedColumnWeek;

function handleRightClick(){
  selectedColumn = $('.selected');
  selectedColumnDay = $('.selected').parent().parent().parent();

  if(selectedColumn.next('.column').length){
    selectedColumn.next().toggleClass("selected");
    selectedColumn.toggleClass("selected");
    selectedColumn = $('.selected');
  }else if(selectedColumnDay.next('.day').length){
    var nextDayHasCells = selectedColumnDay.nextAll('.day').find('.cell').not('.clonable');
    if(nextDayHasCells.length){
      var firstCell = nextDayHasCells.first();
      selectedColumn.toggleClass("selected");
      selectedColumn = firstCell.find('.column').first();
      selectedColumn.toggleClass("selected");
    }
  }

}

function handleLeftClick(){
  selectedColumn = $('.selected');
  selectedColumnDay = $('.selected').parent().parent().parent();

  if(selectedColumn.prev('.column').length){
    selectedColumn.prev().toggleClass("selected");
    selectedColumn.toggleClass("selected");
    selectedColumn = $('.selected');
  }else if(selectedColumnDay.prev('.day').length){
    var prevDayHasCells = selectedColumnDay.prevAll('.day').has('.cell:not(.clonable)');
    if(prevDayHasCells.length){
      var firstCell = prevDayHasCells.first();
      selectedColumn.toggleClass("selected");
      selectedColumn = firstCell.find('.cell').not('.clonable').first().find('.column').last();
      selectedColumn.toggleClass("selected");
    }
  }

}

function handleDownClick(){
  selectedColumn = $('.selected');
  selectedColumnDay = $('.selected').parent().parent().parent();
  selectedColumnRow = $('.selected').parent();
  selectedColumnWeek = $('.selected').parent().parent().parent().parent();
  selectedColumnIndex = selectedColumnRow.find('.selected').index();

  if(selectedColumnRow.next('.cell').length){
    $( selectedColumnRow.next('.cell').find('.column')[selectedColumnIndex] ).toggleClass("selected");
    selectedColumn.toggleClass("selected");
    selectedColumn = $('.selected');
  }else if(selectedColumnWeek.next('.week').length){
    var selectedDayIndex = selectedColumnDay.index()
    var nextWeekSelectedDayHasCells, firstCell;

    selectedColumnWeek.nextAll('.week').each(function(index, element){
      if($(element).children('.day:eq('+selectedDayIndex+')').has('.cell:not(.clonable)').length ){
        nextWeekSelectedDayHasCells = $(element).children('.day:eq('+selectedDayIndex+')').has('.cell:not(.clonable)');
        firstCell = nextWeekSelectedDayHasCells.find('.cell:not(.clonable)').first()
        selectedColumn.toggleClass("selected");
        selectedColumn = firstCell.find('.column').eq(selectedColumnIndex);
        selectedColumn.toggleClass('selected');
        return false;
      }
    });
  }
}

function handleUpClick(){
  selectedColumn = $('.selected');
  selectedColumnDay = $('.selected').parent().parent().parent();
  selectedColumnRow = $('.selected').parent();
  selectedColumnWeek = $('.selected').parent().parent().parent().parent();
  selectedColumnIndex = selectedColumnRow.find('.selected').index();

  if(selectedColumnRow.prev('.cell:not(.clonable)').length){
    $( selectedColumnRow.prev('.cell').find('.column')[selectedColumnIndex] ).toggleClass("selected");
    selectedColumn.toggleClass("selected");
    selectedColumn = $('.selected');
  }else if(selectedColumnWeek.prev('.week').length){
    var selectedDayIndex = selectedColumnDay.index()
    var prevWeekSelectedDayHasCells, lastCell;

    selectedColumnWeek.prevAll('.week').each(function(){
      if($(this).children('.day:eq('+selectedDayIndex+')').has('.cell:not(.clonable)').length ){
        prevWeekSelectedDayHasCells = $(this).children('.day:eq('+selectedDayIndex+')').has('.cell:not(.clonable)');
        lastCell = prevWeekSelectedDayHasCells.find('.cell:not(.clonable)').last()
        selectedColumn.toggleClass("selected");
        selectedColumn = lastCell.find('.column').eq(selectedColumnIndex);
        selectedColumn.toggleClass('selected');
        return false;
      }
    });
  }
}

function columnClickEvent(ui){
  var editValues = toggleParagraphToForm(ui.target);
  editValues.thisForm.find('input[type="text"]').val(editValues.paragraphValue).focus().blur(function(){
    var updateValue = $(this).val();
    flipBackToParagraph(editValues.thisForm, updateValue);
    var id = editValues.thisForm.closest('.cell').attr('id');
    var productCodeToSave = editValues.thisForm.closest('.cell').find('.product-code p').text();
    var companyToSave = editValues.thisForm.closest('.cell').find('.customer p').text();
    var dateToSave = editValues.thisForm.parent().parent().parent().parent().find('.production-date').text();
    var order = constructDayItemOrder(this);
    ajaxUpdate(id, productCodeToSave, companyToSave, dateToSave, order);
  });
}

function noteClickEvent(ui){
  var editValues = toggleParagraphToForm(ui.target);
  editValues.thisForm.find('input[type="text"]').val(editValues.paragraphValue).focus()
}

function toggleParagraphToForm(paragraphClicked){
  var paragraphValue = $(paragraphClicked).text();
  var thisForm = $(paragraphClicked).parent().find('form');
  $(paragraphClicked).css('display', 'none');
  thisForm.css('display', 'block');
  return {paragraphValue: paragraphValue, thisForm: thisForm}
}

function flipBackToParagraph(element, newValue){
  $(element).css('display', 'none');
  $(element).parent().find('p').text(newValue);
  console.log($(element).parent().find('p'));
  $(element).parent().find('p').css('display', 'block');
}

$('.add-cell').click(function(){
  console.log("Add")
  var cellToClone = $(this).parent().find('.sortable').find(".cell").last();
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

function cancelNoteEdit(){
  var closestForm = $(document.activeElement).closest('.update-note');
  closestForm.find('input[type="text"]').off('blur').val('');
  closestForm.css('display','none');
  closestForm.parent().find('p').css('display', 'block');
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

function ajaxUpdateNote(id, note){
  if(note == ''){note="_"}
  $.ajax({
    url:"/updateNote/" + id + "/" + note,
    success: function(response){
      console.log(response);
    },
    error: function(data){
      console.log("Error Updating Note");
    }
  })
}

$(document).ready(function(){
  var map = []

  constructMap(map);

})

function constructMap(map){
  var hasSelected = false;

  var weeks = $('.week');

  weeks.each(function(weekIndex, weekElement){
    map[weekIndex] = []

    var days = $(weekElement).find('.day');

    days.each(function(dayIndex, dayElement){

      map[weekIndex][dayIndex] = [];

      var cells = $(dayElement).find('.cell').not('.clonable');

      cells.each(function(rowIndex, rowElement){

        if(!hasSelected){
          $( $(rowElement).find('.column')[0] ).toggleClass('selected')
          hasSelected = true;
        }

      });
    });
  });
}
