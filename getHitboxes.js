// scraping from ruben script viewer

function getHitboxes(){
  return [...document.querySelectorAll(".script-cmd")]
    .map(e=>e.parentNode.textContent)
    .filter(s => s.includes("ATTACK(") || s.includes("CATCH("))
    .map(s => {
      let h = Object.fromEntries(
        [...s.matchAll(/([\w\/]+)=([\w\._]+)/g)]
        .map(x => [x[1], x[2]])
      );
      if(s.includes("CATCH(")){ h._type = "Grab"; }
      return h;
    })
    // update
}

let moveset = new Map();

function addCurrentMove(){
  moveset.set(
    document.querySelector(".script-select select:last-child").selectedOptions[0].textContent,
    getHitboxes()
  )
  // note still have to add extra stuff e.g. hitbox frame info and move nicename
}

function setHitboxCustom(move, hitbox_id, param, value){
  moveset.get(move).hitboxes[hitbox_id][param] = value;
}

function setHitboxColor(move, hitbox_id, color){
  setHitboxCustom(move, hitbox_id, "_color", color)
}

function setHitboxNotes(move, hitbox_id, notes){
  setHitboxCustom(move, hitbox_id, "_notes", notes)
}

function setMoveNotes(move, notes){
  moveset.get(move)._notes = notes;
}

// json manip

function stringify(moveset){
  return JSON.stringify(moveset, function(k, v){
  	if(v instanceof Map){
      return [...v.entries()]
  	}
  	return v;
  })
}

function parse(str){
  return JSON.parse(str, function(k, v){
  	if(v instanceof Array && v.every(x=>x.length==2)){
  	  return new Map(v)
  	}
    return v;
  })
}
