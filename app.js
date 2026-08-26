const data = window.BasketScoutData;
const groceries = data.products;
const stores = data.stores.filter(s => s.active);

const state = {
  category: 'All', query: '',
  quantities: JSON.parse(localStorage.getItem('basketScoutQuantities') || '{}'),
  brands: JSON.parse(localStorage.getItem('basketScoutBrands') || '{}')
};

const els = {
  search: document.querySelector('#search'), categories: document.querySelector('#categories'),
  groceryList: document.querySelector('#groceryList'), itemCount: document.querySelector('#itemCount'),
  selectedSection: document.querySelector('#selectedSection'), selectedList: document.querySelector('#selectedList'),
  unitCount: document.querySelector('#unitCount'), compareBtn: document.querySelector('#compareBtn'),
  resultsSection: document.querySelector('#resultsSection'), results: document.querySelector('#results'),
  clearBtn: document.querySelector('#clearBtn'), rowTemplate: document.querySelector('#rowTemplate'),
  selectedRowTemplate: document.querySelector('#selectedRowTemplate'), catalogStat: document.querySelector('#catalogStat'),
  storeStat: document.querySelector('#storeStat'), priceStat: document.querySelector('#priceStat'), storeLine: document.querySelector('#storeLine')
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
    b.className='chip'+(state.category===cat?' active':''); b.textContent=cat;
    b.onclick=()=>{state.category=cat; renderCategories(); renderGroceries();};
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
  const rows=groceries.filter(g=>(state.category==='All'||g.category===state.category) && (!q||`${g.name} ${g.unit} ${g.category} ${(g.aliases||[]).join(' ')}`.toLowerCase().includes(q)));
  els.groceryList.innerHTML='';
  if(!rows.length){els.groceryList.innerHTML='<div class="empty">No groceries found.</div>';return;}
  rows.forEach(g=>els.groceryList.appendChild(makeRow(g)));
}

function renderSelected(){
  const selected=groceries.filter(g=>qty(g.id)>0);
  const units=selected.reduce((s,g)=>s+qty(g.id),0);
  els.itemCount.textContent=`${selected.length} selected`;
  els.unitCount.textContent=`${units} item${units===1?'':'s'}`;
  els.selectedSection.classList.toggle('hidden',!selected.length);
  els.selectedList.innerHTML=''; selected.forEach(g=>els.selectedList.appendChild(makeSelectedRow(g)));
  if(!selected.length) els.resultsSection.classList.add('hidden');
}

function compare(){
  const selected=groceries.filter(g=>qty(g.id)>0);
  els.results.innerHTML='';
  if(!data.priceObservations.length){
    els.results.innerHTML=`<div class="data-empty"><strong>Ready for real price data</strong><p>Your list has ${selected.length} grocery type${selected.length===1?'':'s'}, but BasketScout does not have verified local price observations yet.</p><p>Mock prices were removed in v0.2. The next data milestone is receipt import and verified price records.</p></div>`;
  } else {
    els.results.innerHTML='<div class="data-empty">Price optimizer will use verified observations here.</div>';
  }
  els.resultsSection.classList.remove('hidden');
  els.resultsSection.scrollIntoView({behavior:'smooth',block:'start'});
}

function render(){renderStats();renderCategories();renderGroceries();renderSelected();}
els.search.addEventListener('input',e=>{state.query=e.target.value;renderGroceries();});
els.compareBtn.addEventListener('click',compare);
els.clearBtn.addEventListener('click',()=>{state.quantities={};state.brands={};save();els.resultsSection.classList.add('hidden');render();});
render();
