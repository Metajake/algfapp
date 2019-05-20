console.log( "Listing.." );

var chatSocket = new WebSocket('ws://' + window.location.host + '/ws/kettles/');

chatSocket.onopen = function(event) {
  console.log("WebSocket is open now.");
};

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
      },
    })
};
