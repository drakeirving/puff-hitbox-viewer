const ParamList = (() => {
  let not = y => (x => x != y);
  let pass = x => true;
  let self = x => x;

  function Param(name, filter = pass, transform = self, niceName = name){
    return {
      name: name,
      filter: filter,         // if omitted, all values are accepted
      transform: transform,  // if omitted, values are not transformed on output
      niceName: niceName    // if omitted, table header name is param name
    }
  }

  let list = [
    Param("ID", pass, x => {
      let e = document.createElement("span");
      e.classList += "hitbox-id";
      e.textContent = x;
      return e;
    }),
    Param("Damage"),
    Param("ShieldDamage", not(0), self, "ShieldDmg"),
    Param("Angle", pass, x => `${x}°`),
    Param("KBG"),
    Param("BKB"),
    Param("FKB", not(0)),
    Param("Hitlag", not(1)),
    Param("SDI", not(1)),
    Param("Rehit", not(0)),
    Param("Trip", not(0), x => `${x*100}%`),
    Param("Effect", not("collision_attr_normal"), x => ({
      "collision_attr_normal": "Normal",
      "0x13135c5462": "Rush",
      "0x149cdc52bb": "Sleep",
      "0x152497ab8d": "Flower"
    })[x]),
    Param("FacingRestrict", not("ATTACK_LR_CHECK_POS"), x => ({
      "ATTACK_LR_CHECK_POS": "F/B",
      "ATTACK_LR_CHECK_F": "F",
      "ATTACK_LR_CHECK_B": "B"
    })[x], "Dir."),
    Param("Clang/Rebound", not("ATTACK_SETOFF_KIND_ON"), x => ({
      "ATTACK_SETOFF_KIND_ON": "Yes",
      "ATTACK_SETOFF_KIND_THRU": "No Rebound",
      "ATTACK_SETOFF_KIND_OFF": "No Clank",
    })[x], "Clank/Rebound"),
    Param("Ground/Air", not("COLLISION_SITUATION_MASK_GA"), x => ({
      "COLLISION_SITUATION_MASK_GA": "Both",
      "COLLISION_SITUATION_MASK_G": "Ground",
      "COLLISION_SITUATION_MASK_A": "Air"
    })[x]),
    Param("Notes")
  ];

  return list;
})();

export default ParamList;
