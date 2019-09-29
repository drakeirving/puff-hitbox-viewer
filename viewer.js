const player = document.querySelector("#player video");
const select = document.querySelector("#move-select select");
const controlStart = document.querySelector("#control-start");
const controlBack = document.querySelector("#control-back");
const controlPlay = document.querySelector("#control-play");
const controlNext = document.querySelector("#control-next");
const controlEnd = document.querySelector("#control-end");
const frameCounter = document.querySelector("#frame-counter");
const frameSlider = document.querySelector("#frame-slider");
let frameDataTable = document.querySelector("#frame-data");

const STEP = 0.06;
const RATE = 1/STEP;
const EPS = 0.00001;
let endFrame = 1;

let moveset = null;
let currentMove = null;
let currentFrame = 1;

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
    currentMove = moveset.get(event.target.value);
    loadAVideo(`./video/mp4/${currentMove.niceName}.mp4`);
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
  currentFrame = 1;
  frameCounter.value = 1;
  frameCounter.disabled = false;
  frameSlider.value = 1;
  player.addEventListener("canplaythrough", event => {
    let maxFrame = Math.max(1, Math.floor((player.duration + EPS) / STEP));
    frameCounter.max = maxFrame;
    frameSlider.max = maxFrame;
  });
  updateTable();
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
  });

  player.addEventListener("play", event => {
    controlPlay.setAttribute("playing", "");
    frameCounter.disabled = true;
    frameCounter.value = "";
  });
  player.addEventListener("pause", event => {
    controlPlay.removeAttribute("playing");
    frameCounter.disabled = false;
    updateFrame();
  });

  frameCounter.addEventListener("change", event => {
    if((frameCounter.value - 1) * STEP + EPS/2 < player.duration){
      setPlayerTime((frameCounter.value - 1) * STEP + EPS/2);
    }
  });

  let slideThrottle = false;
  frameSlider.addEventListener("input", event => {
    if(!slideThrottle && (frameSlider.valueAsNumber - 1) * STEP + EPS/2 < player.duration){
      setPlayerTime((frameSlider.valueAsNumber - 1) * STEP + EPS/2);
      slideThrottle = true;
    }
  });
  setInterval(() => slideThrottle = false, 25);

  function setPlayerTime(t){
    if(player.readyState == 4){
      player.pause();
      player.currentTime = t;
      updateFrame();
    }
  }

  function updateFrame(){
    let frame = Math.floor((player.currentTime + EPS) / STEP) + 1;
    currentFrame = frame;
    frameCounter.value = frame;
    frameSlider.value = frame;
    updateTable();
  }
}

function removeTable(){
  while(frameDataTable.hasChildNodes()){ frameDataTable.removeChild(frameDataTable.firstChild); }
}
function updateTable(){
  removeTable();
  generateTable(getActiveHitboxes());
}

import ParamList from "./paramlist.js";

function getActiveHitboxes(){
  return currentMove.hitboxes.filter(h => (currentFrame >= h.get("_frameStart") && currentFrame < h.get("_frameEnd")));
}

function generateTable(hitboxes){
  if(hitboxes.length == 0){ return; }

  let table = document.createElement("table");
  let params = [];
  // if param is in any hitboxes and is not filtered out, add to header list
  ParamList.forEach(p => {
    for(let h of hitboxes){
      if(h.has(p.name) && p.filter(h.get(p.name))){
        params.push(p);
        break;
      }
    }
  })
  // create row per hitbox
  for(let h of hitboxes){
    let row = table.insertRow();
    for(let p of params){
      let td = row.insertCell();
      if(h.has(p.name)){
        td.append(p.transform(h.get(p.name)));
      }
    }
  }
  // create header
  let thead = table.createTHead();
  let row = thead.insertRow();
  for(let p of params){
    let th = document.createElement("th");
    th.append(p.niceName);
    row.append(th);
  }
  // add to page
  frameDataTable.append(table);
}


// for hitbox, for header, add val if header exists, else add empty
