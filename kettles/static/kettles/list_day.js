console.log( "Listing.." );

var chatSocket = new WebSocket('ws://' + window.location.host + '/ws/kettles/');

chatSocket.onopen = function(event) {
  console.log("WebSocket is open now.");
};

function styleFirstScheduleNumberToMake(){
  var value = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
  if(value === 'detail_false'){
    var newFontSize = 'calc(1rem + 2vw)'
    $('.product-list').each(function(index, item){
      var firstProduct = $(item).find('.product-item.is-complete + .product-item:not(".is-complete")');
      if(firstProduct.length){
        firstProduct.each(function(index2, item2){
          $(item2).find('p.product-schedule-number').css('font-size', newFontSize)
          return false;
        })
      }else(
        $(item).find('.product-item:not(".is-complete"):first-child').find('p.product-schedule-number').css('font-size', newFontSize)
      );
    })
  }
}

styleFirstScheduleNumberToMake();

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
        $('#wrapper').html('');
        $('#wrapper').html(data);
        styleFirstScheduleNumberToMake();
      },
    })
};
