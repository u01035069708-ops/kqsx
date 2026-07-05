// Global states
let globalResultsData = null;
let currentTheme = 'dark';

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const dateSelect = document.getElementById('date-select');
const resultsLoading = document.getElementById('results-loading');
const resultsDisplay = document.getElementById('results-display');

// Initialize Website
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  fetchLotteryData();
  setupEventListeners();
  loadInitialDreams();
  populateFengShuiYears();
});

// Setup event handlers
function setupEventListeners() {
  // Theme toggle button
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Date select dropdown change
  dateSelect.addEventListener('change', (e) => {
    const selectedIndex = e.target.value;
    if (selectedIndex !== '' && globalResultsData) {
      renderResultBoard(globalResultsData.results[selectedIndex]);
    }
  });
}

// --------------------------------------------------
// THEME MANAGEMENT (DARK / LIGHT MODE)
// --------------------------------------------------
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    currentTheme = savedTheme;
  } else {
    // Default to dark theme, check system preferences
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    currentTheme = prefersLight ? 'light' : 'dark';
  }
  
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    themeToggleBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
}

// --------------------------------------------------
// TAB NAVIGATION
// --------------------------------------------------
function switchTab(tabId, event) {
  if (event) event.preventDefault();

  // Remove active state from all nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Add active state to selected nav link
  document.getElementById(`tab-${tabId}`).classList.add('active');

  // Hide all panels
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // Show active panel
  document.getElementById(`panel-${tabId}`).classList.add('active');

  // If switching to simulator, ensure slots are reset
  if (tabId === 'simulator') {
    resetSimulatorBoard();
  }
}

// --------------------------------------------------
// DATA FETCHING & RENDERING (API)
// --------------------------------------------------
async function fetchLotteryData() {
  try {
    resultsLoading.classList.remove('hidden');
    resultsDisplay.classList.add('hidden');

    const response = await fetch('/api/results');
    const data = await response.json();

    if (data.success) {
      globalResultsData = data;
      
      // Populate Date Dropdown
      populateDateSelect(data.results);
      
      // Render Latest Results (first item)
      renderResultBoard(data.results[0]);
      
      // Render statistics and predictions tabs
      renderStatistics(data.stats);
      renderPredictions(data.stats);
      renderProbabilities(data.stats.probabilities);
      
      resultsLoading.classList.add('hidden');
      resultsDisplay.classList.remove('hidden');
    } else {
      throw new Error("API responded with success: false");
    }
  } catch (error) {
    console.error("Error fetching lottery results:", error);
    resultsLoading.innerHTML = `
      <i class="fa-solid fa-circle-exclamation text-gold" style="font-size: 2.5rem;"></i>
      <p>Không thể kết nối đến máy chủ xổ số. Vui lòng tải lại trang hoặc thử lại sau.</p>
      <button class="btn btn-secondary" onclick="fetchLotteryData()">Tải lại dữ liệu</button>
    `;
  }
}

function populateDateSelect(results) {
  dateSelect.innerHTML = '';
  results.forEach((item, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = item.dateDisplay || item.pubDate;
    if (index === 0) {
      option.selected = true;
    }
    dateSelect.appendChild(option);
  });
}

function renderResultBoard(drawData) {
  // Set Board Title
  document.getElementById('board-date-title').textContent = drawData.title.toUpperCase();

  const prizes = drawData.prizes;

  // Render main prize slots
  document.getElementById('val-db').textContent = prizes.db.join(' - ');
  document.getElementById('val-g1').textContent = prizes.g1.join(' - ');
  document.getElementById('val-g2').textContent = prizes.g2.join(' - ');
  document.getElementById('val-g3').textContent = prizes.g3.join(' - ');
  document.getElementById('val-g4').textContent = prizes.g4.join(' - ');
  document.getElementById('val-g5').textContent = prizes.g5.join(' - ');
  document.getElementById('val-g6').textContent = prizes.g6.join(' - ');
  document.getElementById('val-g7').textContent = prizes.g7.join(' - ');

  // Calculate and Render Đầu/Đuôi Loto
  renderDauDuoiBoards(prizes);
}

