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
            // styleFirstScheduleNumberToMake();
          },
        })
    };
}

startWebsocket('ws://' + window.location.host + '/ws/kettles/')

function styleFirstScheduleNumberToMake(){
  var value = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
  //If "Detail_True", make sure we're not styling first schedule number
  if(value !== 'detail_true'){
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

// styleFirstScheduleNumberToMake();

//Toggle Display from Production Week to Production Day
function showProductionDay(duration){
  setTimeout(function(){
    $('#slide-week').fadeToggle(1000, function(){
      $('#slide-day').fadeToggle(1000)
    })
    showProductionWeek(duration)
  }, duration*.15)//5 minutes*.15=45 seconds
}
//Toggle Display from Production Day to Production Week
function showProductionWeek(duration){
  setTimeout(function(){
    $('#slide-day').fadeToggle(1000, function(){
      $('#slide-week').fadeToggle(1000)
    })
    showProductionDay(duration)
  }, duration)
}

if(window.location.hostname !== "10.0.1.164"){
  // $('#slide-day').css('display', 'none')
  // $('#slide-week').css('display', 'block')
  showProductionWeek(10000)
}else{
  showProductionWeek(300000) //five minutes
}
