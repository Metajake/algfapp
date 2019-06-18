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
