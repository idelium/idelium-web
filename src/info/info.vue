<template>
  <div class="bodyIdelium">
    <div>
      <div class="card" style="max-width: 20rem">
        <img src="@/assets/idelium.png" class="card-img-top" alt="idelium" />
        <div class="card-body">
          <p class="card-text">
            In this moment idelium is not optimize for mobile, but only for desktop
          </p>
        </div>
        <button type="button" class="btn btn-primary" v-on:click="goIdelium()">
          For more info
        </button>
      </div>
    </div>
  </div>
</template>

<style>
.bodyIdelium {
  position: absolute;
  top: 0px;
  left: 0px;
  background-color: rgb(182, 173, 173);
  padding: 0;
  margin: 0;
  height: 100vh;
  width: 0vw;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  visibility: hidden;
}
@media only screen and (max-width: 600px) {
  .bodyIdelium {
    visibility: visible;
    width: 100vw;
  }
}
</style>
<script>
export default {
  methods: {
    goIdelium() {
      window.open('https://idelium.io', '_blank')
    }
  }
}
</script>
