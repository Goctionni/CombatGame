<template>
    <div class="combatlog">
        <p v-for="(entry, index) in entries" :key="index">{{ entry }}</p>
    </div>
</template>

<script>
export default {
    props: ['entries']
}
</script>

<style lang="scss" scoped>
.combatlog {
    padding: 10px;
    display: flex;
    flex-direction: column-reverse;
    max-width: 50%;
}
p {
    margin: 0;
    font-size: 12px;
    font-family: monospace;
    text-shadow: 2px 2px 0px #000;
}
</style>