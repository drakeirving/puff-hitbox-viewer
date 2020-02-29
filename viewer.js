const CHARACTERS = [
  "Isabelle",
  "Jigglypuff",
  "Piranha Plant"
];
const player = document.querySelector("#player video");
const charSelect = document.querySelector("#char-select");
const moveSelect = document.querySelector("#move-select");
const controlStart = document.querySelector("#control-start");
const controlBack = document.querySelector("#control-back");
const controlPlay = document.querySelector("#control-play");
const controlNext = document.querySelector("#control-next");
const controlEnd = document.querySelector("#control-end");
const controlLoop = document.querySelector("#control-loop");
const frameCounter = document.querySelector("#frame-counter");
const sliderContainer = document.querySelector("#slider-container");
const frameSlider = document.querySelector("#frame-slider");
const tickContainer = document.querySelector("#tick-container");
const hitboxDetails = document.querySelector("#hitbox-details");
const moveNotes = document.querySelector("#move-notes");

let userQuery = new URL(window.location).searchParams;

const STEP = 0.05; // assumed 20.00 FPS
const RATE = 1/STEP;
const EPS = 0.00001;

let currentChar = null;
let moveset = null;
let currentMove = null;
let currentFrame = 1;
let maxFrame = 1;
frameCounter.value = "";
frameCounter.disabled = true;
let loopFlag = false;

// check query params to start at specific frame
let initialFrame = (userQuery.has("f")) ? userQuery.get("f") : 1;

/*--------------------------------
         LOADING / SETUP
--------------------------------*/

(function init(){
  populateCharSelect();
  setupControls();
})();

function populateCharSelect(){
  CHARACTERS.forEach((x) => {
    let e = document.createElement("option");
    e.value = x;
    e.text = x;
    charSelect.add(e);
  });

  charSelect.addEventListener("change", event => {
    setCharacter(event.target.value);
  })

  charSelect.selectedIndex = 0;

  // check query params to load specific char
  if(userQuery.has("char")){
    setCharacter(userQuery.get("char"));
  }
}

function setCharacter(char){
  if(CHARACTERS.includes(char)){
    currentChar = char;
    charSelect.value = currentChar;
    getData(`./data/${currentChar}/moveset.json`);
  }
}

