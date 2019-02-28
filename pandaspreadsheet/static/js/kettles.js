$('.product-number').draggable({
  cursor:'move',
  // helper: 'clone',
  // delay:350,
  revert : function(event, ui) {
      $(this).data("ui-draggable").originalPosition = {
          top : 0,
          left : 0
      };
      return !event; // that evaluate like this: return event !== false ? false : true;
  }
});

$('.droppable, #product-list').droppable({
  drop:handleItemDrop,
})

function handleItemDrop(event, ui){
  $(ui.draggable).detach().css({top:0,left:0}).appendTo(this);
}
