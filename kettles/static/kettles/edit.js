var chatSocket = new WebSocket('ws://' + window.location.host + '/ws/kettles/');
chatSocket.onopen = function(event) {
  console.log("WebSocket is open now.");
};

$( function() {
  setProductListDragging()
  setKettleProductSorting()

  setKettleDropping()
  setProductListDropping()
} );

chatSocket.onmessage = function(e) {
  // console.log("GOT A MESSAqge");
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
        setProductListDragging();
        setKettleDropping();
        setKettleProductSorting();
      },
    })
  }

  if(message == "updating_production_list"){
    var date = data['date'];
    $.ajax({
      url: 'update_production_list/',
      data:{
        "date": date,
      },
      success: function(data){
        $('.product-list').html('');
        $('.product-list').html(data);
        setProductListDragging();
        setKettleProductSorting();
      },
    })
  }

};

function setProductListDragging(){
  $('.product-list .product').not('.assigned').draggable({
    cursor:'move',
    helper: 'clone',
    classes: {
      "ui-draggable": "dragging-product"
    },
  }).disableSelection();
}

function setKettleProductSorting(){
  $( "#sortable_K1, #sortable_K2, #sortable_K3, #sortable_K4, #sortable_L5, #sortable_T6, #sortable_K7, #sortable_K8, #sortable_T9" ).sortable({
    placeholder: "product-sort-placeholder",
    connectWith: ".products-in-kettle",
    stop: handleKettleSortStop,
    receive: handleKettleSortReceive,
  }).disableSelection();
}

function setKettleDropping(){
  $('.products-in-kettle').droppable({
    disabled: false,
    drop : handleKettleDrop,
  })
}

function setProductListDropping(){
  $('.product-list').droppable({
    drop : handleProductListDrop,
  })
}

function handleKettleDrop(event, ui){
  // console.log("Handling Kettle Drop");
  var kettleToDropOn = $(event.target)
  var productToDrop = $(ui.draggable);
  var productNumber = productToDrop.attr('id')
  var kettleNumberToDropOn = kettleToDropOn.attr('id').split("_").pop();
  multiple = checkIfMultiple(productToDrop);

  chatSocket.send(JSON.stringify({
      'message': 'addToKettle',
      'product': productNumber,
      'multiple' : multiple,
      'kettle' : kettleNumberToDropOn,
      'date' : $('#todays-production-day').text()
  }));

  if (productToDrop.parent().parent().hasClass('product-list') ){
    productToDrop.addClass('assigned')
  }
}

function handleKettleSortReceive(event, ui){
  // console.log("Handling kettle sort receive.")
  var kettleToDropOn = $(event.target);
  var kettleNumberToDropOn = kettleToDropOn.attr('id').split("_").pop();

  chatSocket.send(JSON.stringify({
    'message': 'sortKettle',
    'products' : returnProductKettleOrderArray( kettleToDropOn.find('.product') ),
    'kettle' : kettleNumberToDropOn,
    'date' : $('#todays-production-day').text()
  }));
}

function handleKettleSortStop(event, ui){
  // console.log('handling kettle sort Stop')
  var kettleToDropFrom = $(event.target);

  var products = returnProductKettleOrderArray( kettleToDropFrom.find('.product') );
  if (products.length){
    chatSocket.send(JSON.stringify({
      'message': 'sortKettle',
      'products' : products,
      'kettle' : kettleToDropFrom.attr('id').split("_").pop(),
      'date' : $('#todays-production-day').text()
    }));
  }
}

function handleProductListDrop(event, ui){
  var draggedProduct = $(ui.draggable)
  if(draggedProduct.parent().hasClass('products-in-kettle') ){
    var kettleToRemove = draggedProduct.closest('.kettle').attr('id').split('_').pop();

    chatSocket.send(JSON.stringify({
      'message': 'removeFromKettle',
      'product': draggedProduct.attr('id'),
      'multiple' : draggedProduct.find('.multiple').attr('id'),
      'kettle' : kettleToRemove,
      'date' : $('#todays-production-day').text()
    }));

    draggedProduct.remove()
  };
}

function returnProductKettleOrderArray(productsToOrder){
  var products = [];

  productsToOrder.each(function(index, element){
    products.push({
      "product_number" : $(element).attr('id'),
      "product_multiple" : $(element).find('.multiple').attr('id'),
      "kettle_order" : index,
    })
  })

  return products;
}

function checkIfMultiple(productToCheck){
  var multiple = 0;
  if(productToCheck.find('.multiple').text().length){
    multiple = productToCheck.find('.multiple').attr('id')
  }
  return multiple
}
