export class Map{
    Id: number;
    Terrain: Terrain[] = [];
    //features can be added later.

    //call the constructor to decide how to generate the map.
    constructor(genType: string){
        if (genType == "" || genType == "flat"){
            //flat: create a square with flat ground.
            for(let x = 0; x < 32; x++){
                for (let y= 0; y <16; y++){
                    if (x == 0 || y == 0 || x == 31 || y == 15){
                        this.Terrain.push(new Terrain(x,y,1));
                    } else {
                        this.Terrain.push(new Terrain(x,y,0));
                    }
                }
            }
        }
    }


    //check for walls. If there is wall collision, that's a no go.
    public checkPos(x : number, y: number) : boolean {
        return (this.Terrain.find(z => z.X == x && z.Y == y && z.Terrain == 0) != null);
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