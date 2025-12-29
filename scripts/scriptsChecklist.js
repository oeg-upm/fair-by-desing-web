
// === Checklist interactivo SIN persistencia ===
document.addEventListener('DOMContentLoaded', initChecklist);

function initChecklist() {
  const progressBar  = document.getElementById('checklistProgressBar');
  const progressText = document.getElementById('checklistProgressText');
  const btnMarkAll   = document.getElementById('btnChecklistMarkAll');
  const btnReset     = document.getElementById('btnChecklistReset');

  // Evita enganchar listeners dos veces si vuelves a llamar initChecklist()
  const toggles = Array.from(document.querySelectorAll('.checklist-toggle'))
    .filter(t => !t.dataset.initialized);

  // Inicializa UI (usa el estado actual del DOM; por defecto los checkboxes están desmarcados)
  toggles.forEach((input) => {
    input.dataset.initialized = 'true';
    const stepEl = input.closest('.step-box');
    applyStepUI(stepEl, input.checked);

    // Listener de cambio por paso
    input.addEventListener('change', (e) => {
      const el = e.target.closest('.step-box');
      applyStepUI(el, e.target.checked);
      updateProgress();
    });
  });

  // Acciones globales (solo afectan a la sesión actual)
  if (btnMarkAll && !btnMarkAll.dataset.initialized) {
    btnMarkAll.dataset.initialized = 'true';
    btnMarkAll.addEventListener('click', () => {
      document.querySelectorAll('.checklist-toggle').forEach(input => {
        input.checked = true;
        applyStepUI(input.closest('.step-box'), true);
      });
      updateProgress();
    });
  }

  if (btnReset && !btnReset.dataset.initialized) {
    btnReset.dataset.initialized = 'true';
    btnReset.addEventListener('click', () => {
      document.querySelectorAll('.checklist-toggle').forEach(input => {
        input.checked = false;
        applyStepUI(input.closest('.step-box'), false);
      });
      updateProgress();
    });
  }

  // Calcula progreso inicial
  updateProgress();

  // --- Helpers ---
  function applyStepUI(stepEl, completed) {
    if (!stepEl) return;
    const pill = stepEl.querySelector('.step-pill');

    if (pill) {
      if (completed) {
        pill.classList.add('bg-success', 'text-white');
        pill.classList.remove('bg-light', 'text-dark', 'border');
        pill.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Completed';
      } else {
        pill.classList.remove('bg-success', 'text-white');
        pill.classList.add('bg-light', 'text-dark', 'border');
        pill.textContent = 'Checklist';
      }
    }

    // (Opcional) resaltar el borde del paso
    stepEl.classList.toggle('border-success', completed);
  }

  function updateProgress() {
    const all = Array.from(document.querySelectorAll('.checklist-toggle'));
    const total = all.length;
    const done  = all.filter(t => t.checked).length;
    const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

    if (progressBar) {
      progressBar.style.width = pct + '%';
      progressBar.setAttribute('aria-valuenow', String(pct));
    }
    if (progressText) {
      progressText.textContent = `${pct}% completado`;
    }
  }
}
