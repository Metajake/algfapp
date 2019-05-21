console.log( "Listing.." );

var chatSocket = new WebSocket('ws://' + window.location.host + '/ws/kettles/');

chatSocket.onopen = function(event) {
  console.log("WebSocket is open now.");
};

function findFirstProductToMake(){
  $('.product-list').each(function(index, item){
    var firstProduct = $(item).find('.product-item.is-complete + .product-item:not(".is-complete")');
    console.log(firstProduct.length)
    if(firstProduct.length){
      firstProduct.each(function(index2, item2){
        $(item2).find('p.product-schedule-number').css('font-size', '5vh')
        return false;
      })
    }else(
      $(item).find('.product-item:not(".is-complete"):first-child').find('p.product-schedule-number').css('font-size', '5vh')
    );
  })
}

findFirstProductToMake();

chatSocket.onmessage = function(e) {
    console.log("GOT MESSAqge");
    var data = JSON.parse(e.data);
    var date = data['date'];
    $.ajax({
      url: 'update_list_day/',
      data:{
        "date": date,
      },
      success: function(data){
        $('#production-list').html('');
        $('#production-list').html(data);
        findFirstProductToMake();
      },
    })
};
