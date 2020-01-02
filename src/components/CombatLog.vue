<template>
    <div class="combatlog" ref="log">
        <p v-for="(entry, index) in entries" :key="index">{{ entry }}</p>
    </div>
</template>

<script>
export default {
    props: ['entries'],
    watch: {
        async entries() {
            await this.$nextTick();
            this.$refs.log.scrollTo(0, this.$refs.log.scrollHeight);
        }
    }
}
</script>

<style lang="scss" scoped>
.combatlog {
    padding: 10px;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: auto;

    &::-webkit-scrollbar-thumb {
      background: #FFF; 
    }
}
p {
    margin: 0;
    font-size: 12px;
    font-family: monospace;
    text-shadow: 2px 2px 0px #000;
}
</style>