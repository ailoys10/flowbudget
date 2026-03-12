function renderRegisterPage(container){
  container.innerHTML=`
<div class="auth-page">
    <div class="welcome-side">
      <div style="margin-bottom: 40px;">
         <span style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
            Step to Freedom
         </span>
      </div>
      
      <h2>Mulai Perjalanan Finansial Anda.</h2>
      
      <div class="motivation-box">
        <p class="motivation-text">
          "Investasi terbaik yang bisa Anda lakukan adalah pada manajemen diri Anda sendiri. Kendalikan pengeluaran, bangun masa depan."
        </p>
        <div style="margin-top: 12px; font-weight: 600; font-size: 0.9rem;">— Tim FlowBudget</div>
      </div>
    </div>

    <div class="auth-card-container">
      <div class="auth-card">
        <div class="auth-logo" style="margin-bottom: 32px;">
          <div class="auth-lmark">${ico.logo}</div>
          <div class="auth-lname" style="color: #0f172a">Flow<span>Budget</span></div>
        </div>

        <h1 style="font-size: 1.8rem; font-weight: 700; color: #1e293b; margin-bottom: 8px;">Buat Akun Baru</h1>
        <p style="color: #64748b; margin-bottom: 32px;">Bergabunglah untuk mulai mengelola keuangan lebih cerdas.</p>

        <div id="al"></div>

        <div class="fgrp">
          <label class="flbl">Nama Lengkap</label>
          <input type="text" class="finp" id="in" placeholder="Nama lengkap Anda" />
        </div>

        <div class="fgrp">
          <label class="flbl">Alamat Email</label>
          <input type="email" class="finp" id="ie" placeholder="nama@email.com" />
        </div>

        <div class="fgrp">
          <label class="flbl">Kata Sandi</label>
          <div class="inp-wrap">
            <input type="password" class="finp" id="ip" placeholder="Minimal 6 karakter" />
            <button type="button" class="inp-eye" id="ie2">
                <span id="iem" style="width:16px;height:16px;display:flex">${ico.eye}</span>
            </button>
          </div>
        </div>

        <button class="btn btn-vi btn-blk btn-lg" id="bm" style="background: #6366f1; border: none; margin-top: 10px; height: 52px; font-weight: 600;">
          Daftar Sekarang
        </button>

        <div style="margin-top: 24px; text-align: center; color: #64748b; font-size: 0.9rem;">
          Sudah punya akun? <a id="ke-masuk" style="color: #6366f1; font-weight: 700; cursor: pointer; text-decoration: none;">Masuk di sini</a>
        </div>
      </div>
    </div>
  </div>`;
  const ip=container.querySelector('#ip'),iem=container.querySelector('#iem');
  container.querySelector('#ie2').addEventListener('click',()=>{
    const s=ip.type==='text';ip.type=s?'password':'text';iem.innerHTML=s?ico.eye:ico.eyeOff;
  });
  container.querySelector('#ke-masuk').addEventListener('click',()=>router.navigate('login'));

  const bd=container.querySelector('#bm'),al=container.querySelector('#al');
  bd.addEventListener('click',async()=>{
    const nama=container.querySelector('#in').value.trim();
    const email=container.querySelector('#ie').value.trim();
    const sandi=ip.value;
    if(!nama||!email||!sandi){al.innerHTML=`<div class="alert alert-err">Harap isi semua kolom.</div>`;return}
    if(sandi.length<6){al.innerHTML=`<div class="alert alert-err">Kata sandi minimal 6 karakter.</div>`;return}
    bd.disabled=true;bd.innerHTML=`<span class="spin"></span> Memproses...`;al.innerHTML='';
    const r=await api.auth.register(nama,email,sandi);
    if(r.success){
      api.setTokens(r.data.accessToken,r.data.refreshToken);
      localStorage.setItem('user',JSON.stringify(r.data.user));
      showToast('Akun berhasil dibuat. Selamat bergabung!','ok');
      router.navigate('dashboard');
    }else{
      const p=r.errors?r.errors[0].msg:r.message;
      al.innerHTML=`<div class="alert alert-err">${p}</div>`;
      bd.disabled=false;bd.innerHTML='Buat Akun';
    }
  });
}
