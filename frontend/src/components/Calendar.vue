<script setup lang="ts">

const { id } = defineProps<{
  id: string
}>();
const url = `webcal://${location.host}/get_ical?id=${id}`;

function openGoogle() {
  navigator.clipboard.writeText(url);
  window.open('https://calendar.google.com/calendar/u/0/r/settings/addbyurl', '_blank')!.focus();
}

function openSystem() {
  window.open(url, '_blank')!.focus();
}
</script>

<template>
  <div class="container" id="main-container">
    <h6>Clicca sul calendario che vuoi utilizzare e in un attimo hai finito</h6>
    <section class="d-flex flex-column flex-md-row justify-content-around mt-4" id="box">
      <!-- Google Calendar Box -->
      <div class="cal-guide-box mb-4 mb-md-0">
        <div class="cal-header">
          <img src="/media/google.png" alt="Google Calendar" class="cal-icon">
          <h3>Aggiungi a Google Calendar</h3>
        </div>
        <div class="cal-steps">
          <div class="step">
            <span class="step-number">1</span>
            <p>Clicca il pulsante qui sotto per aprire Google Calendar (Desktop)</p>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <p>Incolla il link in <kbd>URL del calendario</kbd></p>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <p>Clicca <kbd>Aggiungi calendario</kbd></p>
          </div>
          <div class="step">
            <span class="step-number">4</span>
            <p>Ora lo troverai in <kbd>Altri calendari</kbd> dove puoi cambiare il nome</p>
          </div>
          <div class="step">
            <span class="step-number">⚠️</span>
            <p>Potresti dover attendere qualche minuto prima che appaiano gli eventi</p>
          </div>
        </div>
        <a href="https://calendar.google.com/calendar/u/0/r/settings/addbyurl" @click.prevent="openGoogle()"
          class="cal-button google-button">
          <img src="/media/google.png" alt="Google" class="button-icon"> Copia URL e Apri Google Calendar
        </a>
      </div>

      <!-- Apple Calendar Box -->
      <div class="cal-guide-box">
        <div class="cal-header">
          <img src="/media/apple.png" alt="Apple Calendar" class="cal-icon">
          <h3>Aggiungi ad Apple Calendar</h3>
        </div>
        <div class="cal-steps">
          <div class="step">
            <span class="step-number">1</span>
            <p>Clicca il pulsante qui sotto per aprire l'app Calendario di Apple</p>
          </div>
          <div class="step">
            <span class="step-number">2</span>
            <p>Clicca <kbd>Iscriviti</kbd></p>
          </div>
          <div class="step">
            <span class="step-number">3</span>
            <p>Scegli un nome (e.g. Unibo Calendar) + conferma in alto a destra</p>
          </div>
          <div class="step">
            <span class="step-number">4</span>
            <p>Ora lo troverai tra i tuoi calendari <kbd>iCloud</kbd></p>
          </div>
          <div class="step">
            <span class="step-number">⚠️</span>
            <p>Potresti dover attendere qualche minuto prima che appaiano gli eventi</p>
          </div>
        </div>
        <a :href="url" @click.prevent="openSystem()" class="cal-button apple-button">
          <img src="/media/apple.png" alt="Apple" class="button-icon"> Apri Apple Calendar
        </a>
      </div>
    </section>
  </div>
</template>
<style lang="css" scoped>
img {
  width: 7rem;
  height: 7rem;
}

div.cal-link>p {
  font-weight: bold;
}

main {
  min-height: calc(100vh - 2em);
  padding: 2em 0;
}

.collapse:not(.show) {
  height: 0;
}

.collapse {
  transition: ease-in-out;
}

/* Override #box styling for link page only */
#box {
  background: none !important;
  box-shadow: none !important;
  padding: 0 !important;
}

/* New Calendar Guide Styles */
.cal-guide-box {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
  margin: 0 1rem;
}


.cal-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.cal-icon {
  width: 4rem !important;
  height: 4rem !important;
  margin-bottom: 1rem;
}

.cal-header h3 {
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.cal-steps {
  margin-bottom: 2rem;
}

.step {
  display: flex;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
  min-height: 3rem;
}

.step-with-button {
  align-items: center;
}

.step-number {
  background: #007bff;
  color: white;
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.step p {
  margin: 0;
  color: #555;
  line-height: 1.4;
}

.step kbd {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 3px;
  padding: 0.2rem 0.4rem;
  font-size: 0.8rem;
  color: #495057;
}

.cal-button {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px 20px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  width: 100%;
  gap: 8px;
}

.button-icon {
  width: 20px !important;
  height: 20px !important;
  margin: 0;
}

.google-button .button-icon {
  background: white;
  border-radius: 4px;
  padding: 2px;
}

.google-button {
  background: #4285f4;
  color: white;
}

.google-button:hover {
  background: #3367d6;
  color: white;
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(66, 133, 244, 0.3);
}

.apple-button {
  background: #000;
  color: white;
}

.apple-button:hover {
  background: #333;
  color: white;
  text-decoration: none;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Mobile buttons layout */
.mobile-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
}

.mobile-button {
  font-size: 0.9rem;
  padding: 10px 16px;
  width: 100%;
  max-width: 280px;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
  .cal-guide-box {
    background: #212529;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }

  .cal-header h3 {
    color: #e2e8f0;
  }

  .step p {
    color: #cbd5e0;
  }

  .step kbd {
    background: #4a5568;
    border: 1px solid #718096;
    color: #e2e8f0;
  }

  .step-number {
    background: #3182ce;
  }

  .google-button {
    background: #3182ce;
  }

  .google-button:hover {
    background: #2c5aa0;
    box-shadow: 0 4px 8px rgba(49, 130, 206, 0.4);
  }

  .apple-button {
    background: #4a5568;
  }

  .apple-button:hover {
    background: #718096;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cal-guide-box {
    margin: 0 0.5rem;
    padding: 1.5rem;
  }

  .cal-header h3 {
    font-size: 1.3rem;
  }

  .step {
    margin-bottom: 0.8rem;
  }

  .step-number {
    width: 1.8rem;
    height: 1.8rem;
    font-size: 0.8rem;
  }

  .mobile-buttons {
    gap: 0.5rem;
  }

  .mobile-button {
    font-size: 0.85rem;
    padding: 8px 12px;
  }
}
</style>