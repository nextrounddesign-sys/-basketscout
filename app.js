const SUPABASE_URL = 'https://nusoidhurmlunvuuzycy.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_-hwik_1dNnC9gedbAbls4A__-JM8qw3';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const data = window.BasketScoutData;
const groceries = data.products;
const stores = data.stores.filter(s => s.active);

const state = {
  category: localStorage.getItem('basketScoutCategory') || 'All',
  query: '',
  quantities: JSON.parse(localStorage.getItem('basketScoutQuantities') || '{}'),
  brands: JSON.parse(localStorage.getItem('basketScoutBrands') || '{}')
};

const els = {
  search: document.querySelector('#search'), categories: document.querySelector('#categories'),
  groceryList: document.querySelector('#groceryList'), itemCount: document.querySelector('#itemCount'),
  selectedList: document.querySelector('#selectedList'), unitCount: document.querySelector('#unitCount'),
  compareBtn: document.querySelector('#compareBtn'), compareFromListBtn: document.querySelector('#compareFromListBtn'),
  results: document.querySelector('#results'), stickyActions: document.querySelector('#stickyActions'),
  stickyCount: document.querySelector('#stickyCount'), viewListBtn: document.querySelector('#viewListBtn'),
  topCount: document.querySelector('#topCount'), viewListTopBtn: document.querySelector('#viewListTopBtn'), compareTopBtn: document.querySelector('#compareTopBtn'),
  listDialog: document.querySelector('#listDialog'), resultsDialog: document.querySelector('#resultsDialog'),
  closeListBtn: document.querySelector('#closeListBtn'), closeResultsBtn: document.querySelector('#closeResultsBtn'),
  clearListBtn: document.querySelector('#clearListBtn'),
  clearBtn: document.querySelector('#clearBtn'), rowTemplate: document.querySelector('#rowTemplate'),
  selectedRowTemplate: document.querySelector('#selectedRowTemplate'), catalogStat: document.querySelector('#catalogStat'),
  storeStat: document.querySelector('#storeStat'), priceStat: document.querySelector('#priceStat'), storeLine: document.querySelector('#storeLine'),
  authStatus: document.querySelector('#authStatus'), receiptFile: document.querySelector('#receiptFile'),
  uploadReceiptBtn: document.querySelector('#uploadReceiptBtn'), uploadStatus: document.querySelector('#uploadStatus')
};

function save(){
  localStorage.setItem('basketScoutQuantities', JSON.stringify(state.quantities));
  localStorage.setItem('basketScoutBrands', JSON.stringify(state.brands));
}
function qty(id){ return Number(state.quantities[id] || 0); }
function setQty(id,value){ state.quantities[id]=Math.max(0,value); if(!state.quantities[id]) delete state.quantities[id]; save(); render(); }
function setBrand(id,value){ const v=value.trim(); if(v) state.brands[id]=v; else delete state.brands[id]; save(); }
function categoryList(){ return ['All', ...new Set(groceries.map(g=>g.category))]; }

function renderStats(){
  els.catalogStat.textContent=`${groceries.length} groceries`;
  els.storeStat.textContent=`${stores.length} alpha stores`;
  els.priceStat.textContent=`${data.priceObservations.length} verified prices`;
  els.storeLine.textContent='Alpha stores: ' + stores.map(s=>s.chain).join(', ') + '.';
}

function renderCategories(){
  els.categories.innerHTML='';
  categoryList().forEach(cat=>{
    const b=document.createElement('button');
    b.className='chip'+(state.category===cat?' active':'');
    b.textContent=cat;
    b.setAttribute('aria-pressed', state.category===cat ? 'true' : 'false');
    b.onclick=()=>{
      state.category=cat;
      localStorage.setItem('basketScoutCategory', cat);
      renderCategories();
      renderGroceries();
    };
    els.categories.appendChild(b);
  });
}

function makeRow(item){
  const node=els.rowTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector('.item-name').textContent=item.name;
  node.querySelector('.item-meta').textContent=`${item.unit} · ${item.category}`;
  node.querySelector('.qty').textContent=qty(item.id);
  node.querySelector('.minus').onclick=()=>setQty(item.id,qty(item.id)-1);
  node.querySelector('.plus').onclick=()=>setQty(item.id,qty(item.id)+1);
  return node;
}

function makeSelectedRow(item){
  const node=els.selectedRowTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector('.item-name').textContent=item.name;
  node.querySelector('.item-meta').textContent=item.unit;
  node.querySelector('.qty').textContent=qty(item.id);
  node.querySelector('.minus').onclick=()=>setQty(item.id,qty(item.id)-1);
  node.querySelector('.plus').onclick=()=>setQty(item.id,qty(item.id)+1);
  const brand=node.querySelector('.brand-input');
  brand.value=state.brands[item.id] || '';
  brand.addEventListener('change',e=>setBrand(item.id,e.target.value));
  return node;
}

function renderGroceries(){
  const q=state.query.toLowerCase().trim();
  const rows=groceries.filter(g=>{
    const matchesSearch = !q || `${g.name} ${g.unit} ${g.category} ${(g.aliases||[]).join(' ')}`.toLowerCase().includes(q);
    const matchesCategory = q ? true : (state.category==='All' || g.category===state.category);
    return matchesSearch && matchesCategory;
  });
  els.groceryList.innerHTML='';
  if(!rows.length){els.groceryList.innerHTML='<div class="empty">No groceries found.</div>';return;}
  rows.forEach(g=>els.groceryList.appendChild(makeRow(g)));
}

