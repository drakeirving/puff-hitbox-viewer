const player = document.querySelector("#player video");
const select = document.querySelector("#move-select select");
const controlStart = document.querySelector("#control-start");
const controlBack = document.querySelector("#control-back");
const controlPlay = document.querySelector("#control-play");
const controlNext = document.querySelector("#control-next");
const controlEnd = document.querySelector("#control-end");
const frameCounter = document.querySelector("#frame-counter");

const STEP = 0.06;
const RATE = 1/STEP;
const EPS = 0.00001;
let endFrame = 1;

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
  moveset.forEach((value, key) => {
    let e = document.createElement("option");
    e.value = key;
    e.text = value.niceName;
    select.add(e);
  });

  select.addEventListener("change", event => {
    loadAVideo(`./video/mp4/${moveset.get(event.target.value).niceName}.mp4`);
  })

  select.selectedIndex = 0;
}

function loadAVideo(src){ // if blob breaks some browsers then whoops
  fetch(src)
  .then(data => data.blob()) // error handling?
  .then(blob => {
    let url = URL.createObjectURL(blob);
    prepareClip(url);
  });
}

function prepareClip(url){
  player.src = url;
  frameCounter.value = 1;
  player.addEventListener("canplaythrough", event => {
    frameCounter.max = Math.floor((player.duration + EPS) / STEP);
  });
}

function setupButtons(){

  /*-------------
  TODO: explain the epsilon bullshit
  ---------------*/

  controlStart.addEventListener("click", event => {
    setPlayerTime(0);
  });

  controlBack.addEventListener("click", event => {
    // setPlayerTime(player.currentTime - STEP);
    setPlayerTime((Math.floor((player.currentTime + EPS) / STEP) - 1) * STEP + EPS/2);
  });

  controlPlay.addEventListener("click", event => {
    if(player.readyState == 4 && player.duration >= STEP){
      if(player.paused){
        if(player.currentTime >= player.duration - STEP){
          player.currentTime = 0;
        }
        player.play();
      }else{
        player.pause();
      }
    }
  });

  controlNext.addEventListener("click", event => {
    if(player.currentTime < player.duration - STEP){
      // setPlayerTime(player.currentTime + STEP);
      setPlayerTime((Math.floor((player.currentTime + EPS) / STEP) + 1) * STEP + EPS/2);
    }
  });

  controlEnd.addEventListener("click", event => {
    setPlayerTime(player.duration - STEP);
  });

  player.addEventListener("timeupdate", event => {
    if(player.currentTime - (player.duration - STEP) > EPS){ // (time > duration-step)
      player.currentTime = player.duration - STEP + EPS/2;
      player.pause();
    }
  })
  player.addEventListener("play", event => {
    controlPlay.setAttribute("playing", "");
    frameCounter.disabled = true;
    frameCounter.value = "";
  })
  player.addEventListener("pause", event => {
    controlPlay.removeAttribute("playing");
    frameCounter.disabled = false;
    updateFrameCount();
  })

  function setPlayerTime(t){
    if(player.readyState == 4){
      player.pause();
      player.currentTime = t;
      updateFrameCount();
    }
  }

  function updateFrameCount(){
    let frame = Math.floor((player.currentTime + EPS) / STEP) + 1;
    frameCounter.value = frame;
  }
}
