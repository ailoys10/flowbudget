function buatSidebar(aktif){
  const u=JSON.parse(localStorage.getItem('user')||'{}');
  const ini=u.name?u.name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase():'P';
  const navs=[
    {h:'dashboard',i:ico.home,l:'Ringkasan'},
    {h:'transactions',i:ico.list,l:'Transaksi'},
    {h:'add-transaction',i:ico.plus,l:'Tambah Transaksi'},
  ];
  const sb=document.createElement('aside');
  sb.className='sidebar';sb.id='sidebar';
  sb.innerHTML=`
    <div class="sb-logo">
      <div class="sb-mark">${ico.logo}</div>
      <div class="sb-wordmark">Flow<span>Budget</span></div>
    </div>
  <div class="sidebar-user-brief" style="padding: 20px; margin-bottom: 10px; border-bottom: 1px solid rgba(0,0,0,0.05);">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div class="avatar" style="width: 40px; height: 40px; background: #6366f1; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">SN</div>
      <div>
        <div style="font-size: 0.9rem; font-weight: 600;">Sipa Nurul Azizah</div>
        <div style="font-size: 0.75rem; color: #94a3b8;">247006111030 • PABP</div>
      </div>
    </div>
  </div>
    <nav class="sb-nav">
      <div class="sb-label">Menu Utama</div>
      ${navs.map(n=>`
        <button class="nav-item${aktif===n.h?' aktif':''}" data-h="${n.h}">
          <span class="nav-ico">${n.i}</span>${n.l}
        </button>`).join('')}
    </nav>
    <div class="sb-foot">
      <div class="sb-user">
        <div class="sb-ava">${ini}</div>
        <div class="sb-meta">
          <div class="sb-name">${u.name||'Pengguna'}</div>
          <div class="sb-role">Akun Pribadi</div>
        </div>
        <button class="sb-out" id="btn-out" title="Keluar">
          <span style="width:15px;height:15px;display:flex">${ico.logout}</span>
        </button>
      </div>
    </div>`;
  sb.querySelectorAll('.nav-item[data-h]').forEach(b=>{
    b.addEventListener('click',()=>{tutupMob();router.navigate(b.dataset.h)});
  });
  sb.querySelector('#btn-out').addEventListener('click',async()=>{
    await api.auth.logout();
    showToast('Anda berhasil keluar dari akun.','ok');
    setTimeout(()=>router.navigate('login'),350);
  });
  return sb;
}

function buatTopbar(){
  const el=document.createElement('header');
  el.className='mob-top';
  el.innerHTML=`
    <button class="mob-btn" id="mob-btn">
      <span style="width:19px;height:19px;display:flex">${ico.menu}</span>
    </button>
    <div class="mob-wm">Flow<span>Budget</span></div>
    <div style="width:33px"></div>`;
  el.querySelector('#mob-btn').addEventListener('click',bukaMob);
  return el;
}

function buatOverlay(){
  const el=document.createElement('div');
  el.className='sb-overlay';el.id='sb-ov';
  el.addEventListener('click',tutupMob);
  return el;
}
function bukaMob(){document.getElementById('sidebar')?.classList.add('open');document.getElementById('sb-ov')?.classList.add('open')}
function tutupMob(){document.getElementById('sidebar')?.classList.remove('open');document.getElementById('sb-ov')?.classList.remove('open')}

function buatLayout(aktif,chip,judul,sub,renderFn){
  const wrap=document.createElement('div');
  wrap.className='app-layout page-enter';
  const sb=buatSidebar(aktif);
  const ov=buatOverlay();
  const main=document.createElement('main');
  main.className='main-content';
  const topbar=buatTopbar();
  const hdr=document.createElement('div');
  hdr.className='page-header';
  hdr.innerHTML=`
    <div class="ph-left">
      ${chip?`<div class="page-chip">${chip}</div>`:''}
      <h1 class="page-title">${judul}</h1>
      ${sub?`<p class="page-sub">${sub}</p>`:''}
    </div>`;
  const body=document.createElement('div');
  body.className='page-body';
  main.appendChild(topbar);
  main.appendChild(hdr);
  main.appendChild(body);
  wrap.appendChild(sb);wrap.appendChild(ov);wrap.appendChild(main);
  renderFn(body);
  return wrap;
}
