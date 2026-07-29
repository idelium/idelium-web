<template>
  <span class="id-tooltip">
    <slot :described-by="tooltipId"></slot>
    <span :id="tooltipId" class="id-tooltip__content" role="tooltip">
      {{ text }}
    </span>
  </span>
</template>

<script>
let tooltipSequence = 0;

export default {
  name: "IdTooltip",
  props: {
    text: {
      type: String,
      required: true,
    },
  },
  data() {
    tooltipSequence += 1;
    return {
      tooltipId: `id-tooltip-${tooltipSequence}`,
    };
  },
};
</script>
