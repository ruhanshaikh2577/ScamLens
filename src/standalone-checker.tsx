import { render } from "preact";
import { h } from "preact";
import CheckerIsland from "./components/checker/CheckerIsland";

const root = document.getElementById("checker-mount");
if (root) render(h(CheckerIsland, null), root);
