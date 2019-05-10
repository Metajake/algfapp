console.log( "Listing.." );

var chatSocket = new WebSocket('ws://' + window.location.host + '/ws/kettles/');

chatSocket.onopen = function(event) {
  console.log("WebSocket is open now.");
};

chatSocket.onmessage = function(e) {
    console.log("GOT MESSAqge");
    //- location.reload();
    //- var data = JSON.parse(e.data);
    //- var message = data['message'];
    //- console.log( message );
};
