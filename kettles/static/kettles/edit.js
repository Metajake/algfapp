var chatSocket = new WebSocket('ws://' + window.location.host + '/ws/kettles/');
chatSocket.onopen = function(event) {
  console.log("WebSocket is open now.");
};

$('.product-list .product').not('.assigned').draggable({
  cursor:'move',
  helper: 'clone',
  classes: {
    "ui-draggable": "dragging-product"
  },
  //- connectToSortable: '.sortable',
  //- start: handleDragStart,
  //- stop: handleProductDrop,
});

$('.kettle .product').draggable({
  cursor:'move',
  helper: 'clone',
  //- connectToSortable: '.sortable',
  //- start: handleDragStart,
  //- stop: handleProductDrop,
});

$('.kettle').droppable({
  drop:handleKettleDrop,
})

$('.product-list').droppable({
  drop:handleProductListDrop,
})


function handleKettleDrop(event, ui){
  var productToDrop = $(ui.draggable);
  var productNumber = productToDrop.text();
  var kettleToDropOn = $(event.target).find('.kettle-number').text();

  productToDrop.addClass('assigned')

  chatSocket.send(JSON.stringify({
      'message': 'addToKettle',
      'product': productNumber,
      'kettle' : kettleToDropOn,
      'date' : $('#todays-production-day').text()
  }));
}

function handleProductListDrop(event, ui){
  var draggedProduct = $(ui.draggable)
  var kettleToRemove = draggedProduct.parent().find('.kettle-number').text();
  console.log()

  chatSocket.send(JSON.stringify({
      'message': 'removeFromKettle',
      'product': draggedProduct.text(),
      'kettle' : kettleToRemove,
      'date' : $('#todays-production-day').text()
  }));
}

chatSocket.onmessage = function(e) {
    console.log("GOT MESSAqge");
    // location.reload();
    // var data = JSON.parse(e.data);
    // var message = data['message'];
    // var kettle = data['kettle'];
    // var htmldata = data['html'];
    // if(message === "updating_kettle"){
    //   var updateKettleList = $('#'+kettle).find('.kettle-product-list');
    // }
};
