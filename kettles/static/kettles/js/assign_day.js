var ws, dialogAddStartTime, kettleToAddStartTime;

startWebsocket('ws://' + window.location.host + '/ws/kettles/')

$( "#days-product-list, [id^=sortable_]" ).sortable({
  handle: ".product-sort-handle:not(.is-complete)",
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
    Cancel: function() {
      dialogAddStartTime.dialog( "close" );
    }
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
    checkAndRemoveExistingStartTime(kettleToAddStartTime);
    addStartTimeElement(kettleToAddStartTime, startTimePickerFormValue);
  }else{
    addStartTimePicker.trigger("select");
  }
  return null;
}

function checkAndRemoveExistingStartTime(kettleToRemoveFrom){
  if( $('#'+kettleToRemoveFrom).find('.kettle-delay') ){
    $('#'+kettleToRemoveFrom).find('.kettle-delay').remove();
  }
}

function addStartTimeElement(kettleToAddTo, timeToAdd){
  $('#'+kettleToAddTo).find('.kettle-container-content').prepend(
    '<div class="kettle-delay"><p class="is-inline kettle-start-time text-center">Start: ' + timeToAdd + '</p><button class="button remove-kettle-start-time">X</button></div>'
  )
}

function socketSendStartTime(startTime){
  ws.send(JSON.stringify({
    'message': 'addKettleStartTime',
    'date' : $('#todays-production-day').text(),
    'kettle' : kettleToAddStartTime,
    'startTime' : startTime
  }));
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

$(document).on('click', '.remove-kettle-start-time', function(event){
  thisKettleId = $(this).closest(".kettle-container").attr('id');
  ws.send(JSON.stringify({
    'message': 'removeKettleStartTime',
    'date' : $('#todays-production-day').text(),
    'kettle' : thisKettleId
  }));
  thisKettleDelay = $(this).parent()
  thisKettleDelay.remove()
  console.log(thisKettleId)
})
