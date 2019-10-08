const ParamList = (() => {
  const not = y => (x => x != y);
  const pass = x => true;
  const self = x => x;

  function Param(name, options={}){
    return {
      name: name,
      filter: options.filter || pass,         // if omitted, all values are accepted
      transform: options.transform || self, // if omitted, values are not transformed on output
      tooltip: options.tooltip || null,     // if omitted, no tooltip
      niceName: options.niceName || name    // if omitted, table header name is param name
    }
  }

  let list = [
    Param("ID", {
      transform: x => {
        let e = document.createElement("span");
        e.classList += "hitbox-id";
        let icon = document.createElement("span");
        icon.classList += "hitbox-color-icon";
        e.append(icon);
        e.append(x);
        return e;
      },
      tooltip: "derp"
    }),
    Param("_type", { nicename: "Type" }),
    Param("Damage"),
    Param("ShieldDamage", { filter: not(0), niceName: "ShieldDmg" }),
    Param("Angle", { transform: x => `${x}°` }),
    Param("KBG"),
    Param("BKB"),
    Param("FKB", { filter: not(0) }),
    Param("Hitlag", { filter: not(1) }),
    Param("SDI", { filter: not(1) }),
    Param("Rehit", { filter: not(0) }),
    Param("Trip", { filter: not(0), transform: x => `${x*100}%` }),
    Param("Flinchless", { filter: not("False") }),
    Param("Effect", {
      filter: not("collision_attr_normal"),
      transform: x => ({
        "collision_attr_normal": "Normal",
        "0x13135c5462": "Rush",
        "0x149cdc52bb": "Sleep",
        "0x152497ab8d": "Flower"
      })[x]
    }),
    Param("FacingRestrict", {
      filter: not("ATTACK_LR_CHECK_POS"),
      transform: x => ({
        "ATTACK_LR_CHECK_POS": "F/B",
        "ATTACK_LR_CHECK_F": "F",
        "ATTACK_LR_CHECK_B": "B"
      })[x],
      niceName: "Dir."
    }),
    Param("Clang/Rebound", {
      filter: not("ATTACK_SETOFF_KIND_ON"),
      transform: x => ({
        "ATTACK_SETOFF_KIND_ON": "Yes",
        "ATTACK_SETOFF_KIND_THRU": "No Rebound",
        "ATTACK_SETOFF_KIND_OFF": "No Clank",
      })[x],
      niceName: "Clank/Rebound"
    }),
    Param("Ground/Air", {
      filter: not("COLLISION_SITUATION_MASK_GA"),
      transform: x => ({
        "COLLISION_SITUATION_MASK_GA": "Both",
        "COLLISION_SITUATION_MASK_G": "Ground",
        "COLLISION_SITUATION_MASK_A": "Air"
      })[x]
    }),
    Param("_notes", { nicename: "Notes" })
  ]; // TODO: more params

  return list;
})();

export default ParamList;
