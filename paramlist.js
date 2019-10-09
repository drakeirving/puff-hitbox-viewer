const ParamList = (() => {
  const not = y => (x => x != y);
  const pass = x => true;
  const self = x => x;

  function Param(name, options={}){
    return {
      name: name,
      filter: options.filter || pass,         // if omitted, all values are accepted
      transform: options.transform || self, // if omitted, cell values are not transformed on output
      tooltip: options.tooltip || null,     // if omitted, no tooltip on header
      niceName: options.niceName || name    // if omitted, table header name is param name
    }
  }

  function wrapTooltip(content, tooltip){
    let span = document.createElement("span");
    span.append(content);
    span.setAttribute("data-tooltip", tooltip);
    return span;
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
      tooltip: "Hitbox ID: Hitboxes are checked for collision in ascending order of ID"
    }),
    Param("_type", { nicename: "Type" }),
    Param("Damage"),
    Param("ShieldDamage", { filter: not(0), niceName: "ShieldDmg" }),
    Param("Angle", {
      transform: x => {
        let out = `${x}°`;
        if(x == 361){ out = wrapTooltip(out, "Sakurai angle: At low knockback sends at 0° and scales up to 38° as knockback increases"); }
        else if(x > 361){ out = wrapTooltip(out, "Autolink angle: Typically in multihit moves, the resulting angle is calculated to ensure the opponent stays in the move"); }
        return out;
      }
    }),
    Param("KBG", {
      tooltip: "Knockback Growth"
    }),
    Param("BKB", {
      tooltip: "Base Knockback"
    }),
    Param("FKB", {
      filter: not(0),
      tooltip: "Fixed Knockback"
    }),
    Param("Hitlag", {
      filter: not(1),
      tooltip: "Hitlag multiplier: Modifies duration of hitlag"
    }),
    Param("SDI", {
      filter: not(1),
      tooltip: "SDI multiplier: Modifies distance moved through Smash Directional Influence"
    }),
    Param("Rehit", {
      filter: not(0),
      tooltip: "Move hits every X frames of its active frames"
    }),
    Param("Trip", {
      filter: not(0),
      transform: x => `${x*100}%`,
      tooltip: "Probability of move causing a trip"
    }),
    Param("Flinchless", {
      filter: not("False"),
      tooltip: "Move deals knockback, but does not cause hitstun; also known as windbox, pushbox, etc"
    }),
    Param("Effect", {
      filter: not("collision_attr_normal"),
      transform: x => ({
        "collision_attr_normal": "Normal",
        "0x13135c5462": wrapTooltip("Rush", "Slightly reduced visual effects, typically seen with multihits"),
        "0x149cdc52bb": wrapTooltip("Sleep", "Causes the opponent to fall asleep, for a duration that scales with damage and KBG"),
        "0x152497ab8d": wrapTooltip("Flower", "Puts a flower on the opponent that gradually damages them")
      })[x]
    }),
    Param("FacingRestrict", {
      filter: not("ATTACK_LR_CHECK_POS"),
      transform: x => ({
        "ATTACK_LR_CHECK_POS": wrapTooltip("F/B", "Sends forward or backwards depending on position relative to hitbox"),
        "ATTACK_LR_CHECK_F": wrapTooltip("F", "Always sends forwards"),
        "ATTACK_LR_CHECK_B": wrapTooltip("B", "Always sends backwards")
      })[x],
      niceName: "Dir.",
      tooltip: "Direction"
    }),
    Param("Clang/Rebound", {
      filter: not("ATTACK_SETOFF_KIND_ON"),
      transform: x => ({
        "ATTACK_SETOFF_KIND_ON": "Yes",
        "ATTACK_SETOFF_KIND_THRU": wrapTooltip("No Rebound", "Hit clanks without rebounding: the clanking hit will be canceled, but the move will continue"),
        "ATTACK_SETOFF_KIND_OFF": wrapTooltip("No Clank", "Hit does not clank with other hitboxes and both moves will continue unaffected"),
      })[x],
      niceName: "Clank/Rebound",
      tooltip: "Whether the hitbox has the potential to clank and/or rebound upon collision with another hitbox"
    }),
    Param("Ground/Air", {
      filter: not("COLLISION_SITUATION_MASK_GA"),
      transform: x => ({
        "COLLISION_SITUATION_MASK_GA": "Both",
        "COLLISION_SITUATION_MASK_G": "Ground",
        "COLLISION_SITUATION_MASK_A": "Air"
      })[x],
      tooltip: "Whether the move hits only grounded or airborne opponents, or both"
    }),
    Param("_notes", { nicename: "Notes" })
  ]; // TODO: more params

  return list;
})();

export default ParamList;
