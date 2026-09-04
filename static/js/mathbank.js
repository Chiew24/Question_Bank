(() => {
  'use strict';
  const STORE = 'math_question_bank_v1';
  const SESSION = 'math_question_bank_session_v1';
  const $ = id => document.getElementById(id);
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state = { view:'dashboard', authMode:'login', editingId:null };
  const seed = [
    {id:'F4-1-001',chapter:'Chapter 1 Functions',difficulty:'Easy',source:'SPM',year:2024,tags:['functions'],marks:4,question:'Given f(x)=2x+3, find f(5).',answer:'13',solution:'Substitute x=5.\\n\\nf(5)=2(5)+3=13.',visibility:'Public',status:'Active'},
    {id:'F4-1-002',chapter:'Chapter 1 Functions',difficulty:'Medium',source:'SPM',year:2025,tags:['composite functions'],marks:6,question:'Given f(x)=2x+1 and g(x)=x^2, find (g\\circ f)(2).',answer:'25',solution:'First find f(2)=5. Then apply g: g(5)=25. Therefore (g\\circ f)(2)=25.',visibility:'Public',status:'Active'},
    {id:'F4-1-003',chapter:'Chapter 1 Functions',difficulty:'Hard',source:'Trial',year:2025,tags:['inverse functions'],marks:8,question:'Find the inverse of f(x)=3x-4.',answer:'f^{-1}(x)=(x+4)/3',solution:'Let y=3x-4. Swap x and y: x=3y-4. Hence 3y=x+4, so y=(x+4)/3.',visibility:'Public',status:'Active'},
    {id:'F4-2-001',chapter:'Chapter 2 Quadratic Functions',difficulty:'Medium',source:'SPM',year:2023,tags:['quadratic'],marks:5,question:'Solve x^2-5x+6=0.',answer:'x=2 or x=3',solution:'Factor: (x-2)(x-3)=0. Therefore x=2 or x=3.',visibility:'Public',status:'Active'}
  ];
  const defaultState = () => ({questions:seed.map(q=>({...q})), users:[{email:'admin@mathbank.local',password:'admin123',role:'admin',name:'Admin'}], favorites:{}});
  const load = () => { try { const x=JSON.parse(localStorage.getItem(STORE)||'null'); return x&&x.questions&&x.users?x:defaultState(); } catch { return defaultState(); } };
  let db = load();
  const save = () => localStorage.setItem(STORE, JSON.stringify(db));
  const currentUser = () => { try { const email=localStorage.getItem(SESSION); return db.users.find(u=>u.email===email)||null; } catch{return null;} };
  const isAdmin = () => currentUser()?.role === 'admin';
  const favSet = () => { const email=currentUser()?.email; if(!email)return new Set(); return new Set(db.favorites[email]||[]); };
  const toast = msg => { const el=$('toast'); el.textContent=msg; el.classList.add('show'); setTimeout(()=>el.classList.remove('show'),2200); };
  const renderMath = el => { if(window.renderMathInElement){ window.renderMathInElement(el,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false}); } };
  const formatText = text => escapeHtml(text).replace(/\\n/g,'<br>');

  function showView(view){
    state.view=view;
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    const u=currentUser();
    if(!u){ $('loginView').classList.remove('hidden'); return; }
    const id=view==='admin'&&!isAdmin()?'dashboardView':view+'View';
    ($(id)||$('dashboardView')).classList.remove('hidden');
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.nav===view));
    if(view==='dashboard') renderDashboard();
    if(view==='questions') renderQuestions();
    if(view==='favorites') renderFavorites();
    if(view==='admin') renderAdmin();
  }

  function setupAuth(){
    $('loginTab').onclick=()=>setAuthMode('login'); $('registerTab').onclick=()=>setAuthMode('register');
    $('authForm').onsubmit=e=>{e.preventDefault(); const email=$('authEmail').value.trim().toLowerCase(); const password=$('authPassword').value; const role=$('authRole').value; $('authError').textContent='';
      if(state.authMode==='login'){
        const u=db.users.find(x=>x.email===email&&x.password===password); if(!u){$('authError').textContent='Invalid email or password.';return;} localStorage.setItem(SESSION,u.email); refreshShell(); showView('dashboard');
      }else{
        if(db.users.some(x=>x.email===email)){ $('authError').textContent='An account with this email already exists.'; return; }
        if(password.length<6){$('authError').textContent='Password must be at least 6 characters.';return;}
        const u={email,password,role,name:email.split('@')[0]}; db.users.push(u); save(); localStorage.setItem(SESSION,email); refreshShell(); showView('dashboard'); toast('Account created.');
      }
    };
  }
  function setAuthMode(mode){ state.authMode=mode; $('loginTab').classList.toggle('active',mode==='login'); $('registerTab').classList.toggle('active',mode==='register'); $('roleWrap').classList.toggle('hidden',mode==='login'); $('authSubmit').textContent=mode==='login'?'Log in':'Create account'; $('authHint').textContent=mode==='login'?'Demo admin: admin@mathbank.local / admin123':'Student accounts can self-register.'; }
  function refreshShell(){ const u=currentUser(); $('accountName').textContent=u?u.name:'Guest'; $('logoutBtn').classList.toggle('hidden',!u); $('adminNav').classList.toggle('hidden',!isAdmin()); document.querySelectorAll('.admin-only').forEach(el=>el.classList.toggle('hidden',!isAdmin())); }

  function statCard(label,value){return `<div class="panel stat-card"><div class="stat-label">${escapeHtml(label)}</div><div class="stat-value">${escapeHtml(value)}</div></div>`;}
  function renderDashboard(){
    const qs=db.questions.filter(q=>q.status==='Active'&&(q.visibility==='Public'||isAdmin())); const fav=favSet();
    $('welcomeTitle').textContent=`Welcome, ${currentUser().name}`;
    $('statGrid').innerHTML=[statCard('Active questions',qs.length),statCard('Chapters',new Set(qs.map(q=>q.chapter)).size),statCard('Favorites',fav.size),statCard('Available marks',qs.reduce((a,q)=>a+Number(q.marks||0),0))].join('');
    $('recentList').innerHTML=qs.slice(-5).reverse().map(mini).join('')||'<p class="muted" style="padding:16px">No questions yet.</p>';
    $('favoriteList').innerHTML=qs.filter(q=>fav.has(q.id)).slice(0,5).map(mini).join('')||'<p class="muted" style="padding:16px">No favorites yet.</p>';
    renderMath($('dashboardView'));
  }
  const mini=q=>`<div class="mini-item" data-open="${escapeHtml(q.id)}"><div class="mini-main"><div class="mini-title">${escapeHtml(q.id)} — ${escapeHtml(q.question)}</div><div class="mini-meta">${escapeHtml(q.chapter)} · ${escapeHtml(q.difficulty)} · ${escapeHtml(q.source)} ${q.year||''}</div></div><span>›</span></div>`;

  function populateFilters(){
    const qs=db.questions; const chapters=[...new Set(qs.map(q=>q.chapter))].sort(); const sources=[...new Set(qs.map(q=>q.source))].sort();
    const curC=$('chapterFilter').value,curS=$('sourceFilter').value;
    $('chapterFilter').innerHTML='<option value="">All Chapters</option>'+chapters.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
    $('sourceFilter').innerHTML='<option value="">All Sources</option>'+sources.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
    $('chapterFilter').value=curC;$('sourceFilter').value=curS;
  }
  function renderQuestions(){
    populateFilters(); const term=$('searchInput').value.trim().toLowerCase(); const c=$('chapterFilter').value,d=$('difficultyFilter').value,s=$('sourceFilter').value,st=$('statusFilter').value; const fav=favSet();
    let qs=db.questions.filter(q=>(isAdmin()||q.visibility==='Public')&&(st==='all'||q.status.toLowerCase()===st));
    if(term) qs=qs.filter(q=>`${q.id} ${q.question} ${q.tags.join(' ')} ${q.source}`.toLowerCase().includes(term)); if(c)qs=qs.filter(q=>q.chapter===c);if(d)qs=qs.filter(q=>q.difficulty===d);if(s)qs=qs.filter(q=>q.source===s);
    $('questionList').innerHTML=qs.map(q=>card(q,fav.has(q.id))).join(''); $('emptyState').classList.toggle('hidden',qs.length>0); renderMath($('questionsView'));
  }
  function card(q,fav){ return `<article class="panel question-card"><div class="q-top"><div class="q-main"><div class="q-id">${escapeHtml(q.id)} <span class="chip accent">${escapeHtml(q.marks)} marks</span></div><div class="q-text">${formatText(q.question)}</div><div class="q-meta"><span class="chip">${escapeHtml(q.chapter)}</span><span class="chip">${escapeHtml(q.difficulty)}</span><span class="chip">${escapeHtml(q.source)}${q.year?' '+q.year:''}</span><span class="chip">${escapeHtml(q.status)}</span>${q.visibility==='Private'?'<span class="chip">Private</span>':''}${q.tags.map(t=>`<span class="chip">#${escapeHtml(t)}</span>`).join('')}</div></div><div class="q-actions"><button title="Open" data-view="${escapeHtml(q.id)}">View</button><button class="${fav?'favorite-on':''}" title="Favorite" data-fav="${escapeHtml(q.id)}">★</button>${isAdmin()?`<button title="Edit" data-edit="${escapeHtml(q.id)}">Edit</button><button title="Delete" data-del="${escapeHtml(q.id)}">Delete</button>`:''}</div></div></article>`; }

  function openQuestion(id){ const q=db.questions.find(x=>x.id===id); if(!q)return; state.editingId=id; $('modalEyebrow').textContent=q.chapter; $('modalTitle').textContent=q.id; $('questionDetail').classList.remove('hidden'); $('questionForm').classList.add('hidden'); $('studentActions').classList.remove('hidden');
    $('questionDetail').innerHTML=`<div class="detail-section"><div class="detail-label">QUESTION</div><div class="detail-content">${formatText(q.question)}</div></div><div class="detail-section"><div class="detail-label">ANSWER</div><div class="detail-content"><pre>${escapeHtml(q.answer)}</pre></div></div><div class="detail-section"><div class="detail-label">FULL SOLUTION / WORKING</div><div class="detail-content"><pre>${escapeHtml(q.solution)}</pre></div></div><div class="q-meta"><span class="chip">${escapeHtml(q.difficulty)}</span><span class="chip">${escapeHtml(q.marks)} marks</span><span class="chip">${escapeHtml(q.source)} ${q.year||''}</span></div>`;
    $('favoriteDetailBtn').textContent=favSet().has(id)?'★ Unfavorite':'☆ Favorite'; $('favoriteDetailBtn').onclick=()=>toggleFavorite(id); $('closeDetailBtn').onclick=()=>closeModal('questionModal'); $('questionModal').classList.remove('hidden'); renderMath($('questionDetail'));
  }
  function toggleFavorite(id){const email=currentUser().email; const a=new Set(db.favorites[email]||[]); a.has(id)?a.delete(id):a.add(id); db.favorites[email]=[...a]; save(); $('favoriteDetailBtn').textContent=a.has(id)?'★ Unfavorite':'☆ Favorite'; toast(a.has(id)?'Added to favorites.':'Removed from favorites.'); renderQuestions(); renderDashboard(); renderFavorites();}
  function renderFavorites(){ const fav=favSet(); const qs=db.questions.filter(q=>fav.has(q.id)&&(isAdmin()||q.visibility==='Public')); $('favoritesList').innerHTML=qs.map(q=>card(q,true)).join('')||'<div class="panel empty-state">No favorite questions.</div>'; renderMath($('favoritesView')); }

  function editQuestion(id=null){ const q=id?db.questions.find(x=>x.id===id):null; state.editingId=id; $('modalEyebrow').textContent=isAdmin()?'ADMIN EDITOR':'QUESTION'; $('modalTitle').textContent=q?'Edit Question':'Add Question'; $('questionDetail').classList.add('hidden'); $('studentActions').classList.add('hidden'); $('questionForm').classList.remove('hidden'); $('formError').textContent='';
    $('fId').value=q?.id||'';$('fMarks').value=q?.marks||5;$('fChapter').value=q?.chapter||'Chapter 1 Functions';$('fDifficulty').value=q?.difficulty||'Medium';$('fSource').value=q?.source||'SPM';$('fYear').value=q?.year||'';$('fTags').value=(q?.tags||[]).join(', ');$('fQuestion').value=q?.question||'';$('fAnswer').value=q?.answer||'';$('fSolution').value=q?.solution||'';$('fVisibility').value=q?.visibility||'Public';$('fStatus').value=q?.status||'Active';$('questionModal').classList.remove('hidden'); }
  function saveQuestion(e){ e.preventDefault(); if(!isAdmin())return; const id=$('fId').value.trim(); const err=$('formError'); if(!id){err.textContent='Question ID is required.';return;} const duplicate=db.questions.some(q=>q.id===id&&q.id!==state.editingId); if(duplicate){err.textContent='Question ID already exists.';return;} const data={id,marks:Number($('fMarks').value),chapter:$('fChapter').value.trim(),difficulty:$('fDifficulty').value,source:$('fSource').value.trim(),year:Number($('fYear').value)||null,tags:$('fTags').value.split(',').map(x=>x.trim()).filter(Boolean),question:$('fQuestion').value.trim(),answer:$('fAnswer').value.trim(),solution:$('fSolution').value.trim(),visibility:$('fVisibility').value,status:$('fStatus').value}; if(!data.marks||!data.chapter||!data.source||!data.question||!data.answer||!data.solution){err.textContent='Marks, chapter, source, question, answer, and full solution are required.';return;} if(state.editingId){Object.assign(db.questions.find(q=>q.id===state.editingId),data);toast('Question updated.');}else{db.questions.push(data);toast('Question added.');} save();closeModal('questionModal');renderQuestions();renderDashboard();}
  function deleteQuestion(id){ if(!isAdmin())return; const q=db.questions.find(x=>x.id===id); if(!q)return; if(confirm(`Delete question ${q.id}? This cannot be undone.`)){db.questions=db.questions.filter(x=>x.id!==id); Object.values(db.favorites).forEach(a=>{});save();toast('Question deleted.');renderQuestions();renderDashboard();renderFavorites();} }
  function randomQuestion(){ const qs=db.questions.filter(q=>q.status==='Active'&&(isAdmin()||q.visibility==='Public')); if(!qs.length)return toast('No active questions available.'); openQuestion(qs[Math.floor(Math.random()*qs.length)].id); }

  function renderAdmin(){ const active=db.questions.filter(q=>q.status==='Active').length; $('adminStatGrid').innerHTML=[statCard('Total questions',db.questions.length),statCard('Active',active),statCard('Students',db.users.filter(u=>u.role==='student').length),statCard('Favorites saved',Object.values(db.favorites).reduce((a,x)=>a+x.length,0))].join(''); }
  function openAccount(){ const u=currentUser(); if(!u)return; $('accountBody').innerHTML=`<div style="padding:18px"><div class="detail-section"><div class="detail-label">ACCOUNT</div><div class="detail-content"><strong>${escapeHtml(u.name)}</strong><br>${escapeHtml(u.email)}<br><span class="chip" style="margin-top:10px">${escapeHtml(u.role)}</span></div></div><button class="secondary-btn" id="clearLocalBtn">Reset local demo data</button></div>`; $('clearLocalBtn').onclick=()=>{if(confirm('Reset all local question-bank data?')){db=defaultState();save();toast('Local data reset.');closeModal('accountModal');showView('dashboard');}}; $('accountModal').classList.remove('hidden'); }
  function closeModal(id){$(id).classList.add('hidden');}

  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-nav]'); if(nav){showView(nav.dataset.nav);return;}
    const open=e.target.closest('[data-open]');if(open){openQuestion(open.dataset.open);return;}
    const view=e.target.closest('[data-view]');if(view){openQuestion(view.dataset.view);return;}
    const fav=e.target.closest('[data-fav]');if(fav){toggleFavorite(fav.dataset.fav);return;}
    const edit=e.target.closest('[data-edit]');if(edit){editQuestion(edit.dataset.edit);return;}
    const del=e.target.closest('[data-del]');if(del){deleteQuestion(del.dataset.del);return;}
    const close=e.target.closest('[data-close]');if(close){closeModal(close.dataset.close);return;}
  });
  $('themeBtn').onclick=()=>{document.body.classList.toggle('dark');localStorage.setItem('math_theme',document.body.classList.contains('dark')?'dark':'light');};
  $('logoutBtn').onclick=()=>{localStorage.removeItem(SESSION);refreshShell();showView('dashboard');}; $('accountBtn').onclick=()=> currentUser()?openAccount():showView('dashboard'); $('randomBtn').onclick=randomQuestion; $('addQuestionBtn').onclick=()=>editQuestion(); $('questionForm').onsubmit=saveQuestion;
  ['searchInput','chapterFilter','difficultyFilter','sourceFilter','statusFilter'].forEach(id=>$(id).addEventListener('input',renderQuestions));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.modal').forEach(m=>m.classList.add('hidden'));});
  setupAuth(); setAuthMode('login');
  if(localStorage.getItem('math_theme')==='dark')document.body.classList.add('dark');
  refreshShell(); showView(currentUser()?'dashboard':'dashboard');
})();
