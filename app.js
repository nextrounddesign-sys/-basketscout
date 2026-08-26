const groceries = [
  { id:'milk-whole-gal', name:'Whole milk', unit:'1 gallon', category:'Dairy' },
  { id:'milk-2-gal', name:'2% milk', unit:'1 gallon', category:'Dairy' },
  { id:'eggs-12', name:'Large eggs', unit:'12 count', category:'Dairy' },
  { id:'butter-1lb', name:'Butter', unit:'1 lb', category:'Dairy' },
  { id:'cheddar-8oz', name:'Cheddar cheese', unit:'8 oz', category:'Dairy' },
  { id:'chicken-breast', name:'Chicken breast', unit:'1 lb', category:'Meat' },
  { id:'ground-beef-80', name:'Ground beef 80/20', unit:'1 lb', category:'Meat' },
  { id:'bacon-1lb', name:'Bacon', unit:'1 lb', category:'Meat' },
  { id:'bananas', name:'Bananas', unit:'1 lb', category:'Produce' },
  { id:'apples', name:'Apples', unit:'3 lb bag', category:'Produce' },
  { id:'potatoes', name:'Russet potatoes', unit:'5 lb bag', category:'Produce' },
  { id:'onions', name:'Yellow onions', unit:'3 lb bag', category:'Produce' },
  { id:'bread-white', name:'White bread', unit:'1 loaf', category:'Bakery' },
  { id:'bread-wheat', name:'Wheat bread', unit:'1 loaf', category:'Bakery' },
  { id:'rice-5lb', name:'White rice', unit:'5 lb', category:'Pantry' },
  { id:'pasta-16oz', name:'Pasta', unit:'16 oz', category:'Pantry' },
  { id:'sauce-24oz', name:'Pasta sauce', unit:'24 oz', category:'Pantry' },
  { id:'cereal', name:'Breakfast cereal', unit:'family size', category:'Pantry' },
  { id:'coffee', name:'Ground coffee', unit:'12 oz', category:'Pantry' },
  { id:'paper-towels', name:'Paper towels', unit:'6 rolls', category:'Household' },
  { id:'toilet-paper', name:'Toilet paper', unit:'12 rolls', category:'Household' },
  { id:'detergent', name:'Laundry detergent', unit:'~60 loads', category:'Household' }
];

const priceMocks = {
  'milk-whole-gal': { ALDI: 3.05, Walmart: 3.26, GIANT: 3.79, Weis: 3.69, ShopRite: 3.49 },
  'eggs-12': { ALDI: 2.39, Walmart: 2.58, GIANT: 2.99, Weis: 2.89, ShopRite: 2.49 },
  'chicken-breast': { ALDI: 2.89, Walmart: 3.24, GIANT: 3.49, Weis: 3.29, ShopRite: 2.99 },
  'bananas': { ALDI: .49, Walmart: .50, GIANT: .59, Weis: .59, ShopRite: .49 },
  'bread-white': { ALDI: 1.49, Walmart: 1.42, GIANT: 1.99, Weis: 1.89, ShopRite: 1.79 },
  'pasta-16oz': { ALDI: 1.09, Walmart: .98, GIANT: 1.25, Weis: 1.29, ShopRite: .99 },
  'paper-towels': { ALDI: 7.49, Walmart: 6.97, GIANT: 8.49, Weis: 8.29, ShopRite: 7.99 }
};

const state = {
  category: 'All',
  query: '',
  quantities: JSON.parse(localStorage.getItem('basketScoutQuantities') || '{}')
};

const els = {
  search: document.querySelector('#search'),
  categories: document.querySelector('#categories'),
  groceryList: document.querySelector('#groceryList'),
  itemCount: document.querySelector('#itemCount'),
  selectedSection: document.querySelector('#selectedSection'),
  selectedList: document.querySelector('#selectedList'),
  unitCount: document.querySelector('#unitCount'),
  compareBtn: document.querySelector('#compareBtn'),
  resultsSection: document.querySelector('#resultsSection'),
  results: document.querySelector('#results'),
  clearBtn: document.querySelector('#clearBtn'),
  rowTemplate: document.querySelector('#rowTemplate')
};

