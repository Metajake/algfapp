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
          },
        })
    };
}

startWebsocket('ws://' + window.location.host + '/ws/kettles/')

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
