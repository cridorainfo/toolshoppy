(() => {
  'use strict';
  const root = document.querySelector('[data-desk]');
  if (!root) return;
  const ml = document.documentElement.lang === 'ml';
  const tasks = [...root.querySelectorAll('[data-task]')];
  const search = root.querySelector('#desk-search');
  let category = 'all';
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    tasks.forEach(task => {
      task.hidden = !(category === 'all' || task.dataset.category === category) || !`${task.textContent} ${task.dataset.tags}`.toLocaleLowerCase().includes(query);
      if (!task.hidden) count++;
    });
    root.querySelector('#desk-results').textContent = ml ? `${count} ജോലികൾ ലഭ്യമാണ്` : `${count} workflows available`;
  }
  root.querySelector('[data-enhanced]').hidden = false;
  search.addEventListener('input', filter);
  root.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    root.querySelectorAll('[data-filter]').forEach(b => { b.setAttribute('aria-pressed', String(b === button)); b.classList.toggle('active', b === button); });
    filter();
  }));
  const checks = [...root.querySelectorAll('[data-check]')];
  function progress() {
    const done = checks.filter(check => check.checked).length;
    root.querySelector('#desk-progress').textContent = ml ? `${checks.length} പരിശോധനകളിൽ ${done} പൂർത്തിയായി` : `${done} of ${checks.length} checks complete`;
  }
  checks.forEach(check => check.addEventListener('change', progress));
  root.querySelector('#desk-reset').addEventListener('click', () => { checks.forEach(check => { check.checked = false; }); progress(); });
  progress(); filter();
})();
