var ws, dialogAddStartTime, kettleToAddStartTime;

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

$( "#days-product-list, [id^=sortable_]" ).sortable({
  handle: ".product-sort-handle:not(.is-complete)",
  placeholder: "product-sort-placeholder",
  connectWith: ".sortable-products-list",
  receive: handleToListSortReceive,
  stop: handleFromListSortStop,
}).disableSelection();

dialogAddStartTime = $('#dialogue-add-delay-form').dialog({
  autoOpen: false,
  height: 150,
  width: 400,
  modal: true,
  dialogClass: "start-time-dialog",
  buttons: {
    "Add Start Time": createStartTime,
    Cancel: function() {
      dialogAddStartTime.dialog( "close" );
    }
  },
  close: function() {
    addStartTimeForm[ 0 ].reset();
  },
});

function createStartTime(){
  startTime = addDelayTimePicker.val()
  if(startTime){
    ws.send(JSON.stringify({
      'message': 'addKettleStartTime',
      'date' : $('#todays-production-day').text(),
      'kettle' : kettleToAddStartTime,
      'startTime' : startTime
    }));
    dialogAddStartTime.dialog('close');
    $('#'+kettleToAddStartTime).find('.kettle-container-content').prepend('<div class="kettle-delay text-center"><p>Start: ' + startTime + '</p></div>')
  }else{
    addDelayTimePicker.trigger("select");
  }
  return null;
}

addDelayTimePicker = $('#add-delay-time-picker')
addDelayTimePicker.timepicker({
  timeFormat: 'h:mm p',
  interval:30,
});

addStartTimeForm = dialogAddStartTime.find( "form" );
addStartTimeForm.on( "submit", function( event ) {
  event.preventDefault();
  createStartTime();
});

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

$('div [id$="-add-delay"]').click(function(event){
  thisId = $(this).attr('id');
  thisKettleNumber = thisId.slice( 0, thisId.indexOf('-add-delay') );

  kettleToAddStartTime = thisKettleNumber;
  dialogAddStartTime.dialog("open");
})
