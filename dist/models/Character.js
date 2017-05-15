"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Stats_1 = require("./Stats");
class Character {
    constructor() {
        this.Position = { x: 0, y: 0 };
        this.Stats = new Stats_1.Stats();
    }
    setStats() {
        if (this.Name == "Human") {
            this.Stats.Armor = 0;
            this.Stats.AttackCost = 4;
            this.Stats.FreshActionPoints = 10;
            this.Stats.Damage = 3;
            this.Stats.MaxHealth = 8;
            this.Stats.Range = 2;
        }
        else if (this.Name == "Orc") {
            this.Stats.Armor = 0;
            this.Stats.AttackCost = 4;
            this.Stats.FreshActionPoints = 14;
            this.Stats.Damage = 2;
            this.Stats.MaxHealth = 6;
            this.Stats.Range = 4;
        }
        else if (this.Name == "Ghoul") {
            this.Stats.Armor = 1;
            this.Stats.AttackCost = 3;
            this.Stats.FreshActionPoints = 12;
            this.Stats.Damage = 3;
            this.Stats.MaxHealth = 12;
            this.Stats.Range = 1;
        }
        else if (this.Name == "Troll") {
            this.Stats.Armor = 1;
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
exports.Character = Character;
