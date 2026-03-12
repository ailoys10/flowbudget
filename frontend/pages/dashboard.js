async function renderDashboardPage(container){
  const layout=buatLayout(
    'dashboard','Ringkasan Keuangan',
    `Dasbor <span class="serif">Keuangan</span>`,
    'Semua angka penting dalam satu pandangan.',
    async(body)=>{

/* ─ skeleton ─ */
body.innerHTML = `
<div class="main-wrapper" style="display: flex; flex-direction: column; min-height: 100vh;">
    
    <div class="page-body" style="flex: 1 0 auto; padding: 30px;">
        <div class="stats-row" id="stats-row">
          ${['sc-saldo','sc-masuk','sc-keluar'].map(c=>`
            <div class="stat-card ${c}">
              <div class="stat-tag skel" style="width:54px;height:17px;margin-bottom:14px">&nbsp;</div>
              <div class="skel" style="height:24px;width:155px;margin-bottom:7px">&nbsp;</div>
              <div class="skel" style="height:12px;width:90px">&nbsp;</div>
            </div>`).join('')}
        </div>

    <div class="charts-row" id="charts-row">
      <div class="card card-vi">
        <div class="card-head">
          <div><div class="card-label">Tren Mingguan</div><div class="card-ttl">Pemasukan &amp; Pengeluaran — 7 Hari</div></div>
        </div>
        <canvas id="gbar" height="185"></canvas>
      </div>
      <div class="card card-or">
        <div class="card-head">
          <div><div class="card-label">Riwayat Saldo</div><div class="card-ttl">Tren Saldo 30 Hari</div></div>
        </div>
        <canvas id="gline" height="185"></canvas>
      </div>
    </div>

    <div class="card card-gr">
      <div class="card-head">
        <div><div class="card-label">Aktivitas Terakhir</div><div class="card-ttl">Transaksi Terbaru</div></div>
        <button class="btn btn-ghost btn-sm" id="btn-all">Lihat Semua</button>
      </div>
      <div id="tx-list-area"><div style="padding:30px;text-align:center"><span class="spin spin-d"></span></div></div>            
    </div>

    <footer class="dashboard-footer" style="flex-shrink: 0; padding: 20px 40px; border-top: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; color: #94a3b8; font-size: 0.85rem;">
      <div>
        &copy; 2026 <strong>FlowBudget</strong>. Dibuat dengan ❤️
      </div>
      <div style="display: flex; gap: 20px;">
        <a href="#" style="color: #94a3b8; text-decoration: none;">Bantuan</a>
        <a href="#" style="color: #94a3b8; text-decoration: none;">Privasi</a>
        <a href="#" style="color: #94a3b8; text-decoration: none;">Ketentuan</a>
      </div>
    </footer>
  </div>`;

      /* ─ fetch ─ */
      const[rSum,r7d,rHis,rTx]=await Promise.all([
        api.overview.getSummary(),
        api.overview.getExpensesLast7Days(),
        api.overview.getBalanceHistory(),
        api.transactions.getAll({limit:8}),
      ]);

      /* ─ stat cards ─ */
      if(rSum.success){
        const{totalIncome:ti,totalExpense:te,balance:b}=rSum.data;
        document.getElementById('stats-row').innerHTML=`
          <div class="stat-card sc-saldo">
            <div class="stat-tag">Saldo Bersih</div>
            <div class="stat-val">${formatRupiah(b)}</div>
            <div class="stat-lbl">Total saldo aktif Anda</div>
            <div class="stat-trend">${ico.trend} Keuangan Anda</div>
          </div>
          <div class="stat-card sc-masuk">
            <div class="stat-tag">Pemasukan</div>
            <div class="stat-val">${formatRupiah(ti)}</div>
            <div class="stat-lbl">Total pemasukan</div>
            <div class="stat-trend">Semua sumber</div>
          </div>
          <div class="stat-card sc-keluar">
            <div class="stat-tag">Pengeluaran</div>
            <div class="stat-val">${formatRupiah(te)}</div>
            <div class="stat-lbl">Total pengeluaran</div>
            <div class="stat-trend">Semua kategori</div>
          </div>`;
      }

      /* ─ chart defaults ─ */
      if(window.Chart){
        Chart.defaults.font.family="'Sora',system-ui";
        Chart.defaults.font.size=11;
        Chart.defaults.color='#7A6F97';
      }

/* ─ bar chart ─ */
if(r7d.success && window.Chart){
  const d = r7d.data;
  new Chart(document.getElementById('gbar'), {
    type: 'bar',
    data: {
      labels: d.map(r => new Date(r.date+'T00:00:00').toLocaleDateString('id-ID',{weekday:'short'})),
      datasets: [
        { label: 'Pemasukan', data: d.map(r=>r.income), backgroundColor: '#22c55e', borderRadius: 5 },
        { label: 'Pengeluaran', data: d.map(r=>r.expenses), backgroundColor: '#ef4444', borderRadius: 5 }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } },
      scales: {
        y: { ticks: { callback: v => 'Rp' + (v/1e6).toFixed(1) + 'jt' } },
        x: { grid: { display: false } }
      }
    }
  });
}

/* ─ line chart ─ */
if(rHis.success && window.Chart){
  const d = rHis.data;
  new Chart(document.getElementById('gline'), {
    type: 'line',
    data: {
      labels: d.map(r => new Date(r.date+'T00:00:00').toLocaleDateString('id-ID',{day:'numeric'})),
      datasets: [{
        label: 'Saldo',
        data: d.map(r=>r.balance),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)', // Efek warna di bawah garis
        fill: true,
        tension: 0.4 // Biar garisnya melengkung cantik, nggak kaku
      }]
    },
    options: {
      responsive: true,
      layout: {
        padding: {
          bottom: -5 // Angka ini narik grafik biar lebih mepet ke bawah
        }
      },
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: v => 'Rp' + (v/1e6).toFixed(1) + 'jt' } },
        x: { grid: { display: false } }
      }
    }
  });
}

      /* ─ tx list ─ */
      const area=document.getElementById('tx-list-area');
      if(rTx.success){
        const list=rTx.data.slice(0,8);
        if(!list.length){
          area.innerHTML=`<div class="empty-st">
            <div class="empty-ico"><span style="width:22px;height:22px;display:flex">${ico.inbox}</span></div>
            <div class="empty-ttl">Belum ada transaksi</div>
            <div class="empty-desc">Tambahkan transaksi pertama Anda untuk memulai.</div>
            <button class="btn btn-vi" onclick="router.navigate('add-transaction')">
              <span style="width:14px;height:14px;display:flex">${ico.plus}</span>Tambah Transaksi
            </button></div>`;
        }else{
          const kat2ini=k=>k.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
          area.innerHTML=`<div class="tx-list">${list.map(tx=>`
            <div class="tx-row">
              <div class="tx-ico ${tx.type==='income'?'masuk':'keluar'}">${kat2ini(tx.category)}</div>
              <div class="tx-info">
                <div class="tx-ttl">${tx.title}</div>
                <div class="tx-meta">
                  <span class="badge badge-kat" style="font-size:9.5px;padding:1px 6px">${tx.category}</span>
                  <span>${formatTgl(tx.date)}</span>
                </div>
              </div>
              <div class="tx-right">
                <div class="tx-amt ${tx.type==='income'?'masuk':'keluar'}">${tx.type==='income'?'+':'-'}${formatRupiah(tx.amount)}</div>
                <div class="tx-btns">
                  <button class="btn btn-ghost btn-sm" style="padding:3px 8px;font-size:10.5px" data-e="${tx.id}">Ubah</button>
                  <button class="btn btn-del btn-sm" style="padding:3px 8px;font-size:10.5px" data-d="${tx.id}">Hapus</button>
                </div>
              </div>
            </div>`).join('')}</div>`;
          area.querySelectorAll('[data-e]').forEach(b=>b.addEventListener('click',()=>router.navigate('edit-transaction',{id:b.dataset.e})));
          area.querySelectorAll('[data-d]').forEach(b=>b.addEventListener('click',()=>hapusTx(b.dataset.d)));
        }
      }
      body.querySelector('#btn-all').addEventListener('click',()=>router.navigate('transactions'));
    });
  container.appendChild(layout);
}

async function hapusTx(id){
  konfirmHapus('Hapus Transaksi','Apakah Anda yakin ingin menghapus transaksi ini?',async()=>{
    const r=await api.transactions.delete(id);
    if(r.success){showToast('Transaksi berhasil dihapus.','ok');router.navigate('dashboard')}
    else showToast(r.message,'err');
  });
}
