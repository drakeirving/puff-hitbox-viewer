class Moveset extends Map {
  constructor(iter){ super(iter); }

  addCurrentMove(niceName){
    return this.set(
      document.querySelector(".script-select select:last-child").selectedOptions[0].textContent,
      scrapeMove(niceName)
    );

    function scrapeMove(niceName){
      let move = {};
      move.niceName = niceName;
      let hitboxes = [];
      let f = 1;
      let script = [...document.querySelectorAll(".script-cmd")].map(e=>e.parentNode.textContent);
      for(let s of script){
        // Frame
        let frame = s.match(/^frame\(Frame=(\d+)\)/);
        if(frame !== null && frame.length==2){
          f = Number(frame[1]);
          continue;
        }
        // Wait
        let wait = s.match(/^wait\(Frames=(\d+)\)/) || s.match(/^wait\(0, (\d+)\)/) ;
        if(wait !== null && wait.length==2){
          f += Number(wait[1]);
          continue;
        }
        // Attack
        if(/^\s*ATTACK(_IGNORE_THROW)?\(/.test(s)){
          let h = readHitbox(s);
          h._frameStart = f;
          hitboxes.forEach((h2,i) => {
            if(!("_frameEnd" in h2) && h.ID == h2.ID){
              h2._frameEnd = f;
            }
          });
          hitboxes.push(h);
          continue;
        }
        // Grab
        if(/^\s*CATCH\(/.test(s)){
          let h = readHitbox(s);
          h._frameStart = f;
          hitboxes.forEach((h2,i) => {
            if(!("_frameEnd" in h2) && h.ID == h2.ID){
              h2._frameEnd = f;
            }
          });
          hitboxes.push(h);
          continue;
        }
        // Clear all hitboxes
        if(/^\s*AttackModule__clear_all/.test(s) || /^\s*grab\(MA_MSC_CMD_GRAB_CLEAR_ALL\)/.test(s)){
          hitboxes.forEach(h => {
            if(!("_frameEnd" in h)){
              h._frameEnd = f;
            }
          });
          continue;
        }
        // Clear hitbox ID
        let clear = s.match(/^\s*AttackModule__clear\(ID=(\d+)\)/);
        if(clear !== null && clear.length==2){
          hitboxes.forEach(h=>{if(h.ID == clear[1] && !("_frameEnd" in h)){h._frameEnd = f;}});
          continue;
        }
        // Autocancel
        if(/^\s*WorkModule__off_flag\(Flag=FIGHTER_STATUS_ATTACK_AIR_FLAG_ENABLE_LANDING\)/.test(s)){
          move.autocancel = f;
        }
        // FT_MOTION_RATE
        if(/^FT_MOTION_RATE/.test(s)){
          let msg = `WARNING (${niceName}): FT_MOTION_RATE is used. Please adjust frames manually.`;
          console.warn(msg); alert(msg);
          continue;
        }
        // For-loop
        if(/^for\(/.test(s)){
          let msg = `WARNING (${niceName}): for loop is used. Please adjust frames manually.`;
          console.warn(msg); alert(msg);
          continue;
        }
      }
      hitboxes.forEach(h=>{if(!("_frameEnd" in h)){h._frameEnd = f;}});
      move.hitboxes = hitboxes;
      return move;

      function readHitbox(s){
        let h = Object.fromEntries(
            [...s.matchAll(/([\w\/]+)=([\w\._]+)/g)]
            .map(x => [x[1], x[2]])
        );
        if(s.includes("CATCH(")){ h._type = "Grab"; }
        return h;
      }
    }
  }

  setHitboxCustom(move, hitbox_id, param, value){
    this.get(move).hitboxes[hitbox_id][param] = value;
  }

  setHitboxColor(move, hitbox_id, color){
    setHitboxCustom(move, hitbox_id, "_color", color)
  }

  setHitboxNotes(move, hitbox_id, notes){
    setHitboxCustom(move, hitbox_id, "_notes", notes)
  }

  setMoveFAF(move, faf){
    this.get(move).faf = faf;
  }

  setMoveNotes(move, notes){
    this.get(move)._notes = notes;
  }

  stringify(){
    return JSON.stringify(this, function(k, v){
      if(v instanceof Map){
        return [...v.entries()]
      }
      return v;
    });
  }
}

// helper functions

function createMoveset(scriptMap){
  let moveset = new Moveset();
  addAllScripts(moveset, scriptMap);
  return moveset;
}

function addAllScripts(moveset, scriptMap){
  Object.keys(scriptMap).forEach(i => {
    addScript(moveset, i, scriptMap[i])
  });
  return moveset;
}

function addScript(moveset, index, niceName){
  changeScript(index);
  return moveset.addCurrentMove(niceName);

  function changeScript(index){
    let select = document.querySelector(".script-select select:last-child")
    select.value = index;
    let e = document.createEvent("HTMLEvents");
    e.initEvent("change", true, true);
    select.dispatchEvent(e);
  }
}

function saveMoveset(moveset, filename="moveset.json"){
  let blob = new Blob([moveset.stringify()], { type: "text/json" });
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.dispatchEvent(new MouseEvent("click"));
}

function parseMoveset(str){
  return JSON.parse(str, function(k, v){
    if(v instanceof Array && v.every(x=>x.length==2)){
      return new Moveset(v);
    }
    return v;
  })
}

// (function example_run(){
//   let scriptMap = {
//     15: "Jab 1",
//     16: "Jab 2",
//     17: "Dash Attack"
//   };
//   return createMoveset(scriptMap);
// })();
