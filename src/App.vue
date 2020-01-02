<template>
  <div class="combat-screen-component" v-if="!result">
    <div class="enemies unit-frames">
      <UnitFrame v-for="(enemyUnit, index) in enemyUnits" :key="index" :unit="enemyUnit" :active="activeUnit === enemyUnit"></UnitFrame>
    </div>
    <div class="body" :style="{ 'background-image': `url(${background})` }">
      <CombatLog
        class="combatlog"
        :entries="combatLog"
      ></CombatLog>
      <DialogPanel class="dialogpanel"></DialogPanel>
      <ActionPanel
        class="actionpanel"
        v-if="activeUnitPlayable && activeUnit.hp > 0"
        :unit="activeUnit"
        :friendlyUnits="friendlyUnits"
        :unfriendlyUnits="unfriendlyUnits"
        @action="handleAction($event)"
      ></ActionPanel>
    </div>
    <div class="party unit-frames">
      <UnitFrame v-for="(partyUnit, index) in partyUnits" :key="index" :unit="partyUnit" :active="activeUnit === partyUnit"></UnitFrame>
    </div>
  </div>
  <div v-else class="result">
    {{ result }}
  </div>
</template>

<script>
const counts = ['', 'once', 'twice', 'thrice', 'four times', 'five times'];

