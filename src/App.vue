<template>
  <div class="combat-screen-component" v-if="!result">
    <div class="enemies unit-frames">
      <UnitFrame v-for="(enemyUnit, index) in enemyUnits" :key="index" :unit="enemyUnit" :active="activeUnit === enemyUnit"></UnitFrame>
    </div>
    <div class="body" :style="{ 'background-image': `url(${background})` }">
      <transition name="slideIn">
        <div class="actionpanel" v-if="!turnComplete && activeUnitPlayable && activeUnit.hp > 0">
          <ActionPanel
            :unit="activeUnit"
            :friendlyUnits="friendlyUnits"
            :unfriendlyUnits="unfriendlyUnits"
            @action="handleAction($event)"
          ></ActionPanel>
        </div>
      </transition>
      <CombatLog
        class="combatlog"
        :entries="combatLog"
      ></CombatLog>
      <transition name="fadeIn">
        <div class="progress-controls" v-if="turnComplete">
          <button type="button" class="continue" title="Continue" @click="nextTurn()"></button>
          <button type="button" class="skip" title="skip" @click="enableSkipTurns()"></button>
        </div>
      </transition>
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
      turnComplete: false,
      skipTurns: false,
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
  watch: {
    activeUnit() {
      // If all units in party are dead
      if (this.endGameCheck()) return;

      // If the current unit is dead, skip
      if (this.activeUnit.hp <= 0) {
        this.turnIndex++;
        return;
      }

      // Turn is not complete, unit can perform action
      this.turnComplete = false;

      // If the current unit is playable, we dont need to do anything
      if (this.activeUnitPlayable) {
        this.skipTurns = false;
        return;
      }

      // Else, perform an NPC action, but do it after a short delay to emulate short thinking time
      setTimeout(this.performNPCAction.bind(this), 250);
    },
    turnComplete() {
      if (this.turnComplete && this.skipTurns) this.nextTurn();
    }
  },  
  methods: {
    endGameCheck() {
      if (this.partyUnits.every((u) => u.hp === 0)) {
        this.combatLog.push('Your party is dead, you lose');
        this.result = 'Defeat';
        if (this.callback) this.callback(false);
        return true;
      } else if (this.enemyUnits.every((u) => u.hp === 0)) {
        this.combatLog.push('All enemies are dead, you win');
        this.result = 'Victory';
        if (this.callback) this.callback(true);
        return true;
      }
    },
    nextTurn() {
      if (!this.turnComplete) return;
      this.turnIndex++;
    },
    enableSkipTurns() {
      if (!this.turnComplete) return;
      this.skipTurns = true;
      this.nextTurn();
    },
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

        // Put the ability on cooldown
        ability.curcd = ability.cd;
      }

      // Then let the next person do stuff
      this.turnComplete = true;
    },
    performNPCAction() {
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
  display: flex;
  flex-direction: row-reverse;
}
.combatlog {
  flex: 1;
}
.actionpanel {
  height: 100%;
  width: 300px;
  overflow: hidden;
  z-index: 2;
}
.progress-controls {
  position: absolute;
  bottom: 10px;
  right: 0;
  width: 120px;
  z-index: 1;
  white-space: nowrap;
  overflow: hidden;

  button + button {
    margin-left: 0;
  }

  button {
    position: relative;
    background-color: #FFF;
    border: 0;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    margin: 10px;
    cursor: pointer;
    outline: 0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
    }

    &:active {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }

    &::before, &::after {
      content: '';
      position: absolute;
      display: block;
      width: 0; 
      height: 0; 
      border-top: 8px solid transparent;
      border-bottom: 8px solid transparent;
      border-left: 10px solid #000;
      top: 12px;
      left: 16px;
    }

    &.skip {
      background-color: #FEE;

      &::before {
        margin-left: -5px;
        border-left-color: #300;
      }
      &::after {
        margin-left: 5px;
        border-left-color: #300;
      }
    }
  }
}

.slideIn-enter-active, .slideIn-leave-active {
  transition: width .5s ease-in-out;
}
.slideIn-enter, .slideIn-leave-to {
  width: 0px;
}

.fadeIn-enter-active, .fadeIn-leave-active {
  transition: opacity .5s ease-in-out;
}
.fadeIn-enter, .fadeIn-leave-to {
  opacity: 0;
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

  &::-webkit-scrollbar {
    width: 5px;
    height: 8px;
    background-color: transparent;
  }
  &::-webkit-scrollbar-thumb {
      background: #000; 
  }
}
</style>
