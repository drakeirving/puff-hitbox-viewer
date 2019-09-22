const player = document.querySelector("#player video");
const select = document.querySelector("#move-select select");
const controlStart = document.querySelector("#control-start");
const controlBack = document.querySelector("#control-back");
const controlPlay = document.querySelector("#control-play");
const controlNext = document.querySelector("#control-next");
const controlEnd = document.querySelector("#control-end");

let moveset = null;

function getData(file){
  return fetch(file)
    .then(data => data.text())
    .then(str => {
      moveset = parse(str);
      setupAll();
    })

    function parse(str){
      return JSON.parse(str, function(k, v){
        if(v instanceof Array && v.every(x=>x.length==2)){
          return new Map(v)
        }
        return v;
      })
    }
}

getData("./moveset.json")

function setupAll(){
  populateSelect();
  setupButtons();
}

function populateSelect(){
  // optgroups?
  moveset.forEach((value, key) => {
    let e = document.createElement("option");
    e.value = key;
    e.text = value.niceName;
    select.add(e);
  });

  select.addEventListener("change", event => {
    // player.src = `./video/webm/${moveset.get(event.target.value).niceName}.webm`
    loadAVideo(`./video/webm/${moveset.get(event.target.value).niceName}.webm`);
  })

  select.selectedIndex = 0;
}

function loadAVideo(file){ // if blob breaks some browsers then whoops
  fetch(file)
  .then(data => data.blob()) // error handling?
  .then(blob => {
    let url = URL.createObjectURL(blob);
    player.src = url;
  })
}

function setupButtons(){
  controlStart.addEventListener("click", event => {
    setPlayerTime(0);
  });
  controlBack.addEventListener("click", event => {
    setPlayerTime(player.currentTime - 0.06);
  });
  controlPlay.addEventListener("click", event => {
    if(player.readyState == 4 && player.duration >= 0.06){
      if(player.paused){
        if(player.currentTime >= player.duration - 0.06){
          player.currentTime = 0;
        }
        player.play();
      }else{
        player.pause();
      }
    }
  });
  controlNext.addEventListener("click", event => {
    setPlayerTime(player.currentTime + 0.06);
  });
  controlEnd.addEventListener("click", event => {
    setPlayerTime(player.duration - 0.06);
  });
  player.addEventListener("timeupdate", event => {
    if(player.currentTime > player.duration - 0.06){
      player.currentTime = player.duration - 0.06;
    }
  })
  player.addEventListener("play", event => {
    controlPlay.setAttribute("playing", "")
  })
  player.addEventListener("pause", event => {
    controlPlay.removeAttribute("playing")
  })

  function setPlayerTime(t){
    if(player.readyState == 4){
      player.pause();
      player.currentTime = t;
    }
  }
}
