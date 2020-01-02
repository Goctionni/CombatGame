<template>
    <div class="stat-bar">
        <div class="stat-bar-fill" :style="{ width: Math.floor(100 * cur / max ) + '%' }" ></div>
    </div>
</template>

<script>
export default {
  props: ['cur', 'max']
};
</script>

<style lang="scss" scoped>
.stat-bar {
    background-color: #FFF;
    padding: 2px;

    &.invert {
        background-color: #666;
    }
}
.stat-bar-fill {
  height: 3px;
  background-color: #666;
  transition: width .3s ease-in-out;

  .invert & {
      background-color: #FFF;
  }
}
</style>
