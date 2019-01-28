$('.cell').draggable({
  cursor:'move',
  //snap: '.sortable',
  helper: 'clone',
  //delay:350,
  connectToSortable: '.sortable',
});

$('.ui-duplicate').click(function(){
  newCell = $(this).closest('.cell').clone(true, true);
  newCell.insertAfter($(this).closest('.cell'));
  productCodeToSave = $(this).parent().find('.product-code p').text();
  companyToSave = $(this).parent().find('.customer p').text();
  dateToSave = $(this).parent().parent().parent().find('.production-date').text();
  if(productCodeToSave==''){productCodeToSave="_"}
  if(companyToSave==''){companyToSave="_"}
  ajaxSaveNew(productCodeToSave, companyToSave, dateToSave, newCell)
})

currentEditValue = '';

$(".column p").click(function(){
  var currentEditValue = $(this).text();
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
});


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
  var itemListForDay = $(dayToOrder).closest('.sortable').find('.cell');
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
      // console.log(response)
      newCell.attr('id', response)
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
