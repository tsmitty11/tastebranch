(() => {
  const form = document.querySelector('.subscribe-form');
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById('subscribe-note');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (button.disabled || !form.reportValidity()) return;
    button.disabled = true;
    button.textContent = 'Saving…';
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Saving your email…';
    status.dataset.state = '';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.message || 'Please try again later.');
      status.textContent = result.message;
      status.dataset.state = 'success';
      form.reset();
    } catch (error) {
      status.textContent = error.name === 'TimeoutError' ? 'The request timed out. Please try again.' : 'We couldn’t save your email. Please try again later.';
      status.dataset.state = 'error';
    } finally {
      button.disabled = false;
      button.textContent = 'Subscribe';
      form.removeAttribute('aria-busy');
    }
  });
})();
