import { writable } from "svelte/store";
import { browser } from "$app/environment";

const storedDarkening = browser ? localStorage.getItem("disableDarkening") === "true" : false;
const storedSkillMode = browser ? localStorage.getItem("preferredSkillMode") || "list" : "list";
const storedSplitEquipmentView = browser ? localStorage.getItem("splitEquipmentView") === "true" : false;

export const disableDarkening = writable(storedDarkening);
export const preferredSkillMode = writable(storedSkillMode);
export const splitEquipmentView = writable(storedSplitEquipmentView);

if (browser) {
    disableDarkening.subscribe(value => {
        localStorage.setItem("disableDarkening", value.toString());
    });
    preferredSkillMode.subscribe(value => {
        localStorage.setItem("preferredSkillMode", value);
    });
    splitEquipmentView.subscribe(value => {
        localStorage.setItem("splitEquipmentView", value.toString());
    });
}