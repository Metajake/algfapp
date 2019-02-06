var acceptedKeys = [48,49,50,51,52,53,54,55,56,57,81,87,69,82,84,89,85,73,79,80,65,83,68,70,71,72,74,75,76,90,88,67,86,66,78,77];
var isTyping = false;

$('.cell').draggable({
  cursor:'move',
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

$(document).keydown(function(e){
  if (e.which === 9){
    e.preventDefault()
  }
});

$(document).keyup(function(e) {
  if (e.which === 27){ //ESCAPE
      if($('.update-form').find('input').is(':focus')){
        cancelEdit();
      }else if($('.update-note').find('input').is(':focus')){
        cancelNoteEdit()
      }
  }
  if (acceptedKeys.includes(e.which) && !isTyping){
    handleKeyboardInput(e)
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
    case 9:
    e.shiftKey ? handleLeftClick() : handleRightClick();
    break;
    default: return;
  }
});

$('.ui-duplicate').click(function(){
  selectedColumn.toggleClass('selected');
  var newCell = $(this).closest('.cell').clone(true, true);
  selectedColumn.toggleClass('selected');
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
    isTyping = false;
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
  isTyping = false;
  ajaxUpdate(id, productCodeToSave, companyToSave, dateToSave, order);
})

$('.update-note').submit(function(e){
  e.preventDefault();
  var updateValue = $(this).find('input[type="text"]').val();
  $(this).find('input[type="text"]').off('blur');
  flipBackToParagraph(this, updateValue);
  var thisForm = $(this);
  var id = thisForm.parent().parent().attr('id');
  isTyping = false;
  ajaxUpdateNote(id, updateValue);
});

$('.add-cell').click(function(){
  var cellToClone = $(this).parent().find('.sortable').find(".cell").last();
  var newCell = cellToClone.clone(true, true);
  if(newCell.hasClass('clonable')){
    newCell.removeClass('clonable');
    newCell.find('.note').css('display', 'none')
  }
  selectedColumn.toggleClass('selected');
  selectedColumn = newCell.find('.column').first();
  selectedColumn.toggleClass('selected');
  newCell.find('.product-code p').html("&nbsp;");
  newCell.find('.customer p').html("&nbsp;");
  newCell.insertAfter(cellToClone);
  var productCodeToSave = newCell.find('.product-code p').text();
  var companyToSave = newCell.find('.customer p').text();
  var dateToSave = $(this).parent().find('.production-date').text();
  ajaxSaveNew(productCodeToSave, companyToSave, dateToSave, newCell)
})

var selectedColumn, selectedColumnDay, selectedColumnRow, selectedColumnRowIndex, selectedColumnIndex, selectedColumnWeek;

function handleRightClick(){
  selectedColumn = $('.selected');
  selectedColumnDay = $('.selected').parent().parent().parent();
  selectedColumnRowIndex = $('.selected').parent().index()
  if(isTyping){selectedColumn.find('.update-form').trigger("submit")}
  if(selectedColumn.next('.column').length){
    selectedColumn.next().toggleClass("selected");
    selectedColumn.toggleClass("selected");
    selectedColumn = $('.selected');
  }else if(selectedColumnDay.nextAll('.day:has(.cell:not(.clonable))').length){
    var nextDaysWithCells = selectedColumnDay.nextAll('.day:has(.cell:not(.clonable))');
    var nextDayCells = nextDaysWithCells.first().find('.cell:not(.clonable)');
    if (nextDayCells.length >= selectedColumnRowIndex){
      var nextCell = $( nextDayCells[selectedColumnRowIndex-1] ).find('.column').first();
    }else{
      var nextCell = nextDayCells.last().find('.column').first();
    }
    selectedColumn.toggleClass("selected");
    selectedColumn = nextCell;
    selectedColumn.toggleClass("selected");
  }
}

function handleLeftClick(){
  selectedColumn = $('.selected');
  selectedColumnDay = $('.selected').parent().parent().parent();
  selectedColumnRowIndex = $('.selected').parent().index()
  if(isTyping){selectedColumn.find('.update-form').trigger("submit")}
  if(selectedColumn.prev('.column').length){
    selectedColumn.prev().toggleClass("selected");
    selectedColumn.toggleClass("selected");
    selectedColumn = $('.selected');
  }else if(selectedColumnDay.prevAll('.day:has(.cell:not(.clonable))').length){
    var prevDaysWithCells = selectedColumnDay.prevAll('.day:has(.cell:not(.clonable))');
    var prevDayCells = prevDaysWithCells.first().find('.cell:not(.clonable)');
    if (prevDayCells.length >= selectedColumnRowIndex){
      var prevCell = $( prevDayCells[selectedColumnRowIndex-1] ).find('.column').last();
    }else{
      var prevCell = prevDayCells.last().find('.column').last();
    }
    selectedColumn.toggleClass("selected");
    selectedColumn = prevCell;
    selectedColumn.toggleClass("selected");
  }
}

function handleDownClick(){
  selectedColumn = $('.selected');
  selectedColumnDay = $('.selected').parent().parent().parent();
  selectedColumnRow = $('.selected').parent();
  selectedColumnWeek = $('.selected').parent().parent().parent().parent();
  selectedColumnIndex = selectedColumnRow.find('.selected').index();
  if(isTyping){selectedColumn.find('.update-form').trigger("submit")}
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
  if(isTyping){selectedColumn.find('.update-form').trigger("submit")}
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

function handleKeyboardInput(inputEvent){
  inputCharacter = String.fromCharCode(inputEvent.which)
  if(!inputEvent.shiftKey){inputCharacter = inputCharacter.toLowerCase()}
  isTyping = true;
  var cellToEdit = $('.selected');
  var paragraphToEdit = cellToEdit.find('p')[0];
  var editValues = toggleParagraphToForm(paragraphToEdit);
  // editValues.paragraphValue = $.trim(editValues.paragraphValue) + inputCharacter;
  editValues.paragraphValue = inputCharacter;
  convertParagraphToFocusFormValues(editValues);
}

function columnClickEvent(ui){
  selectedColumn.toggleClass("selected");
  selectedColumn = $(ui.target).parent();
  selectedColumn.toggleClass('selected');
  isTyping = true;
  var editValues = toggleParagraphToForm(ui.target);
  convertParagraphToFocusFormValues(editValues);
}

function noteClickEvent(ui){
  isTyping = true;
  var editValues = toggleParagraphToForm(ui.target);
  editValues.thisForm.find('input[type="text"]').val(editValues.paragraphValue).focus().blur(function(){
    isTyping = false;
  })
}

function convertParagraphToFocusFormValues(values){
  values.thisForm.find('input[type="text"]').val(values.paragraphValue).focus().blur(function(){
    var updateValue = $(this).val();
    flipBackToParagraph(values.thisForm, updateValue);
    var id = values.thisForm.closest('.cell').attr('id');
    var productCodeToSave = values.thisForm.closest('.cell').find('.product-code p').text();
    var companyToSave = values.thisForm.closest('.cell').find('.customer p').text();
    var dateToSave = values.thisForm.parent().parent().parent().parent().find('.production-date').text();
    var order = constructDayItemOrder(this);
    isTyping = false;
    ajaxUpdate(id, productCodeToSave, companyToSave, dateToSave, order);
  });
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
  $(element).parent().find('p').css('display', 'block');
}

var dayDropCellToDrop, dayDropOldDateToSave, dayDropOldDay, dayDropOldDayReordered;

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
  isTyping = false;
}

function cancelNoteEdit(){
  var closestForm = $(document.activeElement).closest('.update-note');
  closestForm.find('input[type="text"]').off('blur').val('');
  closestForm.css('display','none');
  closestForm.parent().find('p').css('display', 'block');
  isTyping = false;
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

  selectedColumn = $('.selected')
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
