"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Map {
    //features can be added later.
    //call the constructor to decide how to generate the map.
    constructor(genType) {
        this.Terrain = [];
        if (genType == "" || genType == "flat") {
            //flat: create a square with flat ground.
            for (let x = 0; x < 32; x++) {
                for (let y = 0; y < 16; y++) {
                    if (x == 0 || y == 0 || x == 31 || y == 15) {
                        this.Terrain.push(new Terrain(x, y, 1));
                    }
                    else {
                        this.Terrain.push(new Terrain(x, y, 0));
                    }
                }
            }
        }
    }
    //check for walls. If there is wall collision, that's a no go.
    checkPos(x, y) {
        return (this.Terrain.find(z => z.X == x && z.Y == y && z.Terrain == 0) != null);
    }
}
exports.Map = Map;
class Terrain {
    constructor(x, y, terrain) {
        this.X = x;
        this.Y = y;
        this.Terrain = terrain;
    }
}
exports.Terrain = Terrain;
