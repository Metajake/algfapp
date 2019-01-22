$('.cell').draggable({
  cursor:'move',
  //snap: '.sortable',
  helper: 'clone',
  //delay:350,
  connectToSortable: '.sortable',
});

$('.ui-duplicate').click(function(){
  $(this).closest('.cell').clone(true,true).appendTo($(this).closest('.sortable'));
  productCodeToSave = $(this).parent().find('.product-code p').text();
  companyToSave = $(this).parent().find('.customer p').text();
  dateToSave = $(this).parent().parent().parent().find('.production-date').text();
  if(productCodeToSave==''){productCodeToSave="_"}
  if(companyToSave==''){companyToSave="_"}
  $.ajax({
    url: "/save/" + dateToSave + "/" + productCodeToSave + "/" + companyToSave,
    success: function(response){
      console.log(response)
    },
    error: function(data){
      console.log("Error saving object.")
    }
  });
})
