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

function showProductionDay(){
  setTimeout(function(){
    $('#slide-week').fadeToggle(1000, function(){
      $('#slide-day').fadeToggle(1000)
    })
    showProductionWeek()
  }, 180000) //five minutes
}

function showProductionWeek(){
  setTimeout(function(){
    $('#slide-day').fadeToggle(1000, function(){
      $('#slide-week').fadeToggle(1000)
    })
    showProductionDay()
  }, 300000) //five minutes
}

// showProductionWeek()
$('#slide-day').css('display', 'none')
$('#slide-week').css('display', 'block')

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
        $('#slide-day').html('');
        $('#slide-day').html(data);
        styleFirstScheduleNumberToMake();
      },
    })
};
