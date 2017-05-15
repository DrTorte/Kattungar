import { Stats } from './Stats';

export class Character {
    Id: number;    
    Owner: number; //owner by Id.

    Name: string;
    Description: string;
    
    Position: {
        x: number,
        y: number
    } = {x: 0, y: 0};

    Stats: Stats = new Stats();

    public setStats(){
        if (this.Name == "Human"){
            this.Stats.Armor = 0;
            this.Stats.AttackCost = 4;
            this.Stats.FreshActionPoints = 10;
            this.Stats.Damage = 3;
            this.Stats.MaxHealth = 8;
            this.Stats.Range = 2;
        } else if (this.Name == "Orc"){
            this.Stats.Armor = 0;
            this.Stats.AttackCost = 4;
            this.Stats.FreshActionPoints = 14;
            this.Stats.Damage = 2;
            this.Stats.MaxHealth = 6;
            this.Stats.Range = 4;
        } else if (this.Name == "Ghoul"){
            this.Stats.Armor = 1;
            this.Stats.AttackCost = 3;
            this.Stats.FreshActionPoints = 12;
            this.Stats.Damage = 3;
            this.Stats.MaxHealth = 12;
            this.Stats.Range = 1;
        } else if (this.Name == "Troll"){
            this.Stats.Armor =1;
            this.Stats.AttackCost = 4;
            this.Stats.FreshActionPoints = 10;
            this.Stats.Damage = 6;
            this.Stats.MaxHealth = 10;
            this.Stats.Range = 1;
        }
        this.Stats.CurrentActionPoints = this.Stats.FreshActionPoints;
        this.Stats.Health = this.Stats.MaxHealth;
    }
}