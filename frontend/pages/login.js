function renderLoginPage(container){
  container.innerHTML=`
<div class="auth-page">
    <div class="welcome-side">
      <div style="margin-bottom: 40px;">
         <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Fintech Solution
         </span>
      </div>
      
      <h2>Wujudkan Kebebasan Finansial Anda.</h2>
      
      <div class="motivation-box">
        <p class="motivation-text">
          "Cara terbaik untuk memprediksi masa depan keuangan Anda adalah dengan merencanakannya hari ini. Mulai catat, mulai kendalikan."
        </p>
        <div style="margin-top: 12px; font-weight: 600; font-size: 0.9rem;">— Tim FlowBudget</div>
      </div>

      <p style="margin-top: 40px; opacity: 0.7; font-size: 0.9rem;">
        Sudah lebih dari 10.000 pengguna mengelola aset mereka bersama kami.
      </p>
    </div>

    <div class="auth-card-container">
      <div class="auth-card">
        <div class="auth-logo" style="margin-bottom: 32px;">
          <div class="auth-lmark">${ico.logo}</div>
          <div class="auth-lname" style="color: #0f172a">Flow<span>Budget</span></div>
        </div>

        <h1 style="font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Selamat Datang Kembali</h1>
        <p style="color: #64748b; margin-bottom: 32px;">Pantau terus perkembangan finansial Anda hari ini.</p>

        <div id="al"></div>

        <div class="fgrp">
          <label class="flbl">Alamat Email</label>
          <input type="email" class="finp" id="ie" placeholder="nama@email.com" />
        </div>

        <div class="fgrp">
          <label class="flbl">Kata Sandi</label>
          <div class="inp-wrap">
            <input type="password" class="finp" id="ip" placeholder="••••••••" />
            <button type="button" class="inp-eye" id="ie2">
                <span id="iem" style="width:16px;height:16px;display:flex">${ico.eye}</span>
            </button>
          </div>
        </div>

        <button class="btn btn-vi btn-blk btn-lg" id="bm" style="background: #6366f1; border: none; margin-top: 10px; height: 52px; font-weight: 600;">
          Masuk Sekarang
        </button>

        <div style="margin-top: 24px; text-align: center; color: #64748b; font-size: 0.9rem;">
          Belum punya akun? <a id="ke-daftar" style="color: #6366f1; font-weight: 700; cursor: pointer; text-decoration: none;">Daftar Gratis</a>
        </div>
      </div>
    </div>
  </div>`;
  const ip=container.querySelector('#ip'),iem=container.querySelector('#iem');
  container.querySelector('#ie2').addEventListener('click',()=>{
    const s=ip.type==='text';ip.type=s?'password':'text';iem.innerHTML=s?ico.eye:ico.eyeOff;
  });
  container.querySelector('#ke-daftar').addEventListener('click',()=>router.navigate('register'));

  const bm=container.querySelector('#bm'),al=container.querySelector('#al');
  const go=async()=>{
    const email=container.querySelector('#ie').value.trim(),sandi=ip.value;
    if(!email||!sandi){al.innerHTML=`<div class="alert alert-err">Harap isi semua kolom.</div>`;return}
    bm.disabled=true;bm.innerHTML=`<span class="spin"></span> Memproses...`;al.innerHTML='';
    const r=await api.auth.login(email,sandi);
    if(r.success){
      api.setTokens(r.data.accessToken,r.data.refreshToken);
      localStorage.setItem('user',JSON.stringify(r.data.user));
      showToast('Berhasil masuk. Selamat datang!','ok');
      router.navigate('dashboard');
    }else{
      al.innerHTML=`<div class="alert alert-err">${r.message}</div>`;
      bm.disabled=false;bm.innerHTML='Masuk';
    }
  };
  bm.addEventListener('click',go);
  container.querySelector('#ip').addEventListener('keydown',e=>{if(e.key==='Enter')go()});
}