function renderSelected(){
  const selected=groceries.filter(g=>qty(g.id)>0);
  const units=selected.reduce((sum,g)=>sum+qty(g.id),0);
  els.itemCount.textContent=`${selected.length} selected`;
  els.unitCount.textContent=`${units} item${units===1?'':'s'}`;
  els.stickyCount.textContent=units;
  els.topCount.textContent=units;
  els.stickyActions.classList.toggle('hidden',!selected.length);
  els.selectedList.innerHTML='';
  selected.forEach(g=>els.selectedList.appendChild(makeSelectedRow(g)));
  if(!selected.length){
    if(els.listDialog.open) els.listDialog.close();
    if(els.resultsDialog.open) els.resultsDialog.close();
  }
}

function compare(){
  const selected=groceries.filter(g=>qty(g.id)>0);
  els.results.innerHTML='';
  if(!data.priceObservations.length){
    els.results.innerHTML=`<div class="data-empty"><strong>Ready for real price data</strong><p>Your list has ${selected.length} grocery type${selected.length===1?'':'s'}, but BasketScout does not have verified local price observations yet.</p><p>Once receipt data is available, this screen will show the cheapest single-store, two-store, and overall plans.</p></div>`;
  } else {
    els.results.innerHTML='<div class="data-empty">Price optimizer will use verified observations here.</div>';
  }
  if(els.listDialog.open) els.listDialog.close();
  if(!els.resultsDialog.open) els.resultsDialog.showModal();
}

function render(){renderStats();renderCategories();renderGroceries();renderSelected();}
els.search.addEventListener('input',e=>{state.query=e.target.value;renderGroceries();});
els.compareBtn.addEventListener('click',compare);
els.compareTopBtn.addEventListener('click',compare);
els.compareFromListBtn.addEventListener('click',compare);
const openList=()=>{ if(!els.listDialog.open) els.listDialog.showModal(); };
els.viewListBtn.addEventListener('click',openList);
els.viewListTopBtn.addEventListener('click',openList);
els.closeListBtn.addEventListener('click',()=>els.listDialog.close());
els.closeResultsBtn.addEventListener('click',()=>els.resultsDialog.close());
els.clearListBtn.addEventListener('click',()=>{state.quantities={};state.brands={};save();render();});
els.clearBtn.addEventListener('click',()=>{state.quantities={};state.brands={};save();if(els.listDialog.open)els.listDialog.close();if(els.resultsDialog.open)els.resultsDialog.close();render();});
[els.listDialog, els.resultsDialog].forEach(dialog=>dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();}));
render();


function setUploadStatus(message, type='info'){
  els.uploadStatus.textContent = message;
  els.uploadStatus.className = `upload-status ${type}`;
}

async function ensureAnonymousSession(){
  try {
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
    if (sessionError) throw sessionError;

    let session = sessionData.session;
    if (!session) {
      const { data, error } = await supabaseClient.auth.signInAnonymously();
      if (error) throw error;
      session = data.session;
    }

    if (!session) throw new Error('Could not create an anonymous session.');
    els.authStatus.textContent = 'Secure session ready';
    els.uploadReceiptBtn.disabled = !els.receiptFile.files.length;
    return session;
  } catch (error) {
    console.error('Anonymous auth failed:', error);
    els.authStatus.textContent = 'Connection failed';
    setUploadStatus(`Could not start a secure session: ${error.message}`, 'error');
    els.uploadReceiptBtn.disabled = true;
    return null;
  }
}

els.receiptFile.addEventListener('change', () => {
  const file = els.receiptFile.files[0];
  if (!file) {
    els.uploadReceiptBtn.disabled = true;
    els.uploadStatus.classList.add('hidden');
    return;
  }

  const maxSize = 15 * 1024 * 1024;
  if (file.size > maxSize) {
    setUploadStatus('That file is larger than 15 MB. Choose a smaller receipt file.', 'error');
    els.uploadReceiptBtn.disabled = true;
    return;
  }

  setUploadStatus(`${file.name} ready to upload.`, 'info');
  els.uploadReceiptBtn.disabled = false;
});

els.uploadReceiptBtn.addEventListener('click', async () => {
  const file = els.receiptFile.files[0];
  if (!file) return;

  els.uploadReceiptBtn.disabled = true;
  els.uploadReceiptBtn.textContent = 'Uploading…';
  setUploadStatus('Sending receipt securely…', 'info');

  try {
    const session = await ensureAnonymousSession();
    if (!session) throw new Error('No secure session is available.');

    const formData = new FormData();
    formData.append('file', file, file.name);

    const { data, error } = await supabaseClient.functions.invoke('upload-receipt', {
      body: formData,
    });

    if (error) {
      let detail = error.message || 'Upload failed.';
      if (error.context) {
        try {
          const body = await error.context.json();
          if (body?.error) detail = body.error;
        } catch (_) {}
      }
      throw new Error(detail);
    }

    if (!data?.success) throw new Error(data?.error || 'Upload did not complete.');

    const shortId = data.receipt?.id ? data.receipt.id.slice(0,8) : 'saved';
    setUploadStatus(`Receipt uploaded successfully. Receipt ID: ${shortId}.`, 'success');
    els.receiptFile.value = '';
  } catch (error) {
    console.error('Receipt upload failed:', error);
    setUploadStatus(`Upload failed: ${error.message}`, 'error');
  } finally {
    els.uploadReceiptBtn.textContent = 'Upload receipt';
    els.uploadReceiptBtn.disabled = !els.receiptFile.files.length;
  }
});

ensureAnonymousSession();
