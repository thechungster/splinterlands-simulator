"use strict";
exports.__esModule = true;
exports.TEAM_NUMBER = exports.coloredConsoleLog = exports.FoilType = exports.CardAttackType = exports.CardEdition = exports.CardColor = exports.CardType = exports.AttackType = exports.Stat = exports.Ruleset = exports.Ability = void 0;
/**
 * var abilityToEnumTS = function(ability) {
 *   var enumName = ability.name.toUpperCase().split(' ').join('_');
 *   return `${enumName} = '${ability.name}',`;
 * }
 * window.abilities.forEach((ability) => str+= abilityToEnumTS(ability));
 * copy(str);
 */
var Ability;
(function (Ability) {
    Ability["AFFLICTION"] = "Affliction";
    Ability["AMPLIFY"] = "Amplify";
    Ability["BACKFIRE"] = "Backfire";
    Ability["BLAST"] = "Blast";
    Ability["BLIND"] = "Blind";
    Ability["BLOODLUST"] = "Bloodlust";
    Ability["CAMOUFLAGE"] = "Camouflage";
    Ability["CLEANSE"] = "Cleanse";
    Ability["CLOSE_RANGE"] = "Close Range";
    Ability["CRIPPLE"] = "Cripple";
    Ability["DEATHBLOW"] = "Deathblow";
    Ability["DEMORALIZE"] = "Demoralize";
    Ability["DISPEL"] = "Dispel";
    Ability["DIVINE_SHIELD"] = "Divine Shield";
    Ability["DODGE"] = "Dodge";
    Ability["DOUBLE_STRIKE"] = "Double Strike";
    Ability["ENRAGE"] = "Enrage";
    Ability["FLYING"] = "Flying";
    Ability["FORCEFIELD"] = "Forcefield";
    Ability["GIANT_KILLER"] = "Giant Killer";
    Ability["HALVING"] = "Halving";
    Ability["HEADWINDS"] = "Headwinds";
    Ability["HEAL"] = "Heal";
    Ability["IMMUNITY"] = "Immunity";
    Ability["TANK_HEAL"] = "Tank Heal";
    Ability["INSPIRE"] = "Inspire";
    Ability["KNOCK_OUT"] = "Knock Out";
    Ability["LAST_STAND"] = "Last Stand";
    Ability["LIFE_LEECH"] = "Life Leech";
    Ability["MAGIC_REFLECT"] = "Magic Reflect";
    Ability["OPPORTUNITY"] = "Opportunity";
    Ability["OPPRESS"] = "Oppress";
    Ability["PHASE"] = "Phase";
    Ability["PIERCING"] = "Piercing";
    Ability["POISON"] = "Poison";
    Ability["PROTECT"] = "Protect";
    Ability["REACH"] = "Reach";
    Ability["RECHARGE"] = "Recharge";
    Ability["REDEMPTION"] = "Redemption";
    Ability["REPAIR"] = "Repair";
    Ability["RESURRECT"] = "Resurrect";
    Ability["RETALIATE"] = "Retaliate";
    Ability["RETURN_FIRE"] = "Return Fire";
    Ability["RUST"] = "Rust";
    Ability["SCATTERSHOT"] = "Scattershot";
    Ability["SCAVENGER"] = "Scavenger";
    Ability["SHATTER"] = "Shatter";
    Ability["SHIELD"] = "Shield";
    Ability["SILENCE"] = "Silence";
    Ability["SLOW"] = "Slow";
    Ability["SNARE"] = "Snare";
    Ability["SNEAK"] = "Sneak";
    Ability["SNIPE"] = "Snipe";
    Ability["STRENGTHEN"] = "Strengthen";
    Ability["STUN"] = "Stun";
    Ability["SWIFTNESS"] = "Swiftness";
    Ability["TAUNT"] = "Taunt";
    Ability["THORNS"] = "Thorns";
    Ability["TRAMPLE"] = "Trample";
    Ability["TRIAGE"] = "Triage";
    Ability["TRUE_STRIKE"] = "True Strike";
    Ability["VOID_ARMOR"] = "Void Armor";
    Ability["VOID"] = "Void";
    Ability["WEAKEN"] = "Weaken";
    /* Ruleset Ability */
    Ability["MELEE_MAYHEM"] = "Melee Mayhem";
})(Ability = exports.Ability || (exports.Ability = {}));
var Ruleset;
(function (Ruleset) {
    Ruleset["AIM_TRUE"] = "Aim True";
    Ruleset["ARMORED_UP"] = "Armored Up";
    Ruleset["BACK_TO_BASICS"] = "Back to Basics";
    Ruleset["BROKEN_ARROWS"] = "Broken Arrows";
    Ruleset["CLOSE_RANGE"] = "Close Range";
    Ruleset["EARTHQUAKE"] = "Earthquake";
    Ruleset["EQUAL_OPPORTUNITY"] = "Equal Opportunity";
    Ruleset["EQUALIZER"] = "Equalizer";
    Ruleset["EVEN_STEVENS"] = "Even Stevens";
    Ruleset["EXPLOSIVE_WEAPONRY"] = "Explosive Weaponry";
    Ruleset["FOG_OF_WAR"] = "Fog of War";
    Ruleset["HEALED_OUT"] = "Healed Out";
    Ruleset["HEAVY_HITTERS"] = "Heavy Hitters";
    Ruleset["HOLY_PROTECTION"] = "Holy Protection";
    Ruleset["KEEP_YOUR_DISTANCE"] = "Keep Your Distance";
    Ruleset["LITTLE_LEAGUE"] = "Little League";
    Ruleset["LOST_LEGENDARIES"] = "Lost Legendaries";
    Ruleset["LOST_MAGIC"] = "Lost Magic";
    Ruleset["MELEE_MAYHEM"] = "Melee Mayhem";
    Ruleset["NOXIOUS_FUMES"] = "Noxious Fumes";
    Ruleset["ODD_ONES_OUT"] = "Odd Ones Out";
    Ruleset["REVERSE_SPEED"] = "Reverse Speed";
    Ruleset["RISE_OF_THE_COMMONS"] = "Rise of the Commons";
    Ruleset["SILENCED_SUMMONERS"] = "Silenced Summoners";
    Ruleset["SPREADING_FURY"] = "Spreading Fury";
    Ruleset["STAMPEDE"] = "Stampede";
    Ruleset["STANDARD"] = "Standard";
    Ruleset["SUPER_SNEAK"] = "Super Sneak";
    Ruleset["TAKING_SIDES"] = "Taking Sides";
    Ruleset["TARGET_PRACTICE"] = "Target Practice";
    Ruleset["UNPROTECTED"] = "Unprotected";
    Ruleset["UP_CLOSE_AND_PERSONAL"] = "Up Close & Personal";
    Ruleset["WEAK_MAGIC"] = "Weak Magic";
})(Ruleset = exports.Ruleset || (exports.Ruleset = {}));
var Stat;
(function (Stat) {
    Stat["MANA"] = "mana";
    Stat["ATTACK"] = "attack";
    Stat["MAGIC"] = "magic";
    Stat["RANGED"] = "ranged";
    Stat["ARMOR"] = "armor";
    Stat["SPEED"] = "speed";
    Stat["HEALTH"] = "health";
})(Stat = exports.Stat || (exports.Stat = {}));
var AttackType;
(function (AttackType) {
    AttackType[AttackType["MELEE"] = 0] = "MELEE";
    AttackType[AttackType["RANGED"] = 1] = "RANGED";
    AttackType[AttackType["MAGIC"] = 2] = "MAGIC";
})(AttackType = exports.AttackType || (exports.AttackType = {}));
var CardType;
(function (CardType) {
    CardType["SUMMONER"] = "Summoner";
    CardType["MONSTER"] = "Monster";
})(CardType = exports.CardType || (exports.CardType = {}));
var CardColor;
(function (CardColor) {
    CardColor["BLACK"] = "Black";
    CardColor["BLUE"] = "Blue";
    CardColor["GOLD"] = "Gold";
    CardColor["GRAY"] = "Gray";
    CardColor["GREEN"] = "Green";
    CardColor["RED"] = "Red";
    CardColor["WHITE"] = "White";
})(CardColor = exports.CardColor || (exports.CardColor = {}));
var CardEdition;
(function (CardEdition) {
    CardEdition[CardEdition["ALPHA"] = 0] = "ALPHA";
    CardEdition[CardEdition["BETA"] = 1] = "BETA";
    CardEdition[CardEdition["PROMO"] = 2] = "PROMO";
    CardEdition[CardEdition["REWARD"] = 3] = "REWARD";
    CardEdition[CardEdition["UNTAMED"] = 4] = "UNTAMED";
    CardEdition[CardEdition["DICE"] = 5] = "DICE";
    CardEdition[CardEdition["GLADIUS"] = 6] = "GLADIUS";
    CardEdition[CardEdition["CHAOS"] = 7] = "CHAOS";
})(CardEdition = exports.CardEdition || (exports.CardEdition = {}));
var CardAttackType;
(function (CardAttackType) {
    CardAttackType["MELEE"] = "melee";
    CardAttackType["RANGED"] = "ranged";
    CardAttackType["MAGIC"] = "magic";
})(CardAttackType = exports.CardAttackType || (exports.CardAttackType = {}));
var FoilType;
(function (FoilType) {
    FoilType["STANDARD"] = "standard";
    FoilType["GOLD"] = "gold";
})(FoilType = exports.FoilType || (exports.FoilType = {}));
function coloredConsoleLog(text, color, backgroundColor) {
    console.log("%c ".concat(text, "."), "background: ".concat(backgroundColor, "; color: ").concat(color));
}
exports.coloredConsoleLog = coloredConsoleLog;
var TEAM_NUMBER;
(function (TEAM_NUMBER) {
    TEAM_NUMBER[TEAM_NUMBER["TIE"] = 0] = "TIE";
    TEAM_NUMBER[TEAM_NUMBER["FRIENDLY"] = 1] = "FRIENDLY";
    TEAM_NUMBER[TEAM_NUMBER["ENEMY"] = 2] = "ENEMY";
})(TEAM_NUMBER = exports.TEAM_NUMBER || (exports.TEAM_NUMBER = {}));
