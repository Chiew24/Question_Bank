(() => {
  'use strict';
  const STORE = 'sam_edugpt_student_v1';
  const seed = [
    {id:'F4-1-001',chapter:'Chapter 1 Functions',difficulty:'Easy',source:'SPM',year:2024,marks:4,question:'Given f(x)=2x+3, find f(5).',answer:'13',solution:'Substitute x=5.\n\nf(5)=2(5)+3=13.'},
    {id:'F4-1-002',chapter:'Chapter 1 Functions',difficulty:'Medium',source:'SPM',year:2025,marks:6,question:'Given f(x)=2x+1 and g(x)=x², find (g ∘ f)(2).',answer:'25',solution:'First find f(2)=5. Then g(5)=25.'},
    {id:'F4-1-003',chapter:'Chapter 1 Functions',difficulty:'Hard',source:'Trial',year:2025,marks:8,question:'Find the inverse of f(x)=3x−4.',answer:'f⁻¹(x)=(x+4)/3',solution:'Let y=3x−4. Swap x and y, then solve for y.'},
    {id:'F4-2-001',chapter:'Chapter 2 Quadratic Functions',difficulty:'Medium',source:'SPM',year:2023,marks:5,question:'Solve x²−5x+6=0.',answer:'x=2 or x=3',solution:'Factorise: (x−2)(x−3)=0.'}
  ];
  let db = JSON.parse(localStorage.getItem(STORE) || 'null') || {favorites:[]};
  const $ = id => document.getElementById(id);
  const save = () => localStorage.setItem(STORE, JSON.stringify(db));
  const show = id => { document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden')); $(id+'View')?.classList.remove('hidden'); };

  function renderQuestions(list = seed) {
    const box = $('questionList'); if (!box) return;
    box.innerHTML = list.map(q => `<article class="student-question-card"><div class="question-meta"><span>${q.id}</span><span>${q.difficulty}</span><span>${q.source} ${q.year}</span><span>${q.marks} marks</span></div><h3>${q.chapter}</h3><p>${escapeHtml(q.question)}</p><button class="primary-action" data-question="${q.id}">Open question</button></article>`).join('');
    box.querySelectorAll('[data-question]').forEach(b => b.addEventListener('click', () => openQuestion(b.dataset.question)));
  }
  function renderFavorites(){
    const list = seed.filter(q => db.favorites.includes(q.id));
    const box = $('favoritesList'); if (!box) return;
    box.innerHTML = list.length ? list.map(q => `<article class="student-question-card"><div class="question-meta"><span>${q.id}</span><span>${q.difficulty}</span></div><h3>${q.chapter}</h3><p>${escapeHtml(q.question)}</p><button class="primary-action" data-question="${q.id}">Open question</button></article>`).join('') : '<div class="student-question-card"><h3>No saved questions</h3><p>Questions you save will appear here.</p></div>';
    box.querySelectorAll('[data-question]').forEach(b => b.addEventListener('click', () => openQuestion(b.dataset.question)));
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  let activeQuestion = null;
  function openQuestion(id){
    activeQuestion = seed.find(q=>q.id===id); if(!activeQuestion)return;
    $('modalTitle').textContent = activeQuestion.id;
    $('questionDetail').innerHTML = `<div class="detail-section"><div class="detail-label">QUESTION</div><div>${escapeHtml(activeQuestion.question)}</div></div><div class="detail-section"><div class="detail-label">ANSWER</div><div>${escapeHtml(activeQuestion.answer)}</div></div><div class="detail-section"><div class="detail-label">SOLUTION</div><pre>${escapeHtml(activeQuestion.solution)}</pre></div>`;
    $('favoriteDetailBtn').textContent = db.favorites.includes(id) ? '★ Saved' : '☆ Favorite';
    $('questionModal').classList.remove('hidden');
  }
  document.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if(nav){ show(nav.dataset.nav === 'questions' ? 'questions' : nav.dataset.nav === 'favorites' ? 'favorites' : 'dashboard'); if(nav.dataset.nav==='questions')renderQuestions(); if(nav.dataset.nav==='favorites')renderFavorites(); }
    const close = e.target.closest('[data-close]'); if(close) $(close.dataset.close)?.classList.add('hidden');
  });
  $('randomBtn')?.addEventListener('click', () => openQuestion(seed[Math.floor(Math.random()*seed.length)].id));
  $('favoriteDetailBtn')?.addEventListener('click', () => { if(!activeQuestion)return; const i=db.favorites.indexOf(activeQuestion.id); if(i<0)db.favorites.push(activeQuestion.id);else db.favorites.splice(i,1); save(); $('favoriteDetailBtn').textContent=db.favorites.includes(activeQuestion.id)?'★ Saved':'☆ Favorite'; renderFavorites(); });
  $('accountBtn')?.addEventListener('click',()=> $('accountModal')?.classList.remove('hidden'));
  $('logoutBtn')?.addEventListener('click',()=> $('accountModal')?.classList.add('hidden'));
  $('menuBtn')?.addEventListener('click',()=>document.querySelector('.sidebar')?.classList.toggle('open'));
  $('themeBtn')?.addEventListener('click',()=>document.body.classList.toggle('dark'));
  renderQuestions();
})();