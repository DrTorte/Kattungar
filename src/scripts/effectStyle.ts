//effect styles handle transitioning of elements.
//if null, ignored. if not null, acted upon. Some are incremental such as acceleration, most are absolute.
//there should be some transitioning later.

export class EffectStyle{
    Name: string; //??
    Delay: number; //determines when the effect style takes effect.
    Lifespan: number;

    ColorStart: number;
    ColorEnd: number;
    Velocity: {x:number,y:number};
    Acceleration: {x:number,y:number};
}