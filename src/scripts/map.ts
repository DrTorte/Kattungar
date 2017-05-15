export class Map{
    Id: number;
    Terrain: Terrain[] = [];
    //features can be added later.

    //call the constructor to decide how to generate the map.
    constructor(genType: string){
        if (genType == "" || genType == "flat"){
            //flat: create a square with flat ground.
            for(let x = 0; x < 64; x++){
                for (let y= 0; y < 64; y++){
                    if (x == 0 || y == 0 || x == 63 || y == 63){
                        this.Terrain.push(new Terrain(x,y,1));
                    } else {
                        this.Terrain.push(new Terrain(x,y,0));
                    }
                }
            }
        }
    }
}

export class Terrain{
    X:number;
    Y:number;
    Terrain:number; //0 is floor, 1 is solid.

    constructor(x: number, y: number, terrain: number){
        this.X = x;
        this.Y = y;
        this.Terrain = terrain;
    }
}