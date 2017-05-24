"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Stats {
    constructor() {
        this.Alive = true;
    }
    die() {
        //all current numbers go to 0.
        this.FreshActionPoints = 0;
        this.CurrentActionPoints = 0;
        this.Alive = false;
    }
}
exports.Stats = Stats;
