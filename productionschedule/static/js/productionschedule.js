$('.cell').draggable({
  cursor:'move',
  //snap: '.sortable',
  helper: 'clone',
  //delay:350,
  connectToSortable: '.sortable',
});
