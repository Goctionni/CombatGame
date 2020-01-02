<template>
  <div class="unit" :class="{ active }">
    <div class="unit-icon"></div>
    <div class="unit-info">
        <div class="unit-name">{{ unit.name }}</div>
        <div class="unit-hp">
            <div class="unit-hp-text">{{ unit.hp }} / {{ unit.maxhp }} HP</div>
            <StatBar :cur="unit.hp" :max="unit.maxhp"></StatBar>
        </div>
    </div>
  </div>
</template>

<script>
import StatBar from './StatBar';
export default {
  props: ["unit", "active"],
  components: {
      StatBar
  }
};
</script>

<style lang="scss" scoped>
.unit {
  display: flex;
  padding: 10px;
  min-width: 225px;
  padding-right: 30px;
  transition: all .4s ease-in-out;

  &.active {
      background-color: #EEE;
      color: #000;
  }
}

.unit-icon {
    width: 50px;
    height: 50px;
    border: solid #999 1px;
    border-radius: 50%;
    background-color: #222;
    margin-right: 10px;
}

.unit-info {
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
}
</style>
