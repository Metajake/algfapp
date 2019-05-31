var ws;
function startWebsocket(websocketServerLocation){
    ws = new WebSocket(websocketServerLocation);
    ws.onclose = function(){
        console.log("Closed")
        ws = null;
        setTimeout(function(){startWebsocket(websocketServerLocation)}, 3000);
    };
    ws.onError = function(){
        ws = null;
        console.log("Error")
        setTimeout(function(){startWebsocket(websocketServerLocation)}, 3000);
    };
    ws.onopen = function(event) {
      console.log("WebSocket is open now.");
    };
    ws.onmessage = function(e) {
        console.log("GOT MESSAqge");
    };
}

startWebsocket('ws://' + window.location.host + '/ws/kettles/')

$( "#days-product-list, #sortable_K1, #sortable_K2, #sortable_K3, #sortable_K4, #sortable_L5, #sortable_T6, #sortable_K7, #sortable_K8, #sortable_T9" ).sortable({
  handle: ".product-sort-handle:not(.is-complete)",
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
  ws.send(JSON.stringify({
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
  ws.send(JSON.stringify({
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

$('.product-complete').click(function(event){
  var isComplete = $(event.target).is(':checked')
  $(event.currentTarget).closest('.product-item').find('.product-sort-handle').disableSelection().toggleClass('is-complete')
  var product = {
      'schedule_number' : $(event.currentTarget).closest('.product-item').attr('id'),
      'multiple' : $(event.currentTarget).closest('.product-item').find('.multiple').attr('id'),
  }
  ws.send(JSON.stringify({
    'message': 'toggleProductComplete',
    'product' : product,
    'isComplete' : isComplete,
    'date' : $('#todays-production-day').text(),
  }));
})
