function renderAddTransactionPage(c){renderFormTx(c,null)}

async function renderEditTransactionPage(c,params){
  if(!params?.id){router.navigate('transactions');return}
  const r=await api.transactions.getById(params.id);
  if(!r.success){showToast('Transaksi tidak ditemukan.','err');router.navigate('transactions');return}
  renderFormTx(c,r.data);
}

function renderFormTx(container,tx){
  const isEdit=!!tx;
  const hari=new Date().toISOString().split('T')[0];
  const tAwal=tx?tx.type:'expense';

  const layout=buatLayout(
    isEdit?'transactions':'add-transaction',
    isEdit?'Edit Data':'Tambah Data',
    isEdit?`Ubah <span class="serif">Transaksi</span>`:`Tambah <span class="serif">Transaksi</span>`,
    isEdit?'Perbarui detail transaksi di bawah ini.':'Catat pemasukan atau pengeluaran baru.',
    (body)=>{
      body.innerHTML=`
        <div style="max-width:580px">
          <div class="card card-vi">
            <div id="al"></div>
            <div class="fgrp">
              <label class="flbl">Jenis Transaksi</label>
              <div class="tipo">
                <button type="button" class="tipo-btn${tAwal==='income'?' on-masuk':''}" id="bt-m">Pemasukan</button>
                <button type="button" class="tipo-btn${tAwal==='expense'?' on-keluar':''}" id="bt-k">Pengeluaran</button>
              </div>
              <input type="hidden" id="itipe" value="${tAwal}"/>
            </div>
            <div class="fgrp">
              <label class="flbl">Keterangan</label>
              <input type="text" class="finp" id="iket" placeholder="cth. Gaji Bulan Ini, Belanja Mingguan" value="${tx?tx.title:''}"/>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div class="fgrp">
                <label class="flbl">Jumlah (Rupiah)</label>
                <div class="inp-wrap">
                  <span class="inp-pre">Rp</span>
                  <input type="number" class="finp" id="ijml" placeholder="0" min="1" value="${tx?tx.amount:''}"/>
                </div>
              </div>
              <div class="fgrp">
                <label class="flbl">Tanggal</label>
                <input type="date" class="finp" id="itgl" value="${tx?tx.date:hari}"/>
              </div>
            </div>
            <div class="fgrp">
              <label class="flbl">Kategori</label>
              <select class="fsel" id="ikat"><option value="">Pilih kategori...</option></select>
            </div>
            <div style="display:flex;gap:10px;margin-top:6px">
              <button class="btn btn-vi btn-lg" id="bsave">${isEdit?'Simpan Perubahan':'Simpan Transaksi'}</button>
              <button class="btn btn-ghost btn-lg" id="bcancel">Batal</button>
            </div>
          </div>
        </div>`;

      const itipe=body.querySelector('#itipe'),ikat=body.querySelector('#ikat');
      const isiKat=t=>{
        const d=t==='income'?katMasuk:katKeluar;
        ikat.innerHTML=`<option value="">Pilih kategori...</option>`+d.map(k=>`<option value="${k}"${tx&&tx.category===k?' selected':''}>${k}</option>`).join('');
      };
      isiKat(tAwal);

      body.querySelector('#bt-m').addEventListener('click',()=>{
        itipe.value='income';
        body.querySelector('#bt-m').className='tipo-btn on-masuk';
        body.querySelector('#bt-k').className='tipo-btn';
        isiKat('income');
      });
      body.querySelector('#bt-k').addEventListener('click',()=>{
        itipe.value='expense';
        body.querySelector('#bt-m').className='tipo-btn';
        body.querySelector('#bt-k').className='tipo-btn on-keluar';
        isiKat('expense');
      });

      body.querySelector('#bcancel').addEventListener('click',()=>router.navigate('transactions'));

      const bsave=body.querySelector('#bsave'),al=body.querySelector('#al');
      bsave.addEventListener('click',async()=>{
        const data={
          title:body.querySelector('#iket').value.trim(),
          amount:parseFloat(body.querySelector('#ijml').value),
          type:itipe.value,
          category:ikat.value,
          date:body.querySelector('#itgl').value,
        };
        if(!data.title){al.innerHTML=`<div class="alert alert-err">Keterangan tidak boleh kosong.</div>`;return}
        if(!data.amount||data.amount<=0){al.innerHTML=`<div class="alert alert-err">Masukkan jumlah yang valid.</div>`;return}
        if(!data.category){al.innerHTML=`<div class="alert alert-err">Pilih kategori terlebih dahulu.</div>`;return}
        if(!data.date){al.innerHTML=`<div class="alert alert-err">Tanggal tidak boleh kosong.</div>`;return}
        bsave.disabled=true;bsave.innerHTML=`<span class="spin"></span> Menyimpan...`;al.innerHTML='';
        const r=isEdit?await api.transactions.update(tx.id,data):await api.transactions.create(data);
        if(r.success){
          showToast(isEdit?'Transaksi berhasil diperbarui.':'Transaksi berhasil ditambahkan.','ok');
          router.navigate('transactions');
        }else{
          const p=r.errors?r.errors[0].msg:r.message;
          al.innerHTML=`<div class="alert alert-err">${p}</div>`;
          bsave.disabled=false;bsave.innerHTML=isEdit?'Simpan Perubahan':'Simpan Transaksi';
        }
      });
    });
  container.appendChild(layout);
}
