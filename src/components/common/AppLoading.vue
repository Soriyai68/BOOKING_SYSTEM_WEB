<template>
  <div class="loader-container">
    <div class="bar">
      <div class="ball"></div>
    </div>
  </div>
</template>

<style scoped>
/* Center container */
.loader-container {
  height: 100vh; /* full viewport height */
  width: 100vw;  /* full viewport width */
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* Bar styling */
.bar {
  width: 200px;
  height: 12.5px;
  background: #FFDAAF;
  border-radius: 30px;
  transform: rotate(-15deg);
  animation: up-down6123 3s ease-in-out 1s infinite alternate;
  position: relative; /* for ball positioning */
  display: flex;
  align-items: center;
}

/* Ball styling */
.ball {
  position: absolute;
  bottom: 20px; /* distance above the bar */
  left: 50%; /* start at center */
  width: 50px;
  height: 50px;
  background: #fff;
  border-radius: 50%;
  transform: translateX(-50%);
  animation: ball-move8234 3s ease-in-out 1s infinite alternate;
}

.ball::after {
  position: absolute;
  content: '';
  top: 25px;
  right: 5px;
  width: 5px;
  height: 5px;
  background: #000;
  border-radius: 50%;
}

/* Animations */
@keyframes up-down6123 {
  from { transform: rotate(-15deg); }
  to { transform: rotate(15deg); }
}

@keyframes ball-move8234 {
  from { left: 100%; transform: translateX(-50%) rotate(360deg); }
  to { left: 0%; transform: translateX(-50%) rotate(0deg); }
}
</style>
