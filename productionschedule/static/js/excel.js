console.log('yo');

var data = [
  [10, 11, 12, 13],
  [20, 11, 14, 13],
  [30, 15, 12, 13]
];

var container = document.getElementById('example');

var hot = new Handsontable(container, {
  data: data,
  colHeaders: true,
  rowHeaders: true,
  dropdownMenu: true,
  contextMenu: true,
  allowInsertRow: true,
  width: '100%',
  height: '100%',
  colWidths: 200,
  manualColumnResize: true,
  manualRowResize: true,
  afterChange: afterCellChange,
  afterPaste: afterCellChange,
  contextMenu: {
    items:{
      'Add Note': {
        name: "Add Note",
      },
      "col_left": {},
      "col_right": {},
      "row_below": {},
      "row_above": {},
      'copy':{},
      'cut': {},
      'undo': {},
      'redo': {},
    },
  },
  licenseKey: 'non-commercial-and-evaluation'
});

function afterCellChange(){
  console.log("cell change");
}
