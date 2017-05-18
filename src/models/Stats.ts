export class Stats{
    MaxHealth: number;
    Health: number;
    FreshActionPoints: number;
    CurrentActionPoints: number;

    Armor: number; //flat reduction of damage?
    Damage: number;
    Range: number; // jsut a flat range for attack.
    AttackCost: number; //how much it costs to attack.

    public die(){
        //all current numbers go to 0.
        this.FreshActionPoints = 0;
        this.CurrentActionPoints = 0;
    }
}