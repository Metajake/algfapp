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
}

startWebsocket('ws://' + window.location.host + '/ws/kettles/')

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

function showProductionDay(duration){
  setTimeout(function(){
    $('#slide-week').fadeToggle(1000, function(){
      $('#slide-day').fadeToggle(1000)
    })
    showProductionWeek(duration)
  }, duration*.6) //three minutes
}

function showProductionWeek(duration){
  setTimeout(function(){
    $('#slide-day').fadeToggle(1000, function(){
      $('#slide-week').fadeToggle(1000)
    })
    showProductionDay(duration)
  }, duration) //five minutes
}

if(window.location.hostname === "localhost"){
  // $('#slide-day').css('display', 'none')
  // $('#slide-week').css('display', 'block')
  // showProductionWeek(10000)
}else{
  showProductionWeek(300000)
}