function renderDauDuoiBoards(prizes) {
  // Collect all 27 loto numbers (last 2 digits of all prizes)
  const lotos = [];
  Object.values(prizes).forEach(arr => {
    arr.forEach(num => {
      if (num && num.length >= 2) {
        lotos.push(num.substring(num.length - 2));
      }
    });
  });

  // Group by Head (Đầu) and Tail (Đuôi)
  const dauMap = {};
  const duoiMap = {};
  for (let i = 0; i <= 9; i++) {
    dauMap[i] = [];
    duoiMap[i] = [];
  }

  lotos.forEach(loto => {
    const dau = loto[0];
    const duoi = loto[1];
    if (dauMap[dau]) dauMap[dau].push(loto);
    if (duoiMap[duoi]) duoiMap[duoi].push(loto);
  });

  // Render Đầu table
  const dauBody = document.getElementById('loto-dau-body');
  dauBody.innerHTML = '';
  for (let i = 0; i <= 9; i++) {
    const row = document.createElement('tr');
    
    const tdDau = document.createElement('td');
    tdDau.textContent = i;
    
    const tdLotos = document.createElement('td');
    // Sort and highlight if matches Special Prize (Đề)
    const sortedLotos = dauMap[i].sort().map(num => {
      const isDe = prizes.db[0] && prizes.db[0].endsWith(num);
      return isDe ? `<span class="text-gold font-bold">${num}</span>` : num;
    });
    tdLotos.innerHTML = sortedLotos.join(', ') || '<span style="color: var(--text-secondary); opacity: 0.5;">-</span>';
    
    row.appendChild(tdDau);
    row.appendChild(tdLotos);
    dauBody.appendChild(row);
  }

  // Render Đuôi table
  const duoiBody = document.getElementById('loto-duoi-body');
  duoiBody.innerHTML = '';
  for (let i = 0; i <= 9; i++) {
    const row = document.createElement('tr');
    
    const tdDuoi = document.createElement('td');
    tdDuoi.textContent = i;
    tdDuoi.style.color = 'var(--accent-purple)'; // color indicator for tail
    
    const tdLotos = document.createElement('td');
    const sortedLotos = duoiMap[i].sort().map(num => {
      const isDe = prizes.db[0] && prizes.db[0].endsWith(num);
      return isDe ? `<span class="text-gold font-bold">${num}</span>` : num;
    });
    tdLotos.innerHTML = sortedLotos.join(', ') || '<span style="color: var(--text-secondary); opacity: 0.5;">-</span>';
    
    row.appendChild(tdDuoi);
    row.appendChild(tdLotos);
    duoiBody.appendChild(row);
  }
}