import UnitFrame from './components/UnitFrame';
import CombatLog from './components/CombatLog';
import DialogPanel from './components/DialogPanel';
import ActionPanel from './components/ActionPanel';
export default {
  props: ['background', 'party', 'enemies', 'callback'],
  data() {
    return {
      partyUnits: [ ... this.party ],
      enemyUnits: [ ... this.enemies ],
      turnIndex: 0,
      combatLog: [],
      dialog: [],
      result: '',
    };
  },
  computed: {
    allUnits() {
      return [ ... this.partyUnits, ... this.enemyUnits ];
    },
    activeUnit() {
      return this.allUnits[this.turnIndex % this.allUnits.length];
    },
    activeUnitPlayable() {
      return this.activeUnit.isPlayable;
    },
    activeUnitInParty() {
      return this.partyUnits.some((u) => u === this.activeUnit);
    },
    friendlyUnits() {
      return this.activeUnitInParty ? this.partyUnits : this.enemyUnits;
    },
    unfriendlyUnits() {
      return !this.activeUnitInParty ? this.partyUnits : this.enemyUnits;
    },
  },
  methods: {
    handleAction({ ability, targets }) {
      // Reduce all cooldowns for this unit's abilities
      this.activeUnit.abilities.forEach((a) => {
        if (a.curcd > 0) a.curcd--;
      });
      // Perform the action, assuming there is one
      if (ability) {
        const hitChance = this.activeUnit.acc * ability.acc;
        const rawdamage = ability.dmgmod.map((mod) => Math.round(mod * this.activeUnit.atk));
        const healing = ability.healmod.map((mod) => Math.round(mod * this.activeUnit.heal));

        targets.forEach((target) => {
          if (rawdamage.length > 0) {
            const targetDamage = rawdamage.map((dmg) => (Math.random() < hitChance) ? Math.round(dmg * (1 - target.def)) : 0);
            const targetDamageSum = targetDamage.reduce((sum, dmg) => (sum + dmg), 0);
            const targetDamageStr = targetDamage.reduce((str, dmg, i, arr) => {
              str += dmg;
              if ((i + 2) == arr.length) str += " and ";
              else if ((i + 2) < arr.length) str += ', ';
              return str;
            }, '');
            this.combatLog.push(`${this.activeUnit.name} attacks ${target.name} ${counts[rawdamage.length]} with ${ability.name}, does ${targetDamageStr} damage`);
            target.hp = Math.max(0, target.hp - targetDamageSum);
            if (target.hp <= 0) {
              this.combatLog.push(`${target.name} dies`);
            }
          }
          if (healing.length > 0) {
            const targetHealSum = healing.reduce((sum, heal) => (sum + heal), 0);
            const targetHealStr = healing.reduce((str, heal, i, arr) => {
              str += heal;
              if ((i + 2) == arr.length) str += " and ";
              else if ((i + 2) < arr.length) str += ', ';
              return str;
            }, '');
            this.combatLog.push(`${this.activeUnit.name} heals ${target.name} ${counts[rawdamage.length]} with ${ability.name}, heals ${targetHealStr} damage`);
            target.hp = Math.min(target.maxhp, target.hp + targetHealSum);
          }
        });

        // console.log({ unit: this.activeUnit, rawdamage, ability, targets })
        // Put the ability on cooldown
        ability.curcd = ability.cd;
      }
      // TODO: Check if someone is left alive on both sides

      // Then let the next person do stuff
      this.turnIndex++;
    }
  },
  watch: {
    activeUnit() {
      // If all units in party are dead
      if (this.partyUnits.every((u) => u.hp === 0)) {
        this.combatLog.push('Your party is dead, you lose');
        this.result = 'Defeat';
        if (this.callback) this.callback(false);
        return;
      } else if (this.enemyUnits.every((u) => u.hp === 0)) {
        this.combatLog.push('All enemies are dead, you win');
        this.result = 'Victory';
        if (this.callback) this.callback(true);
        return;
      }

      // If the current unit is dead, skip
      if (this.activeUnit.hp <= 0) {
        this.turnIndex++;
        return;
      }
      // If the current unit is playable, we dont need to do anything
      if (this.activeUnitPlayable) return;
      // Else, we need to come up with something to do, but do it after a short delay
      // Make the delay shorter if there are no playable units left
      const delay = this.allUnits.some((unit) => unit.isPlayable) ? 300 : 100;
      setTimeout(() => {
        const isPartyUnit = this.partyUnits.some((u) => u === this.activeUnit);
        const ability = this.activeUnit.abilities.find((a) => a.curcd === 0);
        const targets  = [];
        if (ability) {
          if (ability.target === 'choose-enemy') {
            if (isPartyUnit) {
              // Choose EnemyUnit with lowest HP > 0
              targets.push(this.enemyUnits.slice().sort((u1, u2) => u1.hp - u2.hp).find((u) => u.hp > 0));
            } else {
              // Choose PartyUnit with highest MaxHP
              targets.push(this.partyUnits.slice().sort((u1, u2) => u2.maxhp - u1.maxhp).find((u) => u.hp > 0));
            }
          } else if (ability.target === 'all-enemy') {
            if (isPartyUnit) targets.push(... this.enemyUnits);
            else targets.push(... this.partyUnits);
          } else if (ability.target === 'choose-friendly') {
            if (isPartyUnit) {
              // Choose PartyUnit with lowest HP% > 0
              targets.push(this.partyUnits.slice().sort((u1, u2) => (u1.hp / u1.maxhp) - (u2.hp / u2.maxhp)).find((u) => u.hp > 0));
            } else {
              // Choose EnemyUnit with lowest HP% > 0
              targets.push(this.enemyUnits.slice().sort((u1, u2) => (u1.hp / u1.maxhp) - (u2.hp / u2.maxhp)).find((u) => u.hp > 0));
            }
          } else if (ability.target === 'all-friendly') {
            if (!isPartyUnit) targets.push(... this.enemyUnits);
            else targets.push(... this.partyUnits);
          }
        }
        this.handleAction({ ability, targets: targets.filter((t) => t) });
      }, delay);
    }
  },
  mounted() {

  },
  components: {
    UnitFrame,
    CombatLog,
    DialogPanel,
    ActionPanel,
  }
}
</script>

<style lang="scss" scoped>
.unit-frames {
  display: flex;
}
.combat-screen-component {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 1000px;
  max-height: 600px;
}
.result {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 1000px;
  max-height: 600px;
  justify-content: center;
  align-items: center;
  font-size: 200px;
  font-family: serif;
}
.body {
  position: relative;
  flex: 1;
  border: solid #999 1px;
  border-radius: 5px;
  background-color: #222;
  margin: 10px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 110%;
  overflow: hidden;
}
</style>

<style lang="scss">
html, body, #app {
  padding: 0;
  margin: 0;
  width: 100vw;
  height: 100vh;
  background-color: #333;
  color: #FFF;
  font-family: Arial, Helvetica, sans-serif;
}
.combat-screen-component * {
  box-sizing: border-box;
}
</style>
