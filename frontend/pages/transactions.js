async function renderTransactionsPage(container){
  let f={search:'',type:'',dateFrom:'',dateTo:''};
  const layout=buatLayout('transactions','Manajemen Data',
    `Semua <span class="serif">Transaksi</span>`,
    'Kelola seluruh catatan pemasukan dan pengeluaran.',
    async(body)=>{
      body.innerHTML=`
        <div class="card card-vi" style="margin-bottom:14px">
          <div class="filter-bar">
            <div class="cari-wrap">
              <span class="cari-ico">${ico.search}</span>
              <input type="text" class="finp" id="ic" placeholder="Cari transaksi..."/>
            </div>
            <select class="fsel" id="ij" style="width:150px">
              <option value="">Semua Jenis</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
            <input type="date" class="finp" id="id1" style="width:155px" title="Dari tanggal"/>
            <input type="date" class="finp" id="id2" style="width:155px" title="Sampai tanggal"/>
            <button class="btn btn-vi" id="ba">
              <span style="width:14px;height:14px;display:flex">${ico.plus}</span>Tambah
            </button>
          </div>
        </div>
        <div class="card card-or" id="tbl-card">
          <div style="padding:30px;text-align:center"><span class="spin spin-d"></span></div>
        </div>`;

      body.querySelector('#ba').addEventListener('click',()=>router.navigate('add-transaction'));

      const load=async()=>{
        const el=body.querySelector('#tbl-card');
        el.innerHTML=`<div style="padding:30px;text-align:center"><span class="spin spin-d"></span></div>`;
        const r=await api.transactions.getAll(f);
        if(!r.success){el.innerHTML=`<div class="alert alert-err" style="margin:16px">Gagal memuat data.</div>`;return}
        const d=r.data;
        if(!d.length){
          el.innerHTML=`<div class="empty-st">
            <div class="empty-ico"><span style="width:22px;height:22px;display:flex">${ico.inbox}</span></div>
            <div class="empty-ttl">Tidak ada transaksi ditemukan</div>
            <div class="empty-desc">Coba ubah filter atau tambah transaksi baru.</div>
            <button class="btn btn-vi" onclick="router.navigate('add-transaction')">Tambah Transaksi</button>
          </div>`;return;
        }
        el.innerHTML=`
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <span style="font-size:12px;color:var(--ink3);font-weight:600">${d.length} transaksi ditemukan</span>
          </div>
          <div class="tbl-wrap"><table>
            <thead><tr>
              <th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th>Jenis</th><th>Jumlah</th><th>Aksi</th>
            </tr></thead>
            <tbody>${d.map(tx=>`
              <tr>
                <td style="font-size:12px;color:var(--ink3);font-weight:500">${formatTgl(tx.date)}</td>
                <td><span style="font-weight:700;color:var(--ink)">${tx.title}</span></td>
                <td><span class="badge badge-kat">${tx.category}</span></td>
                <td><span class="badge badge-${tx.type==='income'?'masuk':'keluar'}">${tx.type==='income'?'Pemasukan':'Pengeluaran'}</span></td>
                <td><span class="jml ${tx.type==='income'?'masuk':'keluar'}">${tx.type==='income'?'+':'-'}${formatRupiah(tx.amount)}</span></td>
                <td><div class="row-act">
                  <button class="btn btn-ghost btn-sm" data-e="${tx.id}">Ubah</button>
                  <button class="btn btn-del btn-sm" data-d="${tx.id}">Hapus</button>
                </div></td>
              </tr>`).join('')}
            </tbody>
          </table></div>`;
        el.querySelectorAll('[data-e]').forEach(b=>b.addEventListener('click',()=>router.navigate('edit-transaction',{id:b.dataset.e})));
        el.querySelectorAll('[data-d]').forEach(b=>b.addEventListener('click',()=>{
          konfirmHapus('Hapus Transaksi','Apakah Anda yakin?',async()=>{
            const hr=await api.transactions.delete(b.dataset.d);
            hr.success?(showToast('Transaksi berhasil dihapus.','ok'),load()):showToast(hr.message,'err');
          });
        }));
      };

      let deb;
      body.querySelector('#ic').addEventListener('input',e=>{clearTimeout(deb);deb=setTimeout(()=>{f.search=e.target.value;load()},380)});
      body.querySelector('#ij').addEventListener('change',e=>{f.type=e.target.value;load()});
      body.querySelector('#id1').addEventListener('change',e=>{f.dateFrom=e.target.value;load()});
      body.querySelector('#id2').addEventListener('change',e=>{f.dateTo=e.target.value;load()});
      await load();
    });
  container.appendChild(layout);
}
