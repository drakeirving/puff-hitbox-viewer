const player = document.querySelector("#player video");
const select = document.querySelector("#move-select select");
const controlStart = document.querySelector("#control-start");
const controlBack = document.querySelector("#control-back");
const controlPlay = document.querySelector("#control-play");
const controlNext = document.querySelector("#control-next");
const controlEnd = document.querySelector("#control-end");
const frameCounter = document.querySelector("#frame-counter");
const frameSlider = document.querySelector("#frame-slider");
const tickContainer = document.querySelector("#tick-container");
let hitboxDetails = document.querySelector("#hitbox-details");

const STEP = 0.06;
const RATE = 1/STEP;
const EPS = 0.00001;
let endFrame = 1;

let moveset = null;
let currentMove = null;
let currentFrame = 1;
let maxFrame = 1;

/*--------------------------------
         LOADING / SETUP
--------------------------------*/

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

  updateTable();
}

/*--------------------------------
    CONTROLS / EVENT HANDLING
--------------------------------*/
// TODO: explain the epsilon bullshit

function setupButtons(){

  player.addEventListener("loadedmetadata", event => {
    maxFrame = Math.max(1, Math.floor((player.duration + EPS) / STEP));
    frameCounter.max = maxFrame;
    frameSlider.max = maxFrame;

    updateActiveFrames();
  });

  function clearActiveFrames(){
    while(tickContainer.hasChildNodes()){ tickContainer.removeChild(tickContainer.firstChild); }
  }

  function updateActiveFrames(){
    clearActiveFrames();

    // active frames
    let a = new Uint8Array(maxFrame);
    currentMove.hitboxes.forEach((h)=>{
      for(let i = h._frameStart; i <= h._frameEnd-1; i++){ // -1 frameEnd is exclusive
        a[i-1] = 1; // -1 frame count to array index
      }
    })

    let b = []; // b = [start, duration, start, duration, ...]
    a.forEach((x,i) => {
      if(b.length % 2 == 0 && x == 1) { b.push(i+1); }   // +1 index to frame
      else if(b.length % 2 == 1 && x == 0){ b.push(i+1 - b[b.length-1]); } // +1 index to frame
    })
    if(b.length % 2 == 1){ b.push(maxFrame+1 - b[b.length-1]); } // if last frame is still active somehow

    for(let i = 0; i < b.length; i+=2){
      createTick(b[i], b[i+1], "red");
    }

    // faf
    if("faf" in currentMove){
      createTick(currentMove.faf, 1);
    }

    // autocancel
    if("autocancel" in currentMove){
      createTick(currentMove.autocancel, 1, "green");
    }

    function createTick(start, duration, ...classList){
      let t = document.createElement("span");
      t.classList.add("tick");
      classList.forEach(c => {
        t.classList.add("tick-" + c);
      });
      let l = (maxFrame > 1) ? (start - 1) / (maxFrame - 1) : 0;
      let w = (maxFrame > 1) ? (duration - 1) / (maxFrame - 1) : 1;
      t.style.setProperty("left", `calc((100% - 16px) * ${l})`);
      t.style.setProperty("width", `calc((100% - 16px) * ${w} + 16px)`);
      tickContainer.append(t);
    }
  }

  controlStart.addEventListener("click", event => {
    setPlayerTime(0);
  });

  controlBack.addEventListener("click", event => {
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

/*--------------------------------
      HITBOX DETAILS TABLE
--------------------------------*/

function clearTable(){
  while(hitboxDetails.hasChildNodes()){ hitboxDetails.removeChild(hitboxDetails.firstChild); }
}

function updateTable(){
  clearTable();
  generateTable(getActiveHitboxes());
}

import ParamList from "./paramlist.js";

function getActiveHitboxes(){
  return currentMove.hitboxes.filter(h => (currentFrame >= h._frameStart && currentFrame < h._frameEnd));
}

function generateTable(hitboxes){
  if(hitboxes.length == 0){ return; }

  let table = document.createElement("table");
  let params = [];
  // if param is in any hitboxes and is not filtered out, add to header list
  ParamList.forEach(p => {
    for(let h of hitboxes){
      if(p.name in h && p.filter(h[p.name])){
        params.push(p);
        // TODO: add css [data-tooltip] for :hover -> underline, click -> toggle
        break;
      }
    }
  })
  // create row per hitbox
  for(let h of hitboxes){
    let row = table.insertRow();
    // cell per param
    for(let p of params){
      let td = row.insertCell();
      if(p.name in h){
        td.append(p.transform(h[p.name]));
      }
    }
    if("_type" in h){
      if(h._type == "Grab"){ row.classList += "type-grab"; }
    }
    if("_color" in h){
      row.style.background = h._color + "20"; // if hex
      row.querySelector(".hitbox-color-icon").style.background = h._color;
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
  hitboxDetails.append(table);
}
