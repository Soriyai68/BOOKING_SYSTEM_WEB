<template>
  <div class="loader-container">
    <!-- Spotlight effect -->
    <div class="spotlight"></div>
    
    <div class="content-wrapper">
      <!-- Main logo -->
      <div class="logo-section">
        <img src="/assets/rsb-cinema.png" alt="RSB Cinema" class="cinema-logo" />
      </div>
      
      <!-- Film reel animation -->
      <div class="film-reel-container">
        <div class="film-reel">
          <div class="reel-hole"></div>
          <div class="reel-hole"></div>
          <div class="reel-hole"></div>
          <div class="reel-hole"></div>
          <div class="reel-hole"></div>
          <div class="reel-hole"></div>
        </div>
        <div class="film-strip-moving">
          <div class="film-frame"></div>
          <div class="film-frame"></div>
          <div class="film-frame"></div>
          <div class="film-frame"></div>
        </div>
      </div>
      
      <!-- Loading text -->
      <div class="loading-text">
        <span class="dot">.</span>
        <span class="dot">.</span>
        <span class="dot">.</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loader-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(ellipse at center, #1a1a1a 0%, #000 70%);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  overflow: hidden;
}

/* Spotlight effect */
.spotlight {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(197, 161, 104, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-light 3s ease-in-out infinite;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
  z-index: 1;
}

/* Logo section */
.logo-section {
  position: relative;
}

.cinema-logo {
  width: 300px;
  height: auto;
  animation: logo-entrance 1.5s ease-out;
  filter: drop-shadow(0 10px 40px rgba(197, 161, 104, 0.5));
}

/* Film reel container */
.film-reel-container {
  position: relative;
  width: 200px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Rotating film reel */
.film-reel {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #c5a168 0%, #d4af6a 50%, #c5a168 100%);
  border-radius: 50%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  padding: 15px;
  box-shadow: 
    0 0 20px rgba(197, 161, 104, 0.4),
    inset 0 0 20px rgba(0, 0, 0, 0.3);
  animation: reel-spin 2s linear infinite;
}

.film-reel::before {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  background: #000;
  border-radius: 50%;
  box-shadow: inset 0 0 10px rgba(197, 161, 104, 0.5);
}

.reel-hole {
  width: 8px;
  height: 8px;
  background: #000;
  border-radius: 50%;
  margin: 3px;
  box-shadow: inset 0 0 3px rgba(0, 0, 0, 0.8);
}

/* Moving film strip */
.film-strip-moving {
  position: absolute;
  left: 0;
  display: flex;
  gap: 10px;
  animation: strip-move 2s linear infinite;
}

.film-frame {
  width: 40px;
  height: 30px;
  background: rgba(197, 161, 104, 0.3);
  border: 2px solid #c5a168;
  border-radius: 2px;
  position: relative;
}

.film-frame::before,
.film-frame::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: #c5a168;
  border-radius: 50%;
}

.film-frame::before {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.film-frame::after {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
}

/* Loading text */
.loading-text {
  display: flex;
  gap: 8px;
  font-size: 40px;
  color: #c5a168;
  letter-spacing: 4px;
}

.dot {
  animation: dot-bounce 1.4s ease-in-out infinite;
}

.dot:nth-child(1) {
  animation-delay: 0s;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

/* Animations */
@keyframes logo-entrance {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(-50px);
  }
  60% {
    transform: scale(1.05) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes pulse-light {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
}

@keyframes reel-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes strip-move {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-60px);
  }
}

@keyframes dot-bounce {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 1;
  }
  30% {
    transform: translateY(-15px);
    opacity: 0.7;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .cinema-logo {
    width: 220px;
  }
  
  .film-reel-container {
    width: 150px;
    height: 60px;
  }
  
  .film-reel {
    width: 60px;
    height: 60px;
  }
}
</style>
