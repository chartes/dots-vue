<template>
  <div class="icon-wrapper" :style="cssVars">
    <svg class="icon" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">

      <!-- État NONE : deux flèches -->
      <template v-if="state === 'none'">
        <!-- FLÈCHE BAS (gauche) -->
        <g stroke="currentColor" stroke-width="6" stroke-linecap="square">
          <line x1="38" y1="44" x2="38" y2="78"/>
          <line x1="22" y1="72" x2="38" y2="84"/>
          <line x1="38" y1="84" x2="54" y2="72"/>
        </g>
        <!-- FLÈCHE HAUT (droite) -->
        <g stroke="currentColor" stroke-width="6" stroke-linecap="square">
          <line x1="90" y1="84" x2="90" y2="50"/>
          <line x1="74" y1="56" x2="90" y2="44"/>
          <line x1="90" y1="44" x2="106" y2="56"/>
        </g>
      </template>

      <!-- État ASCENDING : flèche descendante + Z -->
      <template v-else-if="state === 'asc'">
        <!-- FLÈCHE BAS (gauche) -->
        <g stroke="currentColor" stroke-width="6" stroke-linecap="square">
          <line x1="38" y1="44" x2="38" y2="78"/>
          <line x1="22" y1="72" x2="38" y2="84"/>
          <line x1="38" y1="84" x2="54" y2="72"/>
        </g>
        <!-- LETTRE Z -->
        <text x="90" y="64" class="letter">Z</text>
      </template>

      <!-- État DESCENDING : flèche montante + A -->
      <template v-else-if="state === 'desc'">
        <!-- FLÈCHE HAUT (gauche) -->
        <g stroke="currentColor" stroke-width="6" stroke-linecap="square">
          <line x1="38" y1="84" x2="38" y2="50"/>
          <line x1="22" y1="56" x2="38" y2="44"/>
          <line x1="38" y1="44" x2="54" y2="56"/>
        </g>
        <!-- LETTRE A -->
        <text x="90" y="64" class="letter">A</text>
      </template>

    </svg>
  </div>
</template>

<script setup>
const props = defineProps({
  state: { type: String, default: 'none' }, // 'asc' | 'desc' | 'none'
  type: { type: String, default: 'string' },
  bgColor: { type: String, default: 'var(--fill-color)' },
  fgColor: { type: String, default: 'var(--text-color)' },
  size: { type: Number, default: 32 },
  radius: { type: Number, default: 4 }
})

const cssVars = {
  '--bg': props.bgColor,
  '--fg': props.fgColor,
  '--size': `${props.size}px`,
  '--radius': `${props.radius}px`
}
</script>

<style scoped>
.icon-wrapper {
  width: var(--size);
  height: var(--size);
  border-radius: var(--radius);
  background-color: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 100%;
  height: 100%;
  color: var(--fg);
}

.letter {
  fill: var(--fg);
  font-size: 28px; /* Ajuste pour rester proportionnel aux flèches */
  font-weight: bold;
  font-family: "Barlow Semi Condensed", sans-serif;
  text-anchor: middle;
  dominant-baseline: middle;
}
</style>