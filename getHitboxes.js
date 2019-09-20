// scraping from ruben script viewer

function getHitboxes(){
  return [...document.querySelectorAll(".script-cmd")]
    .map(e=>e.parentNode.textContent)
    .filter(s => s.includes("ATTACK(") || s.includes("CATCH("))
    .map(s=>
      new Map(
        [...s.matchAll(/([\w\/]+)=([\w\._]+)/g)]
        .map(x => [x[1], x[2]])
      )
    )
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
