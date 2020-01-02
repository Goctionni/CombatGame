<template>
    <div class="action-panel">
        <TargetPanel v-if="targetOptions" :targets="targetOptions" @target="setTarget($event)" @back="clearAbility()"></TargetPanel>
        <template v-else>
            <button v-for="ability in unit.abilities" :key="ability.name" :disabled="ability.curcd > 0" @click="selectAction(ability)">
                {{ ability.name }}
                <span class="cooldown">Cooldown: {{ ability.curcd }}/{{ ability.cd }} turns</span>
            </button>
            <button @click="selectAction(null)">
                Do nothing
                <span class="cooldown">Wait 1 turn</span>
            </button>
        </template>
    </div>
</template>

<script>
import TargetPanel from './TargetPanel';

export default {
    props: ['unit', 'friendlyUnits', 'unfriendlyUnits'],
    data() {
        return {
            ability: null,
        };
    },
    computed: {
        targetOptions() {
            if (this.ability) {
                if (this.ability.target === 'choose-enemy') {
                    return this.unfriendlyUnits;
                } else if (this.ability.target === 'choose-friendly') {
                    return this.friendlyUnits;
                } else if (this.ability.target === 'dead-enemy') {
                    return this.unfriendlyUnits.filter((u) => u.hp === 0);
                } else if (this.ability.target === 'dead-friendly') {
                    return this.friendlyUnits.filter((u) => u.hp === 0);
                }
            }
            return null;
        }
    },
    methods: {
        clearAbility() {
            this.ability = null;
        },
        setTarget(target) {
            this.$emit('action', { ability: this.ability, targets: [target ]});
        },
        selectAction(ability) {
            if (ability === null) {
                return this.$emit('action', { ability, targets: [] });
            }

            if (ability.target === 'self') {
                return this.$emit('action', { ability, targets: [ this.unit ] });
            }
            if (ability.target === 'random-friendly') {
                return this.$emit('action', { ability, targets: [ this.friendlyUnits.slice().sort(() => (Math.random() - .5) * 2).pop() ]});
            }
            if (ability.target === 'random-enemy') {
                return this.$emit('action', { ability, targets: [ this.unfriendlyUnits.slice().sort(() => (Math.random() - .5) * 2).pop() ]});
            }
            if (ability.target === 'all-friendly') {
                return this.$emit('action', { ability, targets: this.friendlyUnits.slice() });
            }
            if (ability.target === 'all-enemy') {
                return this.$emit('action', { ability, targets: this.unfriendlyUnits.slice() });
            }
            if (['choose-friendly', 'choose-enemy', 'dead-friendly', 'dead-enemy'].includes(ability.target)) {
                this.ability = ability;
                return;
            }
        }
    },
    components: {
        TargetPanel,
    },
}
</script>

<style lang="scss" scoped>
    .action-panel {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 50px;
        background-color: #e2e1e0;
        box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
        width: 300px;
        height: 100%;
        overflow-y: auto;
        pointer-events: auto;

        button {
            background-color: #FFF;
            padding: 10px 20px;
            text-align: left;
            font-size: 20px;
            border: 0;
            outline: 0;
            border-radius: 2px;
            cursor: pointer;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
            transition: all 0.5s cubic-bezier(.25,.8,.25,1);

            &:hover {
                box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23);
            }

            &:active {
                box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
                color: #090;
            }

            .cooldown {
                display: block;
                font-size: 12px;
                opacity: .5;
            }

            &[disabled] {
                pointer-events: none;
                opacity: .5;

                .cooldown {
                    color: #F00;
                    font-weight: bold;
                    opacity: 1;
                }
            }
        }

        button + button {
            margin-top: 20px;
        }
    }
</style>