function getData(file){
  return fetch(file)
    .then(res => res.text())
    .then(str => {
      moveset = parse(str);
      setupChar();
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

function setupChar(){
  clearMoveSelect();
  populateMoveSelect();
}

function clearMoveSelect(){
  while(moveSelect.children.length > 1){
    moveSelect.removeChild(moveSelect.children[moveSelect.children.length-1]);
  }
}

function populateMoveSelect(){
  moveset.forEach((value, key) => {
    let e = document.createElement("option");
    e.value = key;
    e.text = value.niceName;
    moveSelect.add(e);
  });

  moveSelect.addEventListener("change", event => {
    // pass in blob url if clip has been previously loaded
    setMove(event.target.value, event.target.selectedOptions[0].dataset.url);
  })

  moveSelect.selectedIndex = 0;

  // check query params to load specific move
  if(currentChar != null && userQuery.has("move")){
    setMove(userQuery.get("move"));
  }
}

function setMove(moveName, url){
  if(moveset.has(moveName)){ // check script names
    _setMove(moveName);
  }else{
    moveset.forEach((v,k) => { // check nice names
      if(v.niceName == moveName){
        _setMove(k);
      }
    });
  }

  function _setMove(move){
    currentMove = moveset.get(move);
    moveSelect.value = move;
    if(url){ // if blob url was passed, skip fetch
      prepareClip(url);
    }else{
      loadAVideo(`./data/${currentChar}/video/mp4/${currentMove.niceName}.mp4`);
    }
  }
}

function loadAVideo(src){
  fetch(src)
  .then(res => res.blob())
  .then(blob => {
    if(blob.type == ""){ // NOTE: explicitly setting mime-type required for safari, it drops blob's type
      blob = new Blob([blob], { type: "video/mp4" });
    }
    let url = URL.createObjectURL(blob);
    moveSelect.selectedOptions[0].dataset.url = url;
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

function setupControls(){

  player.addEventListener("loadedmetadata", event => {
    maxFrame = Math.max(1, Math.floor((player.duration + EPS) / STEP));
    frameCounter.max = maxFrame;
    frameSlider.max = maxFrame;

    updateActiveFrames();
    updateMoveNotes();

    // NOTE: required to prompt playback for mobile safari in order to load media
    // NOTE: muted and playsinline attrs: https://webkit.org/blog/6784/new-video-policies-for-ios/
    setTimeout(() => {
      if(player.readyState == 1){ // if stuck on HAVE_METADATA
        player.play()
        .then(() => {
          player.pause();
          setPlayerTime(0);
        });
      }
    }, 100);
  });

  player.addEventListener("canplaythrough", event => {
    if(initialFrame > 1){ // if `frame` query param is prepared
      setPlayerTime((initialFrame - 1) * STEP + EPS/2);
      initialFrame = 1;
    }
  });

  function clearMoveNotes(){
    while(moveNotes.hasChildNodes()){ moveNotes.removeChild(moveNotes.firstChild); }
  }

  function updateMoveNotes(){
    clearMoveNotes();
    if("_notes" in currentMove){
      let div = document.createElement("div");
      let s = document.createElement("strong");
      s.append("Additional Notes: ");
      div.append(s);
      div.append(currentMove._notes);
      moveNotes.append(div);
    }
  }

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
      createTick(b[i], b[i+1], `Active: ${b[i]}-${b[i]+b[i+1]-1}`, "red");
    }

    // faf
    if("faf" in currentMove){
      createTick(currentMove.faf, 1, `FAF: ${currentMove.faf}`);
    }

    // autocancel
    if("autocancel" in currentMove){
      let ac = currentMove.autocancel;
      if("before" in ac){
        createTick(ac.before, 1, (ac.before > 1) ? `Autocancel: 1-${ac.before}` : `Autocancel: ${ac.before}`, "blue");
      }
      if("after" in ac){
        createTick(ac.after, 1, `Autocancel: ${ac.after}+`, "blue");
      }
    }

    // move transition
    if("transition" in currentMove){
      Object.keys(currentMove.transition).forEach((k) => {
        createTick(k, 1, `Transition: ${k} (${currentMove.transition[k]})`, "yellow");
      });
    }

    // TODO: ledgesnap?

    function createTick(start, duration, tooltip, ...classList){
      let t = document.createElement("div");
      t.classList.add("tick");
      classList.forEach(c => {
        t.classList.add("tick-" + c);
      });
      t.setAttribute("data-tooltip", tooltip);
      let l = (maxFrame > 1) ? (start - 1) / (maxFrame - 1) : 0;
      let w = (maxFrame > 1) ? (duration - 1) / (maxFrame - 1) : 1;
      t.style.setProperty("left", `calc((100% - 16px) * ${l})`);
      t.style.setProperty("width", `calc((100% - 16px) * ${w} + 16px)`);
      tickContainer.append(t);
    }
  }

  // BUTTONS / PLAYER

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

  controlLoop.addEventListener("click", event => {
    if(loopFlag){
      loopFlag = false;
      controlLoop.removeAttribute("loop");
    }else{
      loopFlag = true;
      controlLoop.setAttribute("loop","");
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
      if(loopFlag){
        player.currentTime = 0;
        player.play();
      }else{
        player.currentTime = player.duration - STEP + EPS/2;
        player.pause();
      }
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

  // SLIDER CONTROLS

  let slideThrottle = false;

  sliderContainer.addEventListener('pointerdown', e => {
    function drag(e) {
      if(!slideThrottle){
        let v = (maxFrame-1) * (e.clientX - sliderContainer.offsetLeft - 8) / (sliderContainer.offsetWidth - 16) + 1;
        frameSlider.value = v;
        frameSlider.dispatchEvent(new Event("input"));
      }
    }
    drag(e);
    sliderContainer.addEventListener('pointermove', drag);
    document.addEventListener('pointerup', e => {
      sliderContainer.removeEventListener('pointermove', drag);
    }, {once: true});
  });

  frameSlider.addEventListener("input", event => {
    if(!slideThrottle && (frameSlider.valueAsNumber - 1) * STEP + EPS/2 < player.duration){
      setPlayerTime((frameSlider.valueAsNumber - 1) * STEP + EPS/2);
      slideThrottle = true;
    }
  });
  setInterval(() => slideThrottle = false, 25);

  // COMMON

  function setPlayerTime(t){
    if(player.readyState == 4){
      player.pause();
      player.currentTime = t;
      updateFrame();
    }
  }

  function updateFrame(){
    let frame = Math.floor((player.currentTime + EPS) / STEP) + 1;
    if(frame < 1){ frame = 1; }
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
      if(h._type == "Grab"){ row.classList.add("type-grab"); }
    }
    if("_color" in h){
      row.style.background = h._color + "20"; // if hex
      row.querySelector(".hitbox-color-icon").style.background = h._color;
    }else{
      // assumes there is an id?
      row.classList.add(`hitbox-id-${h.ID}`);
    }
  }
  // create header
  let thead = table.createTHead();
  let row = thead.insertRow();
  for(let p of params){
    let th = document.createElement("th");
    let content = p.tooltip ? wrapTooltip(p.niceName, p.tooltip) : p.niceName;
    th.append(content);
    row.append(th);
  }
  // add to page
  hitboxDetails.append(table);

  function wrapTooltip(content, tooltip){
    let span = document.createElement("span");
    span.append(content);
    span.setAttribute("data-tooltip", tooltip);
    return span;
  }
}
