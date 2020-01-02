<template>
    <div class="targets">
        <button v-for="(target, index) in targets" :key="index" :disabled="target.hp <= 0" @click="chooseTarget(target)" class="target">
            {{ target.name }}
            <StatBar :cur="target.hp" :max="target.maxhp" class="invert"></StatBar>
        </button>
        <button class="target back" @click="back()">Back</button>
    </div>
</template>

<script>
import StatBar from './StatBar';
export default {
    props: ['targets'],
    methods: {
        back() {
            this.$emit('back');
        },
        chooseTarget(target) {
            this.$emit('target', target);
        }
    },
    components: {
        StatBar,
    }
}
</script>

<style lang="scss" scoped>
    .targets {
        display:flex;
        flex-direction: column;
        justify-content: center;
        align-items: stretch;
        color: #000;
    }

    .target {
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

        &[disabled] {
            pointer-events: none;
            opacity: .5;

            .cooldown {
                color: #F00;
                font-weight: bold;
                opacity: 1;
            }
        }

        &.back {
            background-color: #666;
            color: #FFF;
            padding-bottom: 17px;
        }
    }

    .target + .target {
        margin-top: 20px;
    }
</style>