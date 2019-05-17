var chatSocket = new WebSocket('ws://' + window.location.host + '/ws/kettles/');
chatSocket.onopen = function(event) {
  console.log("WebSocket is open now.");
};

$( "#days-product-list, #sortable_K1, #sortable_K2, #sortable_K3, #sortable_K4, #sortable_L5, #sortable_T6, #sortable_K7, #sortable_K8, #sortable_T9" ).sortable({
  placeholder: "product-sort-placeholder",
  connectWith: ".sortable-products-list",
  receive: handleToListSortReceive,
  stop: handleFromListSortStop,
}).disableSelection();

function handleToListSortReceive(event, ui){
  console.log("Handling list sort receive.")
  var product = {
      'schedule_number' : $(ui.item).attr('id'),
      'multiple' : $(ui.item).find('.multiple').attr('id'),
  }
  var listNumberToDropOn;
  var listToDropOn = $(event.target)
  listToDropOn.is('#days-product-list') ? listNumberToDropOn = '' : listNumberToDropOn = listToDropOn.attr('id').split("_").pop();

  var products = returnProductKettleOrderArray( listToDropOn.find('.product-item') )

  chatSocket.send(JSON.stringify({
    'message': 'listSortReceive',
    'product': product,
    'products' : products,
    'list' : listNumberToDropOn,
    'date' : $('#todays-production-day').text(),
  }));
}

function handleFromListSortStop(event, ui){
  console.log('handling list sort Stop')
  var listNumberToDropOn;
  var listToDropOn = $(event.target)
  listToDropOn.is('#days-product-list') ? listNumberToDropOn = '' : listNumberToDropOn = listToDropOn.attr('id').split("_").pop();
  var products = returnProductKettleOrderArray( listToDropOn.find('.product-item') )
  chatSocket.send(JSON.stringify({
    'message': 'listSort',
    'products' : products,
    'list' : listNumberToDropOn,
    'date' : $('#todays-production-day').text(),
  }));
}

function returnProductKettleOrderArray(productsToOrder){
  var products = [];
  productsToOrder.each(function(index, element){
    products.push({
      "schedule_number" : $(element).attr('id'),
      "multiple" : $(element).find('.multiple').attr('id'),
      "list_order" : index,
    })
  })
  return products;
}