// --------------------------------------------------
// STATS & PREDICTIONS RENDER
// --------------------------------------------------
function renderStatistics(stats) {
  // Render Hot Numbers (Top 15)
  const hotBody = document.getElementById('hot-numbers-body');
  hotBody.innerHTML = '';
  const topHots = stats.frequencies.slice(0, 10);
  topHots.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.number}</td>
      <td><span class="hot-num-badge">${item.count} lần</span></td>
      <td>${Math.round((item.count / 27) * 10) / 10} nháy/kỳ</td>
    `;
    hotBody.appendChild(row);
  });

  // Render Cold Numbers (Lô Gan)
  const coldBody = document.getElementById('cold-numbers-body');
  coldBody.innerHTML = '';
  const topGans = stats.loloGan.slice(0, 10);
  topGans.forEach(item => {
    const row = document.createElement('tr');
    let rating = 'Nuôi ổn định';
    if (item.daysAgo > 5) rating = '<span class="text-gold">Đạt ngưỡng gan</span>';
    if (item.daysAgo > 8) rating = '<span style="color: var(--accent-red); font-weight:700;">Gan cực đại (Chú ý)</span>';
    
    row.innerHTML = `
      <td>${item.number}</td>
      <td><span class="cold-num-badge">${item.daysAgo} kỳ</span></td>
      <td>${rating}</td>
    `;
    coldBody.appendChild(row);
  });
}

function renderPredictions(stats) {
  const pred = stats.predictions;
  
  // Set Date
  document.getElementById('prediction-date').textContent = pred.date;

  // Set Bach Thu
  document.getElementById('pred-bach-thu').textContent = pred.bachThu;

  // Set Song Thu
  const songThuContainer = document.getElementById('pred-song-thu');
  songThuContainer.innerHTML = `
    <span>${pred.songThu[0]}</span>
    <span style="color: var(--text-secondary); font-size: 2.5rem; display: flex; align-items: center;">-</span>
    <span>${pred.songThu[1] || ''}</span>
  `;

  // Set Dan De 10
  const dan10Container = document.getElementById('dan-de-10');
  dan10Container.innerHTML = '';
  pred.danDe10.forEach(num => {
    const bubble = document.createElement('span');
    bubble.className = 'bubble';
    bubble.textContent = num;
    dan10Container.appendChild(bubble);
  });

  // Set Dan De 36
  const dan36Container = document.getElementById('dan-de-36');
  dan36Container.innerHTML = '';
  pred.danDe36.forEach(num => {
    const bubble = document.createElement('span');
    bubble.className = 'bubble';
    bubble.textContent = num;
    dan36Container.appendChild(bubble);
  });
}

// --------------------------------------------------
// INTERACTIVE LOTTERY SIMULATOR (QUAY THỬ)
// --------------------------------------------------
let isSimulating = false;

const simSlots = [
  { id: 'sim-g7-0', digits: 2 }, { id: 'sim-g7-1', digits: 2 }, { id: 'sim-g7-2', digits: 2 }, { id: 'sim-g7-3', digits: 2 },
  { id: 'sim-g6-0', digits: 3 }, { id: 'sim-g6-1', digits: 3 }, { id: 'sim-g6-2', digits: 3 },
  { id: 'sim-g5-0', digits: 4 }, { id: 'sim-g5-1', digits: 4 }, { id: 'sim-g5-2', digits: 4 }, { id: 'sim-g5-3', digits: 4 }, { id: 'sim-g5-4', digits: 4 }, { id: 'sim-g5-5', digits: 4 },
  { id: 'sim-g4-0', digits: 4 }, { id: 'sim-g4-1', digits: 4 }, { id: 'sim-g4-2', digits: 4 }, { id: 'sim-g4-3', digits: 4 },
  { id: 'sim-g3-0', digits: 5 }, { id: 'sim-g3-1', digits: 5 }, { id: 'sim-g3-2', digits: 5 }, { id: 'sim-g3-3', digits: 5 }, { id: 'sim-g3-4', digits: 5 }, { id: 'sim-g3-5', digits: 5 },
  { id: 'sim-g2-0', digits: 5 }, { id: 'sim-g2-1', digits: 5 },
  { id: 'sim-g1', digits: 5 },
  { id: 'sim-db', digits: 5 }
];

function resetSimulatorBoard() {
  if (isSimulating) return;
  simSlots.forEach(slot => {
    const el = document.getElementById(slot.id);
    if (el) {
      el.innerText = '-'.repeat(slot.digits);
      el.classList.remove('val-highlight');
      el.classList.remove('simulating');
    }
  });
}

function spinSlotAnim(elementId, digitCount, duration) {
  return new Promise((resolve) => {
    const el = document.getElementById(elementId);
    el.classList.add('simulating');
    
    // Fast numbers cycle
    const interval = setInterval(() => {
      let randVal = '';
      for (let i = 0; i < digitCount; i++) {
        randVal += Math.floor(Math.random() * 10);
      }
      el.innerText = randVal;
    }, 50);

    setTimeout(() => {
      clearInterval(interval);
      el.classList.remove('simulating');
      
      // Determine final random number for this slot
      let finalVal = '';
      for (let i = 0; i < digitCount; i++) {
        finalVal += Math.floor(Math.random() * 10);
      }
      el.innerText = finalVal;
      resolve(finalVal);
    }, duration);
  });
}

async function startLotterySimulation() {
  if (isSimulating) return;
  isSimulating = true;
  
  const spinBtn = document.getElementById('start-spin-btn');
  spinBtn.disabled = true;
  spinBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang quay giải...';

  resetSimulatorBoard();

  // Spin sequentially with suspense (G7 up to Special DB)
  // To speed it up slightly and not bore the user, we group some slots or run them in 400ms duration.
  // Sequence order: G7, G6, G5, G4, G3, G2, G1, DB
  for (let i = 0; i < simSlots.length; i++) {
    const slot = simSlots[i];
    await spinSlotAnim(slot.id, slot.digits, 400);
  }

  // Highlight special prize
  const dbEl = document.getElementById('sim-db');
  if (dbEl) {
    dbEl.classList.add('val-highlight');
  }

  isSimulating = false;
  spinBtn.disabled = false;
  spinBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Bắt đầu quay thử';
}

// --------------------------------------------------
// DREAM DICTIONARY (SỔ MƠ LÔ ĐỀ)
// --------------------------------------------------
let dreamSearchTimeout = null;

async function loadInitialDreams() {
  try {
    const response = await fetch('/api/dreams');
    const data = await response.json();
    renderDreams(data);
  } catch (error) {
    console.error("Error loading dreams:", error);
  }
}

function renderDreams(dreams) {
  const container = document.getElementById('dream-results-container');
  container.innerHTML = '';

  if (dreams.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">
        <i class="fa-solid fa-circle-question" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p>Không tìm thấy giấc mơ phù hợp với điềm báo của bạn. Hãy thử từ khóa khác!</p>
      </div>
    `;
    return;
  }

  dreams.forEach(item => {
    const card = document.createElement('div');
    card.className = 'dream-card';
    
    // Split numbers to create individual badges
    const numbersHtml = item.numbers.split(',')
      .map(num => `<span class="dream-number-badge">${num.trim()}</span>`)
      .join('');

    card.innerHTML = `
      <div class="dream-keyword"><i class="fa-solid fa-moon"></i> ${item.keyword}</div>
      <div class="dream-numbers-row">
        <span style="font-size: 0.82rem; color: var(--text-secondary); font-weight:600;">Số may mắn:</span>
        ${numbersHtml}
      </div>
      <div class="dream-meaning">${item.meaning}</div>
    `;
    container.appendChild(card);
  });
}

