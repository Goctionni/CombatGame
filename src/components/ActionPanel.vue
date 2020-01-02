<template>
    <div class="action-panel">
        <div class="backdrop"></div>
        <div class="panel">
            <button v-for="ability in unit.abilities" :key="ability.name" :disabled="ability.curcd > 0" @click="sendAction(ability)">
                {{ ability.name }}
                <span class="cooldown">Cooldown: {{ ability.curcd }}/{{ ability.cd }} turns</span>
            </button>
            <button @click="sendAction(null)">
                Do nothing
                <span class="cooldown">Wait 1 turn</span>
            </button>
        </div>
    </div>
</template>

<script>
export default {
    props: ['unit', 'friendlyUnits', 'unfriendlyUnits'],
    methods: {
        sendAction(ability) {
            const targets = [];
            if (ability) {
                if (ability.target === 'choose-enemy') { // unfriendly unit with lowest HP > 0
                    targets.push(this.unfriendlyUnits.slice().sort((u1, u2) => u1.hp - u2.hp).find((u) => u.hp > 0));
                } else if (ability.target === 'all-enemy') { // All enemy units
                    targets.push(... this.unfriendlyUnits);
                } else if (ability.target === 'choose-friendly') { // friendly unit with lowest HP > 0
                    targets.push(this.friendlyUnits.slice().sort((u1, u2) => (u1.hp / u1.maxhp) - (u2.hp / u2.maxhp)).find((u) => u.hp > 0));
                } else if (ability.target === 'all-friendly') { // All friendly units
                    targets.push(... this.friendlyUnits);
                }
            }
            
            this.$emit('action', { ability , targets });
        }
    },
}
</script>

<style lang="scss" scoped>
    .action-panel {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .backdrop {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background-color: rgba(0, 0, 0, .5);
    }
    .panel {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        padding: 50px;
        background-color: #e2e1e0;
        box-shadow: 0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22);
        height: 100%;
        overflow-y: auto;

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