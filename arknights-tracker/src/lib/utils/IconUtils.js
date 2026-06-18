export function getIconIdByAttr(attr) {
    return attrId2IconId[attr] ?? null;
}

const attrId2IconId = {
    attr_atk: "atk",
    attr_hp: "hp",
    attr_agi: "agi",
    attr_str: "str",
    attr_wisd: "int",
    attr_will: "will",
    attr_firedam: "heat",
    attr_icedam: "cryo",
    attr_naturaldam: "nature",
    attr_phydam: "physical",
    attr_pulsedam: "electric",
    attr_crirate: "crirate",
    attr_usp: "usp",
    attr_heal: "heal",
    attr_physpell: "magicdam",
};