function searchDreams() {
  const query = document.getElementById('dream-input').value;
  
  // Debounce API calls
  clearTimeout(dreamSearchTimeout);
  dreamSearchTimeout = setTimeout(async () => {
    try {
      const response = await fetch(`/api/dreams?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      const titleEl = document.getElementById('dream-results-title');
      if (query.trim() === '') {
        titleEl.textContent = 'Giấc Mơ Gợi Ý';
      } else {
        titleEl.textContent = `Kết quả tìm kiếm cho: "${query}"`;
      }
      
      renderDreams(data);
    } catch (e) {
      console.error("Error searching dreams:", e);
    }
  }, 300);
}

function clearDreamSearch() {
  const input = document.getElementById('dream-input');
  input.value = '';
  searchDreams();
  input.focus();
}

// --------------------------------------------------
// PROBABILITY GRID (XÁC SUẤT 00-99)
// --------------------------------------------------
let currentProbabilities = [];

function renderProbabilities(probs) {
  currentProbabilities = probs || [];
  displayProbabilitiesGrid(currentProbabilities);
}

function displayProbabilitiesGrid(probs) {
  const container = document.getElementById('probabilities-grid');
  container.innerHTML = '';

  probs.forEach(item => {
    const cell = document.createElement('div');
    
    // Class modifiers based on lotoChance
    let modifier = '';
    if (item.lotoChance > 30.0) {
      modifier = 'high-prob';
    } else if (item.lotoChance < 20.0) {
      modifier = 'low-prob';
    }

    cell.className = `prob-cell ${modifier}`;
    cell.setAttribute('data-number', item.number);

    cell.innerHTML = `
      <div class="prob-num">${item.number}</div>
      <div class="prob-stats-col">
        <div class="prob-badge prob-badge-loto">
          <span>Lô:</span>
          <span>${item.lotoChance}%</span>
        </div>
        <div class="prob-badge prob-badge-de">
          <span>Đề:</span>
          <span>${item.deChance}%</span>
        </div>
      </div>
    `;
    container.appendChild(cell);
  });
}

function filterProbabilities() {
  const query = document.getElementById('prob-search-input').value.trim();
  const cells = document.querySelectorAll('#probabilities-grid .prob-cell');
  
  cells.forEach(cell => {
    const num = cell.getAttribute('data-number');
    if (num.includes(query)) {
      cell.classList.remove('hidden');
    } else {
      cell.classList.add('hidden');
    }
  });
}

function sortProbabilities() {
  const sortBy = document.getElementById('prob-sort-select').value;
  let sorted = [...currentProbabilities];

  switch (sortBy) {
    case 'num-asc':
      sorted.sort((a, b) => parseInt(a.number) - parseInt(b.number));
      break;
    case 'loto-desc':
      sorted.sort((a, b) => b.lotoChance - a.lotoChance);
      break;
    case 'loto-asc':
      sorted.sort((a, b) => a.lotoChance - b.lotoChance);
      break;
    case 'de-desc':
      sorted.sort((a, b) => b.deChance - a.deChance);
      break;
    case 'de-asc':
      sorted.sort((a, b) => a.deChance - b.deChance);
      break;
  }

  displayProbabilitiesGrid(sorted);
  // Re-apply search filter if there is active search term
  filterProbabilities();
}

// --------------------------------------------------
// INTERACTIVE PREDICTIONS & FENG SHUI LOGIC
// --------------------------------------------------

// Feng shui birth years data
const fengShuiData = {
  1960: { name: 'Canh Tý', element: 'Thổ', meaning: 'Hôm nay Thổ tương hợp với số đuôi 5 hoặc 0. Trực giác của bạn nhạy bén.' },
  1961: { name: 'Tân Sửu', element: 'Thổ', meaning: 'Thổ vượng cát khí. Thích hợp chọn các cặp loto có số 0 hoặc 5 làm trọng tâm.' },
  1962: { name: 'Nhâm Dần', element: 'Kim', meaning: 'Kim khí hội tụ. Cát lành rơi vào các con số đuôi 9, 2 hoặc 8.' },
  1963: { name: 'Quý Mão', element: 'Kim', meaning: 'Mệnh Kim phát tài. Hôm nay có duyên lành với các cặp số kép hoặc số gánh.' },
  1964: { name: 'Giáp Thìn', element: 'Hỏa', meaning: 'Hỏa sinh Thổ mang tài lộc. Các con số đuôi 7, 2, 3 mang lại điềm may.' },
  1965: { name: 'Ất Tỵ', element: 'Hỏa', meaning: 'Ngọn lửa rực sáng mang năng lượng may mắn. Các số hợp mệnh: 27, 72, 37.' },
  1966: { name: 'Bính Ngọ', element: 'Thủy', meaning: 'Thủy khí dồi dào. Thích hợp đầu tư loto đuôi 6, 1 hoặc 4.' },
  1967: { name: 'Đinh Mùi', element: 'Thủy', meaning: 'Mệnh Thủy hanh thông tài vận. Các con số mang may mắn hôm nay: 16, 61, 36.' },
  1968: { name: 'Mậu Thân', element: 'Thổ', meaning: 'Thổ vững chắc mang lại bình an và may mắn với các số: 05, 50, 25.' },
  1969: { name: 'Kỷ Dậu', element: 'Thổ', meaning: 'Thổ cát. Cầu tài hôm nay thích hợp chọn các số chứa chữ số 5.' },
  1970: { name: 'Canh Tuất', element: 'Kim', meaning: 'Kim sinh Thủy đem tới tài lộc. Con số cát tường của bạn hôm nay: 29, 92, 19.' },
  1971: { name: 'Tân Hợi', element: 'Kim', meaning: 'Kim vận cực tốt. Hãy chú ý đến con số loto chứa 9 hoặc 8 hôm nay.' },
  1972: { name: 'Nhâm Tý', element: 'Mộc', meaning: 'Mộc sinh Hỏa khí. Số hợp bản mệnh hôm nay nằm ở đuôi 3 hoặc 4.' },
  1973: { name: 'Quý Sửu', element: 'Mộc', meaning: 'Mộc cát lành, sinh sôi nảy nở tốt. Chọn loto đuôi 3, 8 là lựa chọn may mắn.' },
  1974: { name: 'Giáp Dần', element: 'Thủy', meaning: 'Thủy khí ôn hòa. Hôm nay các con số đuôi 1, 6 là may mắn nhất.' },
  1975: { name: 'Ất Mão', element: 'Thủy', meaning: 'Mệnh Thủy đắc lộc cát tường. Phù hợp các con số loto: 06, 60, 56.' },
  1976: { name: 'Bính Thìn', element: 'Thổ', meaning: 'Thổ sinh Kim. Các con số đuôi 0 hoặc 5 mang điềm cát tường cho bạn.' },
  1977: { name: 'Đinh Tỵ', element: 'Thổ', meaning: 'Thổ vượng phát tài. Những số mang lại may mắn lớn hôm nay: 70, 07, 75.' },
  1978: { name: 'Mậu Ngọ', element: 'Hỏa', meaning: 'Hỏa khí mạnh mẽ. Rất thích hợp với các số loto có đuôi 2 hoặc 7.' },
  1979: { name: 'Kỷ Mùi', element: 'Hỏa', meaning: 'Hỏa sinh Thổ mang tài lộc dồi dào. Số may mắn hôm nay của bạn: 27, 72, 87.' },
  1980: { name: 'Canh Thân', element: 'Mộc', meaning: 'Mộc cát tường thịnh vượng. Hãy chú ý các con số may mắn hôm nay: 38, 83, 43.' },
  1981: { name: 'Tân Dậu', element: 'Mộc', meaning: 'Mộc vượng tài khí tốt. Bản mệnh hôm nay hợp các con số đuôi 3 hoặc 4.' },
  1982: { name: 'Nhâm Tuất', element: 'Thủy', meaning: 'Thủy khí dồi dào mang tin vui tiền tài. Con số may mắn của bạn: 16, 61, 46.' },
  1983: { name: 'Quý Hợi', element: 'Thủy', meaning: 'Thủy cát tường hanh thông. Hôm nay bản mệnh hợp các số loto đuôi 6.' },
  1984: { name: 'Giáp Tý', element: 'Kim', meaning: 'Kim vận hội tụ đem tới may mắn lớn với các con số đuôi 9, 2.' },
  1985: { name: 'Ất Sửu', element: 'Kim', meaning: 'Kim sinh tài đắc lộc. Số mang lại vận may hôm nay của bạn: 29, 92, 79.' },
  1986: { name: 'Bính Dần', element: 'Hỏa', meaning: 'Hỏa vượng tài lộc. Thích hợp chọn các loto đuôi 7 hoặc 2 hôm nay.' },
  1987: { name: 'Đinh Mão', element: 'Hỏa', meaning: 'Hỏa khí rực rỡ mang vận may cát lành. Số may mắn: 07, 70, 37.' },
  1988: { name: 'Mậu Thìn', element: 'Thổ', meaning: 'Thổ cát vận hanh thông. Thích hợp chọn các số loto đuôi 0 hoặc 5.' },
  1989: { name: 'Kỷ Tỵ', element: 'Thổ', meaning: 'Thổ sinh Kim tài lộc vững chắc. Các số hợp mệnh: 05, 50, 85.' },
  1990: { name: 'Canh Ngọ', element: 'Thổ', meaning: 'Thổ vững mang điềm lành. Vận tài lộc tốt ứng với các số chứa 0 hoặc 5.' },
  1991: { name: 'Tân Mùi', element: 'Thổ', meaning: 'Thổ khí ổn định cát lành. Các số may mắn hôm nay: 15, 51, 95.' },
  1992: { name: 'Nhâm Thân', element: 'Kim', meaning: 'Kim sinh Thủy hanh thông tài vận. Rất may mắn với các số loto đuôi 9.' },
  1993: { name: 'Quý Dậu', element: 'Kim', meaning: 'Kim đắc vận cát tường. Các con số loto tương hợp: 39, 93, 29.' },
  1994: { name: 'Giáp Tuất', element: 'Hỏa', meaning: 'Hỏa sinh Thổ khí tốt. Điềm báo tài lộc may mắn ứng với số: 27, 72, 47.' },
  1995: { name: 'Ất Hợi', element: 'Hỏa', meaning: 'Hỏa rực mang năng lượng dồi dào. Số loto may mắn hôm nay: 57, 75, 87.' },
  1996: { name: 'Bính Tý', element: 'Thủy', meaning: 'Thủy vận tốt lộc khí đầy nhà. Hôm nay bản mệnh hợp các số loto đuôi 6, 1.' },
  1997: { name: 'Đinh Sửu', element: 'Thủy', meaning: 'Thủy vượng cát khí lành. Các con số may mắn của bạn: 16, 61, 86.' },
  1998: { name: 'Mậu Dần', element: 'Thổ', meaning: 'Thổ vững mang lại điềm lành cát tường với số: 05, 50, 15.' },
  1999: { name: 'Kỷ Mão', element: 'Thổ', meaning: 'Thổ cát tài. Bản mệnh hôm nay hợp các con số loto chứa 5.' },
  2000: { name: 'Canh Thìn', element: 'Kim', meaning: 'Kim vận vượng mang tới may mắn lớn với các số đuôi 9 hoặc 2.' },
  2001: { name: 'Tân Tị', element: 'Kim', meaning: 'Kim cát tài lộc sinh sôi. Vận may nằm ở các số loto: 29, 92, 09.' },
  2002: { name: 'Nhâm Ngọ', element: 'Mộc', meaning: 'Mộc sinh tài năng lượng dồi dào. Số cát tường hôm nay: 38, 83, 13.' },
  2003: { name: 'Quý Mùi', element: 'Mộc', meaning: 'Mộc cát vận hanh thông tài vận. Thích hợp loto đuôi 3 hoặc 4.' },
  2004: { name: 'Giáp Thân', element: 'Thủy', meaning: 'Thủy khí dồi dào đắc tài đắc lộc ứng với các số loto đuôi 6, 1.' },
  2005: { name: 'Ất Dậu', element: 'Thủy', meaning: 'Thủy vượng hanh thông. Cát lành hôm nay rơi vào số loto: 06, 60, 26.' },
  2006: { name: 'Bính Tuất', element: 'Thổ', meaning: 'Thổ sinh Kim tài vận thịnh vượng. Các con số hợp mệnh: 05, 50, 35.' },
  2007: { name: 'Đinh Hợi', element: 'Thổ', meaning: 'Thổ cát. Vận may tài lộc tốt ứng với các số chứa chữ số 5 hoặc 0.' },
  2008: { name: 'Mậu Tý', element: 'Hỏa', meaning: 'Hỏa vượng may mắn lành. Chọn loto đuôi 7, 2 mang điềm lành tài vận.' },
  2009: { name: 'Kỷ Sửu', element: 'Hỏa', meaning: 'Hỏa cát sinh cát. Số loto may mắn hôm nay của bạn: 27, 72, 97.' },
  2010: { name: 'Canh Dần', element: 'Mộc', meaning: 'Mộc sinh Hỏa hanh thông tài. Bản mệnh hợp các số loto đuôi 3, 8.' },
  2011: { name: 'Tân Mão', element: 'Mộc', meaning: 'Mộc khí tốt mang tài lộc. Con số may mắn cát tường: 38, 83, 53.' },
  2012: { name: 'Nhâm Thìn', element: 'Thủy', meaning: 'Thủy cát dồi dào. Điềm lành tài vận ứng với số loto: 16, 61, 76.' }
};

function populateFengShuiYears() {
  const yearSelect = document.getElementById('fengshui-year');
  if (!yearSelect) return;
  // Generate options from 2012 down to 1960
  for (let y = 2012; y >= 1960; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = `${y} (${fengShuiData[y] ? fengShuiData[y].name : ''})`;
    yearSelect.appendChild(opt);
  }
}

function calculatePersonalFengShui() {
  const year = document.getElementById('fengshui-year').value;
  const gender = document.getElementById('fengshui-gender').value;
  const resultBox = document.getElementById('fengshui-result');

  if (!year) {
    alert("Vui lòng chọn năm sinh của bạn!");
    return;
  }

  const data = fengShuiData[year];
  if (!data) return;

  if (!globalResultsData || !globalResultsData.stats || !globalResultsData.stats.probabilities) {
    alert("Dữ liệu thống kê chưa tải xong!");
    return;
  }

  // Suffix mappings for feng shui elements
  const elementSuffixes = {
    'Kim': ['9', '2', '8'],
    'Mộc': ['3', '4'],
    'Thủy': ['6', '1'],
    'Hỏa': ['7', '2'],
    'Thổ': ['0', '5']
  };

  const suffixes = elementSuffixes[data.element] || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  // Filter 00-99 probabilities based on suffixes
  const matchingProbs = globalResultsData.stats.probabilities.filter(p => {
    const lastDigit = p.number[1];
    return suffixes.includes(lastDigit);
  });

  // Get best loto (highest lotoChance) and best de (highest deChance)
  // Deterministic calculation based on the RSS feed statistics!
  const sortedLoto = [...matchingProbs].sort((a, b) => b.lotoChance - a.lotoChance);
  const sortedDe = [...matchingProbs].sort((a, b) => b.deChance - a.deChance);

  // If gender is female, pick the second best to differentiate Nam/Nữ in a deterministic way
  const lotoVal = (gender === 'female' && sortedLoto.length > 1) ? sortedLoto[1].number : sortedLoto[0].number;
  const deVal = (gender === 'female' && sortedDe.length > 1) ? sortedDe[1].number : sortedDe[0].number;

  resultBox.classList.remove('hidden');
  resultBox.innerHTML = `
    <div class="result-header-row" style="margin-top: 10px;">
      <span class="zodiac-badge"><i class="fa-solid fa-seedling"></i> Tuổi: ${data.name}</span>
      <span class="element-badge"><i class="fa-solid fa-bolt"></i> Mệnh: ${data.element}</span>
    </div>
    <div class="fengshui-numbers">
      <div class="fengshui-num-item">
        <span class="fengshui-num-label">LOTO HỢP MỆNH HÔM NAY</span>
        <span class="fengshui-num-val">${lotoVal}</span>
      </div>
      <div class="fengshui-num-item">
        <span class="fengshui-num-label">ĐỀ HỢP MỆNH HÔM NAY</span>
        <span class="fengshui-num-val" style="color: var(--accent-purple); text-shadow: 0 0 10px rgba(var(--accent-purple-rgb), 0.25);">${deVal}</span>
      </div>
    </div>
    <div class="fengshui-meaning-text">
      <strong>Lời khuyên tài lộc:</strong> ${data.meaning} (Tính toán dựa trên tần suất xuất hiện thực tế các số hợp mệnh từ RSS).
    </div>
  `;
}

function generatePredictedBoard() {
  const wrapper = document.getElementById('pred-board-wrapper');
  if (!globalResultsData || !globalResultsData.stats) {
    alert("Dữ liệu phân tích thống kê chưa được tải xong!");
    return;
  }

  const board = globalResultsData.stats.predictions.predictedBoard;
  if (!board) {
    alert("Không tìm thấy dữ liệu bảng kết quả dự báo!");
    return;
  }

  wrapper.classList.remove('hidden');
  wrapper.innerHTML = `
    <table class="lottery-table" style="margin-top: 10px;">
      <tbody>
        <tr class="row-db">
          <td class="prize-label">Đặc Biệt</td>
          <td class="prize-value"><span class="val-highlight">${board.db[0]}</span></td>
        </tr>
        <tr>
          <td class="prize-label">Giải Nhất</td>
          <td class="prize-value"><span>${board.g1[0]}</span></td>
        </tr>
        <tr>
          <td class="prize-label">Giải Nhì</td>
          <td class="prize-value"><span>${board.g2.join(' - ')}</span></td>
        </tr>
        <tr>
          <td class="prize-label">Giải Ba</td>
          <td class="prize-value">
            <div class="flex-wrap" style="display:flex; justify-content:center; gap:10px;">
              <span>${board.g3.slice(0,3).join(' - ')}</span>
              <span> - </span>
              <span>${board.g3.slice(3,6).join(' - ')}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="prize-label">Giải Tư</td>
          <td class="prize-value"><span>${board.g4.join(' - ')}</span></td>
        </tr>
        <tr>
          <td class="prize-label">Giải Năm</td>
          <td class="prize-value">
            <div class="flex-wrap" style="display:flex; justify-content:center; gap:10px;">
              <span>${board.g5.slice(0,3).join(' - ')}</span>
              <span> - </span>
              <span>${board.g5.slice(3,6).join(' - ')}</span>
            </div>
          </td>
        </tr>
        <tr>
          <td class="prize-label">Giải Sáu</td>
          <td class="prize-value"><span>${board.g6.join(' - ')}</span></td>
        </tr>
        <tr>
          <td class="prize-label">Giải Bảy</td>
          <td class="prize-value"><span>${board.g7.join(' - ')}</span></td>
        </tr>
      </tbody>
    </table>
  `;
}
