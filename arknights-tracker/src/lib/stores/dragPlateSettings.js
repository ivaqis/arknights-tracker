import { browser } from "$app/environment";
import { writable } from "svelte/store";

const storedCtrlForZoom = browser ? localStorage.getItem("ctrlForZoom") === "true" : false;

export const ctrlForZoom = writable(storedCtrlForZoom);

if (browser) {
    ctrlForZoom.subscribe((value) => {
        localStorage.setItem("ctrlForZoom", value.toString());
    });
}