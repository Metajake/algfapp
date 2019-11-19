var ws, dialogAddStartTime, productToAddStartTime, elementToAddStartTime;

$( "#days-product-list, [id^=sortable_]" ).sortable({
  handle: ".product-sort-handle.is-sortable",
  placeholder: "product-sort-placeholder",
  connectWith: ".sortable-products-list",
  receive: handleToListSortReceive,
  stop: handleFromListSortStop,
}).disableSelection();

dialogAddStartTime = $('#dialogue-add-start-time-form').dialog({
  autoOpen: false,
  height: 150,
  width: 400,
  modal: true,
  dialogClass: "start-time-dialog",
  buttons: {
    "Add Start Time": createStartTime,
  },
  close: function() {
    addStartTimeForm[ 0 ].reset();
  },
});

addStartTimePicker = $('#add-delay-time-picker')
addStartTimePicker.timepicker({
  timeFormat: 'h:mm p',
  interval:30,
});

addStartTimeForm = dialogAddStartTime.find( "form" );
addStartTimeForm.on( "submit", function( event ) {
  event.preventDefault();
  createStartTime();
});

startWebsocket('ws://' + window.location.host + '/ws/kettles/')

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

function createStartTime(){
  startTimePickerFormValue = addStartTimePicker.val()
  if(startTimePickerFormValue){
    dialogAddStartTime.dialog('close');
    socketSendStartTime(startTimePickerFormValue);
    checkAndRemoveExistingStartTime(productToAddStartTime);
    addStartTimeElement(productToAddStartTime, startTimePickerFormValue);
  }else{
    addStartTimePicker.trigger("select");
  }
  return null;
}

function checkAndRemoveExistingStartTime(productToRemoveFrom){
  var parentProduct = $('div[id="'+productToRemoveFrom.schedule_number+'"]').find('span[id="'+productToRemoveFrom.multiple+'"]').closest('.product-item');
  if( parentProduct.find('.product-start-time') ){
    parentProduct.find('.product-start-time').remove();
  }
}

function addStartTimeElement(productToAddTo, timeToAdd){
  $('div[id="'+productToAddTo.schedule_number+'"]').find('span[id="'+productToAddTo.multiple+'"]').closest('.product-item')
  .prepend(
    '<div class="product-start-time is-success is-flex"><p>Start Cooking: <span class="time-to-start">'
    +timeToAdd
    +'</span></p><i class="remove-product-start-time fas fa-times text-center"></i></div>'
  )
}

function socketSendStartTime(startTime){
  ws.send(JSON.stringify({
    'message': 'addProductStartTime',
    'date' : $('#todays-production-day').text(),
    'product' : productToAddStartTime,
    'startTime' : startTime
  }));
}

$('.product-complete').click(function(event){
  var isComplete = $(event.target).is(':checked')
  var thisProductItem = $(event.currentTarget).closest('.product-item')
  var thisSortHandle = $(event.currentTarget).closest('.product-item').find('.product-sort-handle')
  isComplete ? thisSortHandle.removeClass('is-sortable') : thisSortHandle.addClass('is-sortable')
  isComplete ? thisProductItem.addClass('is-complete') : thisProductItem.removeClass('is-complete')
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

$('div [id$="-add-start-time"]').click(function(event){
  elementToAddStartTime = $(event.target).closest('.product-item')
  var product = {
    'schedule_number' : $(event.currentTarget).closest('.product-item').attr('id'),
    'multiple' : $(event.currentTarget).closest('.product-item').find('.multiple').attr('id'),
  }
  productToAddStartTime = product;
  dialogAddStartTime.dialog("open");
})

$(document).on('click', '.remove-product-start-time', function(event){
  console.log("removing product start time")
  var product = {
    'schedule_number' : $(event.currentTarget).closest('.product-item').attr('id'),
    'multiple' : $(event.currentTarget).closest('.product-item').find('.multiple').attr('id'),
  }
  ws.send(JSON.stringify({
    'message': 'removeProductStartTime',
    'date' : $('#todays-production-day').text(),
    'product' : product
  }));
  thisProductStartTime = $(this).parent()
  thisProductStartTime.remove()
})
