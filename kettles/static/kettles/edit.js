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
});

$('.kettle .product').draggable({
  cursor:'move',
  helper: 'clone',
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

  productToDrop.addClass('assigned') // MAYBE REMOVE SINCE THE DB IS BEING UPDATE AND RELOADING THEI DMOMOMMMM

  chatSocket.send(JSON.stringify({
      'message': 'addToKettle',
      'product': productNumber,
      'kettle' : kettleToDropOn,
      'date' : $('#todays-production-day').text()
  }));

  // REMOVE PRODUCT FROM LIST ON FRONT END MAYYYYBEEEEE JUST REFRESH EVERY KETTLE WITH AJAX REFRESH
  if (productToDrop.parent().hasClass('kettle-product-list')){
    productToDrop.remove()
  }
}

function handleProductListDrop(event, ui){
  var draggedProduct = $(ui.draggable)
  var kettleToRemove = draggedProduct.parent().parent().attr('id');

  chatSocket.send(JSON.stringify({
      'message': 'removeFromKettle',
      'product': draggedProduct.text(),
      'kettle' : kettleToRemove,
      'date' : $('#todays-production-day').text()
  }));

  if (draggedProduct.parent().hasClass('kettle-product-list')){
    draggedProduct.remove()
  }
}

chatSocket.onmessage = function(e) {
  // console.log("GOT A(Generic) MESSAqge");
  var data = JSON.parse(e.data);
  var message = data['message'];
  if(message === "updating_kettle"){
    var kettle = data['kettle'];
    var date = data['date'];
    $.ajax({
      url: 'update_kettle/',
      data:{
        "kettle": kettle,
        "date": date,
      },
      success: function(data){
        var updateKettle = $('#'+kettle);
        var updateKettleList = $('#'+kettle).find('.kettle-product-list');
        var updateKettleList = $('#'+kettle).find('.kettle-product-list').html('');
        updateKettleList.html(data);
        $('.kettle .product').draggable({
          cursor:'move',
          helper: 'clone',
        });
      },
    })
  }

  if(message == "updating_production_list"){
    console.log("Updating Production Schedule on Front End")
    var date = data['date'];
    $.ajax({
      url: 'update_production_list/',
      data:{
        "date": date,
      },
      success: function(data){
        console.log("Success in Production List")
        $('.product-list').html('');
        $('.product-list').html(data);
        $('.product-list .product').not('.assigned').draggable({
          cursor:'move',
          helper: 'clone',
          classes: {
            "ui-draggable": "dragging-product"
          },
        });
      },
    })
  }

};