function save() { localStorage.setItem('basketScoutQuantities', JSON.stringify(state.quantities)); }
function qty(id) { return Number(state.quantities[id] || 0); }
function setQty(id, value) { state.quantities[id] = Math.max(0, value); save(); render(); }

function categories() { return ['All', ...new Set(groceries.map(g => g.category))]; }

function renderCategories() {
  els.categories.innerHTML = '';
  categories().forEach(cat => {
    const b = document.createElement('button');
    b.className = 'chip' + (state.category === cat ? ' active' : '');
    b.textContent = cat;
    b.onclick = () => { state.category = cat; render(); };
    els.categories.appendChild(b);
  });
}

function makeRow(item) {
  const node = els.rowTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector('.item-name').textContent = item.name;
  node.querySelector('.item-meta').textContent = `${item.unit} · ${item.category}`;
  node.querySelector('.qty').textContent = qty(item.id);
  node.querySelector('.minus').onclick = () => setQty(item.id, qty(item.id) - 1);
  node.querySelector('.plus').onclick = () => setQty(item.id, qty(item.id) + 1);
  return node;
}

function renderGroceries() {
  const q = state.query.toLowerCase().trim();
  const rows = groceries.filter(g =>
    (state.category === 'All' || g.category === state.category) &&
    (!q || `${g.name} ${g.unit} ${g.category}`.toLowerCase().includes(q))
  );
  els.groceryList.innerHTML = '';
  if (!rows.length) {
    els.groceryList.innerHTML = '<div class="empty">No groceries found.</div>';
    return;
  }
  rows.forEach(g => els.groceryList.appendChild(makeRow(g)));
}

function renderSelected() {
  const selected = groceries.filter(g => qty(g.id) > 0);
  const units = selected.reduce((sum, g) => sum + qty(g.id), 0);
  els.itemCount.textContent = `${selected.length} selected`;
  els.unitCount.textContent = `${units} item${units === 1 ? '' : 's'}`;
  els.selectedSection.classList.toggle('hidden', !selected.length);
  els.selectedList.innerHTML = '';
  selected.forEach(g => els.selectedList.appendChild(makeRow(g)));
  if (!selected.length) els.resultsSection.classList.add('hidden');
}

function compare() {
  const selected = groceries.filter(g => qty(g.id) > 0);
  const plan = {};
  selected.forEach(item => {
    const prices = priceMocks[item.id];
    if (!prices) return;
    const [store, price] = Object.entries(prices).sort((a,b) => a[1]-b[1])[0];
    plan[store] ||= [];
    plan[store].push({ item, price, q: qty(item.id) });
  });
  els.results.innerHTML = '';
  if (!Object.keys(plan).length) {
    els.results.innerHTML = '<div class="empty">No mock prices exist yet for the selected items.</div>';
  } else {
    Object.entries(plan).forEach(([store, items]) => {
      const wrap = document.createElement('div');
      wrap.className = 'plan-store';
      const subtotal = items.reduce((s, x) => s + x.price * x.q, 0);
      wrap.innerHTML = `<h3>${store} · $${subtotal.toFixed(2)}</h3>` + items.map(x =>
        `<div class="plan-line"><span>${x.item.name} × ${x.q}</span><span>$${(x.price * x.q).toFixed(2)}</span></div>`
      ).join('');
      els.results.appendChild(wrap);
    });
  }
  els.resultsSection.classList.remove('hidden');
  els.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function render() { renderCategories(); renderGroceries(); renderSelected(); }

els.search.addEventListener('input', e => { state.query = e.target.value; renderGroceries(); });
els.compareBtn.addEventListener('click', compare);
els.clearBtn.addEventListener('click', () => {
  state.quantities = {}; save(); els.resultsSection.classList.add('hidden'); render();
});

render();
