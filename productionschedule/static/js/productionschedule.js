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
  currentEditValue = $(this).text();
  thisForm = $(this).parent().find('form');
  $(this).css('display', 'none');
  thisForm.css('display', 'block');
  thisForm.find('input[type="text"]').val(currentEditValue).focus().blur(function(){
    updateValue = $(this).val();
    flipBackToParagraph(this, updateValue);
    id = thisForm.closest('.cell').attr('id');
    productCodeToSave = thisForm.closest('.cell').find('.product-code p').text();
    companyToSave = thisForm.closest('.cell').find('.customer p').text();
    dateToSave = thisForm.parent().parent().parent().parent().find('.production-date').text();
    ajaxUpdate(id, productCodeToSave, companyToSave, dateToSave);
  });
});


$(document).keyup(function(e) {
  if (e.keyCode === 27){
      if($('.update-form').find('input').is(':focus')){
          cancelEdit();
      }
  }
});

$('.update-form').submit(function(e){
  e.preventDefault();
  updateValue = $(this).find('input[type="text"]').val();
  flipBackToParagraph(this, updateValue);
  id = thisForm.closest('.cell').attr('id');
  productCodeToSave = thisForm.closest('.cell').find('.product-code p').text();
  companyToSave = thisForm.closest('.cell').find('.customer p').text();
  dateToSave = thisForm.parent().parent().parent().parent().find('.production-date').text();
  ajaxUpdate(id, productCodeToSave, companyToSave, dateToSave);
})


function cancelEdit(){
  closestForm = $(document.activeElement).closest('.update-form');
  closestForm.find('input[type="text"]').val('');
  closestForm.css('display','none');
  $(document.activeElement).closest('.column').find('p').css('display', 'block');
}

function flipBackToParagraph(element, newValue){
  $(element).closest('.column').find('p').text(newValue);
  $(element).closest('.update-form').css('display', 'none');
  $(element).closest('.column').find('p').css('display', 'block');
}

function ajaxSaveNew(code, company, date, newCell){
  if(code==''){code="_"}
  if(company==''){company="_"}
  $.ajax({
    url: "/save/" + date + "/" + code + "/" + company,
    success: function(response){
      console.log(response)
      if(newCell){
        newCell.attr('id', response)
      }
    },
    error: function(data){
      console.log("Error saving object.")
    }
  });
}
function ajaxUpdate(id, code, company, date){
  if(code==''){code="_"}
  if(company==''){company="_"}
  $.ajax({
    url: "/update/" + id + "/" + date + "/" + code + "/" + company,
    success: function(response){
      console.log(response)
    },
    error: function(data){
      console.log("Error updating object.")
    }
  });
}
