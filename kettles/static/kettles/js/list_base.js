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
  //TODO before re-implementing, determine if Kettle List Daily is loading the Production Week properly
  // showProductionWeek(300000) //five minutes
}
