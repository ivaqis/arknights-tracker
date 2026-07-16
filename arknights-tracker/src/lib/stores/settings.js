// src/lib/stores/settings.js

import { writable } from "svelte/store";
import { browser } from "$app/environment";

const storedDarkening = browser ? localStorage.getItem("disableDarkening") === "true" : false;
const storedSkillMode = browser ? localStorage.getItem("preferredSkillMode") || "list" : "list";

export const disableDarkening = writable(storedDarkening);
export const preferredSkillMode = writable(storedSkillMode);

if (browser) {
    disableDarkening.subscribe(value => {
        localStorage.setItem("disableDarkening", value.toString());
    });
    preferredSkillMode.subscribe(value => {
        localStorage.setItem("preferredSkillMode", value);
    });
}