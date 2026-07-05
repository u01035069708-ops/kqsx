// Global states
let globalResultsData = null;
let currentTheme = 'dark';

// DOM Elements
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const dateSelect = document.getElementById('date-select');
const resultsLoading = document.getElementById('results-loading');
const resultsDisplay = document.getElementById('results-display');

// Mock data in case the external website is down or rate-limited
const mockData = [
  {
    title: "KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY 04/07 (Thứ Bảy)",
    pubDate: "04/07/2026",
    dateDisplay: "04/07 (Thứ Bảy)",
    link: "https://kqxs.net.vn/xo-so-ngay/mien-bac-xsmb-4-7-2026/",
    prizes: {
      db: ["14887"],
      g1: ["34848"],
      g2: ["01608", "69074"],
      g3: ["70279", "94314", "00627", "79420", "61802", "22704"],
      g4: ["2687", "6160", "7283", "5179"],
      g5: ["1327", "6447", "6008", "1845", "8606", "7255"],
      g6: ["678", "637", "222"],
      g7: ["73", "54", "87", "91"]
    }
  },
  {
    title: "KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY 03/07 (Thứ Sáu)",
    pubDate: "03/07/2026",
    dateDisplay: "03/07 (Thứ Sáu)",
    link: "https://kqxs.net.vn/xo-so-ngay/mien-bac-xsmb-3-7-2026/",
    prizes: {
      db: ["18165"],
      g1: ["26965"],
      g2: ["12215", "36248"],
      g3: ["64733", "85281", "24897", "21858", "21724", "74653"],
      g4: ["3919", "1651", "4954", "7252"],
      g5: ["2921", "9715", "3310", "9232", "2561", "9734"],
      g6: ["844", "218", "771"],
      g7: ["90", "68", "92", "13"]
    }
  },
  {
    title: "KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY 02/07 (Thứ Năm)",
    pubDate: "02/07/2026",
    dateDisplay: "02/07 (Thứ Năm)",
    link: "https://kqxs.net.vn/xo-so-ngay/mien-bac-xsmb-2-7-2026/",
    prizes: {
      db: ["51139"],
      g1: ["53733"],
      g2: ["86448", "48515"],
      g3: ["07052", "19022", "53831", "65638", "24025", "05951"],
      g4: ["3115", "9949", "8111", "1689"],
      g5: ["4973", "7396", "1950", "2740", "1419", "5208"],
      g6: ["559", "824", "270"],
      g7: ["59", "78", "33", "70"]
    }
  }
];

// Dream dictionary database
const dreamsDatabase = [
  { "keyword": "Mơ thấy rắn", "numbers": "32, 42, 72", "meaning": "Điềm báo liên quan đến sức mạnh, sự uyển chuyển, hoặc có quý nhân trợ giúp." },
  { "keyword": "Mơ thấy tiền", "numbers": "02, 52, 82", "meaning": "Báo hiệu tài lộc sắp gõ cửa, công việc làm ăn thuận lợi phát tài." },
  { "keyword": "Mơ thấy chó", "numbers": "29, 59, 95", "meaning": "Tượng trưng cho tình bạn trung thành, sự bảo vệ và có người bạn tốt sắp xuất hiện." },
  { "keyword": "Mơ thấy mèo", "numbers": "18, 58, 89", "meaning": "Nhắc nhở bạn cần cẩn trọng hơn trong các mối quan hệ xã giao hoặc tiền bạc." },
  { "keyword": "Mơ thấy cá", "numbers": "79, 56", "meaning": "Cá lội dưới nước tượng trưng cho sự dồi dào, sinh sôi nảy nở và tài chính tốt." },
  { "keyword": "Mơ thấy lửa", "numbers": "07, 27, 67, 87", "meaning": "Ngọn lửa đại diện cho nhiệt huyết, sự tái sinh hoặc thay đổi lớn trong sự nghiệp." },
  { "keyword": "Mơ thấy nước", "numbers": "66, 06, 56", "meaning": "Nước lớn, nước lũ tượng trưng cho sự hanh thông tài lộc dồi dào, vạn sự như ý." },
  { "keyword": "Mơ thấy người chết", "numbers": "03, 43, 83", "meaning": "Điềm báo tai qua nạn khỏi, đón nhận tin vui từ phương xa." },
  { "keyword": "Mơ thấy rụng răng", "numbers": "31, 32", "meaning": "Cảnh báo cần chú ý bảo vệ sức khỏe của bản thân hoặc người thân trong gia đình." },
  { "keyword": "Mơ thấy người yêu", "numbers": "46, 47, 87", "meaning": "Thể hiện mong muốn gắn kết tình cảm, niềm vui ngọt ngào sắp tới." },
  { "keyword": "Mơ thấy trúng số", "numbers": "68, 86", "meaning": "Khát khao tài chính được cải thiện, vận may tài lộc lớn sắp xuất hiện." },
  { "keyword": "Mơ thấy tai nạn", "numbers": "00, 47, 88", "meaning": "Nhắc nhở bạn cần cẩn thiện hơn khi tham gia giao thông và ký kết hợp đồng." },
  { "keyword": "Mơ thấy nhà dột", "numbers": "05, 50", "meaning": "Báo hiệu cơ hội sửa sang tổ ấm hoặc có thay đổi nhỏ trong không gian sống." },
  { "keyword": "Mơ thấy mua xe", "numbers": "40, 04, 39, 93", "meaning": "Sự thăng tiến trong công việc, bước tiến vượt bậc về địa vị xã hội." },
  { "keyword": "Mơ thấy khóc", "numbers": "85, 45", "meaning": "Mọi ưu phiền bấy lâu nay của bạn sắp sửa được trút bỏ, niềm vui trở lại." },
  { "keyword": "Mơ thấy ma", "numbers": "72, 85", "meaning": "Nhắc nhở bạn nên thư giãn tinh thần, tránh stress mệt mỏi quá độ." },
  { "keyword": "Mơ thấy rùa", "numbers": "27, 67", "meaning": "Rùa là linh vật trường thọ, báo hiệu tài lộc chậm mà chắc chắn đang đến." },
  { "keyword": "Mơ thấy hổ", "numbers": "06, 60, 46, 86", "meaning": "Bạn đang sở hữu nguồn năng lượng nội tại mạnh mẽ vượt qua mọi trở ngại." },
  { "keyword": "Mơ thấy chim", "numbers": "56, 80", "meaning": "Biểu tượng của tự do, hòa bình và những cơ hội bay cao bay xa trong sự nghiệp." },
  { "keyword": "Mơ thấy vàng", "numbers": "15, 25, 75", "meaning": "Nhắc nhở quản lý tài chính thông minh, tránh lãng phí tiền của." },
  { "keyword": "Mơ thấy ăn trộm", "numbers": "01, 90", "meaning": "Cảnh giác giữ gìn tài sản cá nhân tốt hơn trong thời gian tới." },
  { "keyword": "Mơ thấy phật", "numbers": "57, 75", "meaning": "Tâm hồn thanh thản, mọi khó khăn bế tắc sẽ sớm tìm ra hướng giải quyết hợp lý." },
  { "keyword": "Mơ thấy đánh nhau", "numbers": "03, 07, 59", "meaning": "Giải tỏa các xung đột nội tâm, chuẩn bị cho một mối quan hệ mới tốt đẹp." },
  { "keyword": "Mơ thấy rác", "numbers": "61, 62", "meaning": "Cơ hội dọn dẹp những điều cũ kỹ, chào đón nguồn năng lượng tích cực mới." },
  { "keyword": "Mơ thấy trẻ con", "numbers": "09, 19, 91", "meaning": "Khởi đầu mới tràn đầy năng lượng, ý tưởng sáng tạo độc đáo sắp ra đời." },
  { "keyword": "Mơ thấy khỉ", "numbers": "23, 63", "meaning": "Nhắc nhở bạn nên linh hoạt và nhạy bén hơn trước các thay đổi bất ngờ." },
  { "keyword": "Mơ thấy xe đạp", "numbers": "28, 82", "meaning": "Lời khuyên nên tiến bước từ từ, cân bằng cuộc sống gia đình và công việc." },
  { "keyword": "Mơ thấy đám cưới", "numbers": "07, 70, 09, 90", "meaning": "Gắn kết yêu thương lâu dài, hứa hẹn một tương lai hạnh phúc trọn vẹn." },
  { "keyword": "Mơ thấy mất đồ", "numbers": "69, 96", "meaning": "Cũ đi mới lại đến, cơ hội đổi mới bản thân theo chiều hướng tốt đẹp hơn." },
  { "keyword": "Mơ thấy máu", "numbers": "19, 69, 96, 08", "meaning": "Nhiệt huyết cháy bỏng, nỗ lực hết mình vì mục tiêu sắp gặt hái quả ngọt." },
  { "keyword": "Mơ thấy người thân", "numbers": "78, 87", "meaning": "Gia đình bình an, đón nhận tình cảm yêu thương che chở từ những người thân yêu." },
  { "keyword": "Mơ thấy gà", "numbers": "33, 44", "meaning": "Sự siêng năng chịu khó của bạn sẽ sớm được cấp trên ghi nhận và đền đáp." },
  { "keyword": "Mơ thấy heo / lợn", "numbers": "76, 67", "meaning": "Cuộc sống sung túc, no đủ, không phải lo lắng về cơm áo gạo tiền." },
  { "keyword": "Mơ thấy trăng", "numbers": "14, 41", "meaning": "Tâm hồn lãng mạn, sự thăng hoa cảm xúc và có tin tốt về gia đạo." },
  { "keyword": "Mơ thấy mưa", "numbers": "22, 77", "meaning": "Mưa tưới mát vạn vật, rửa sạch xui xẻo, khởi sắc mới trong mọi việc." }
];

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

  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });

  const tabEl = document.getElementById(`tab-${tabId}`);
  if (tabEl) tabEl.classList.add('active');

  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  const panelEl = document.getElementById(`panel-${tabId}`);
  if (panelEl) panelEl.classList.add('active');

  if (tabId === 'simulator') {
    resetSimulatorBoard();
  }
}

// --------------------------------------------------
// DATA FETCHING & PARSING (CLIENT-SIDE)
// --------------------------------------------------
async function fetchLotteryData() {
  try {
    resultsLoading.classList.remove('hidden');
    resultsDisplay.classList.add('hidden');

    let parsedResults = [];

    // Step 1: Attempt to load the pre-fetched JSON file directly (very fast, no CORS issue)
    try {
      const jsonResponse = await fetch('./data/kqsx.json');
      if (jsonResponse.ok) {
        parsedResults = await jsonResponse.json();
        console.log("Loaded lottery data successfully from local JSON.");
      } else {
        throw new Error("Local JSON file not found or status not OK");
      }
    } catch (jsonErr) {
      console.warn("Could not load local data/kqsx.json, falling back to CORS proxies:", jsonErr);
    }

    // Step 2: Fallback to direct RSS fetch using a list of CORS proxies
    if (!parsedResults || parsedResults.length === 0) {
      const rssUrl = 'https://kqxs.net.vn/rss-feed/xo-so-mien-bac-xsmb-xstd.rss';
      const CORS_PROXIES = [
        url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
        url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
      ];

      let xml = null;
      for (const getProxyUrl of CORS_PROXIES) {
        try {
          const proxyUrl = getProxyUrl(rssUrl);
          console.log(`Trying CORS proxy: ${proxyUrl}`);
          const response = await fetch(proxyUrl);
          if (response.ok) {
            const text = await response.text();
            if (text && text.includes('<item>')) {
              xml = text;
              break;
            }
          }
        } catch (proxyErr) {
          console.warn("Proxy attempt failed:", proxyErr);
        }
      }

      if (xml) {
        parsedResults = parseRSS(xml);
      }
    }

    if (parsedResults && parsedResults.length > 0) {
      const stats = calculateStatsAndPredictions(parsedResults);
      globalResultsData = {
        success: true,
        results: parsedResults,
        stats
      };

      populateDateSelect(parsedResults);
      renderResultBoard(parsedResults[0]);
      renderStatistics(stats);
      renderPredictions(stats);
      renderProbabilities(stats.probabilities);

      resultsLoading.classList.add('hidden');
      resultsDisplay.classList.remove('hidden');
    } else {
      throw new Error("No lottery data could be fetched from local JSON or live RSS.");
    }
  } catch (error) {
    console.error("Error fetching lottery data, loading fallback mock data:", error);
    loadFallbackMockData();
  }
}

function loadFallbackMockData() {
  mockData.forEach(item => {
    if (!item.dateDisplay) {
      const matchDate = item.title.match(/ngày\s+([\d/]+)/i);
      const datePart = matchDate ? matchDate[1] : item.pubDate;
      const weekdayMatch = item.title.match(/\(([^)]+)\)/);
      const weekday = weekdayMatch ? ` (${weekdayMatch[1]})` : '';
      item.dateDisplay = `${datePart}${weekday}`;
    }
  });

  const stats = calculateStatsAndPredictions(mockData);
  globalResultsData = {
    success: true,
    results: mockData,
    stats
  };

  populateDateSelect(mockData);
  renderResultBoard(mockData[0]);
  renderStatistics(stats);
  renderPredictions(stats);
  renderProbabilities(stats.probabilities);

  resultsLoading.classList.add('hidden');
  resultsDisplay.classList.remove('hidden');
}

function decodeHtmlEntities(str) {
  return str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

function parseDescription(desc) {
  const markers = [
    { key: 'db', start: 'ĐB:', end: '1:' },
    { key: 'g1', start: '1:', end: '2:' },
    { key: 'g2', start: '2:', end: '3:' },
    { key: 'g3', start: '3:', end: '4:' },
    { key: 'g4', start: '4:', end: '5:' },
    { key: 'g5', start: '5:', end: '6:' },
    { key: 'g6', start: '6:', end: '7:' },
    { key: 'g7', start: '7:', end: null }
  ];

  const prizes = {};
  markers.forEach(m => {
    let startIdx = desc.indexOf(m.start);
    if (startIdx !== -1) {
      startIdx += m.start.length;
      let endIdx = m.end ? desc.indexOf(m.end) : desc.length;
      if (endIdx !== -1 && endIdx > startIdx) {
        const val = desc.substring(startIdx, endIdx).trim();
        prizes[m.key] = val.split('-').map(x => x.trim()).filter(Boolean);
      } else {
        prizes[m.key] = [];
      }
    } else {
      prizes[m.key] = [];
    }
  });
  return prizes;
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];
    
    const title = (itemContent.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || '';
    const description = (itemContent.match(/<description>([\s\S]*?)<\/description>/i) || [])[1] || '';
    const link = (itemContent.match(/<link>([\s\S]*?)<\/link>/i) || [])[1] || '';
    const pubDate = (itemContent.match(/<pubdate>([\s\S]*?)<\/pubdate>/i) || [])[1] || '';
    
    const prizes = parseDescription(description);
    const decodedTitle = decodeHtmlEntities(title);
    
    const matchDate = decodedTitle.match(/ngày\s+([\d/]+)/i) || decodedTitle.match(/ngay\s+([\d/]+)/i);
    let dateDisplay = '';
    if (matchDate) {
      const datePart = matchDate[1];
      const weekdayMatch = decodedTitle.match(/\(([^)]+)\)/);
      const weekday = weekdayMatch ? ` (${weekdayMatch[1]})` : '';
      dateDisplay = `${datePart}${weekday}`;
    } else {
      dateDisplay = pubDate.trim();
    }
    
    items.push({
      title: decodedTitle,
      pubDate: pubDate.trim(),
      dateDisplay: dateDisplay,
      link: link.trim(),
      prizes
    });
  }
  return items;
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
  document.getElementById('board-date-title').textContent = drawData.title.toUpperCase();

  const prizes = drawData.prizes;

  document.getElementById('val-db').textContent = prizes.db.join(' - ');
  document.getElementById('val-g1').textContent = prizes.g1.join(' - ');
  document.getElementById('val-g2').textContent = prizes.g2.join(' - ');
  document.getElementById('val-g3').textContent = prizes.g3.join(' - ');
  document.getElementById('val-g4').textContent = prizes.g4.join(' - ');
  document.getElementById('val-g5').textContent = prizes.g5.join(' - ');
  document.getElementById('val-g6').textContent = prizes.g6.join(' - ');
  document.getElementById('val-g7').textContent = prizes.g7.join(' - ');

  renderDauDuoiBoards(prizes);
}

function renderDauDuoiBoards(prizes) {
  const lotos = [];
  Object.values(prizes).forEach(arr => {
    arr.forEach(num => {
      if (num && num.length >= 2) {
        lotos.push(num.substring(num.length - 2));
      }
    });
  });

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

  const dauBody = document.getElementById('loto-dau-body');
  dauBody.innerHTML = '';
  for (let i = 0; i <= 9; i++) {
    const row = document.createElement('tr');
    const tdDau = document.createElement('td');
    tdDau.textContent = i;
    
    const tdLotos = document.createElement('td');
    const sortedLotos = dauMap[i].sort().map(num => {
      const isDe = prizes.db[0] && prizes.db[0].endsWith(num);
      return isDe ? `<span class="text-gold font-bold">${num}</span>` : num;
    });
    tdLotos.innerHTML = sortedLotos.join(', ') || '<span style="color: var(--text-secondary); opacity: 0.5;">-</span>';
    
    row.appendChild(tdDau);
    row.appendChild(tdLotos);
    dauBody.appendChild(row);
  }

  const duoiBody = document.getElementById('loto-duoi-body');
  duoiBody.innerHTML = '';
  for (let i = 0; i <= 9; i++) {
    const row = document.createElement('tr');
    const tdDuoi = document.createElement('td');
    tdDuoi.textContent = i;
    tdDuoi.style.color = 'var(--accent-purple)';
    
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
// STATS & PREDICTIONS CALCULATOR (100% DETERMINISTIC)
// --------------------------------------------------
function calculateStatsAndPredictions(results) {
  if (!results || results.length === 0) return {};

  const frequencyMap = {};
  const lastSeenIndex = {};

  for (let i = 0; i < 100; i++) {
    const numStr = i.toString().padStart(2, '0');
    frequencyMap[numStr] = 0;
    lastSeenIndex[numStr] = -1;
  }

  results.forEach((draw, drawIdx) => {
    const lotoList = [];
    Object.values(draw.prizes).forEach(prizeArray => {
      prizeArray.forEach(num => {
        if (num.length >= 2) {
          const loto = num.substring(num.length - 2);
          lotoList.push(loto);
          frequencyMap[loto] = (frequencyMap[loto] || 0) + 1;
          if (lastSeenIndex[loto] === -1) {
            lastSeenIndex[loto] = drawIdx;
          }
        }
      });
    });
    draw.lotoList = lotoList;
    draw.de = draw.prizes.db[0] ? draw.prizes.db[0].substring(draw.prizes.db[0].length - 2) : '';
  });

  const frequencies = Object.entries(frequencyMap).map(([num, count]) => ({
    number: num,
    count
  })).sort((a, b) => b.count - a.count);

  const ganList = Object.entries(lastSeenIndex).map(([num, idx]) => ({
    number: num,
    daysAgo: idx === -1 ? results.length + 5 : idx
  })).sort((a, b) => b.daysAgo - a.daysAgo);

  const latestLotos = new Set(results[0]?.lotoList || []);
  const hotNotLatest = frequencies.find(f => !latestLotos.has(f.number));
  const bachThu = hotNotLatest ? hotNotLatest.number : frequencies[0].number;

  const songThuCandidates = frequencies.filter(f => !latestLotos.has(f.number)).slice(0, 2);
  let songThu = songThuCandidates.map(c => c.number);
  if (songThu.length < 2) {
    songThu = [frequencies[0].number, frequencies[1].number];
  }

  const deHistory = results.map(r => r.de).filter(Boolean);
  const digitCounts = {};
  for (let i = 0; i <= 9; i++) digitCounts[i] = 0;
  deHistory.forEach(d => {
    if (d.length === 2) {
      digitCounts[parseInt(d[0])] += 1;
      digitCounts[parseInt(d[1])] += 1;
    }
  });
  
  const sortedDigits = Object.entries(digitCounts).sort((a, b) => b[1] - a[1]);
  const topDigit = sortedDigits[0] ? sortedDigits[0][0] : '7';
  
  const danDe10 = [];
  for (let i = 0; i <= 9; i++) {
    danDe10.push(`${topDigit}${i}`);
  }

  const top3Digits = sortedDigits.slice(0, 3).map(x => x[0]);
  const danDe36 = [];
  for (let i = 0; i < 100; i++) {
    const s = i.toString().padStart(2, '0');
    if (top3Digits.includes(s[0]) || top3Digits.includes(s[1])) {
      if (danDe36.length < 36) {
        danDe36.push(s);
      }
    }
  }
  let fillIdx = 0;
  while (danDe36.length < 36 && fillIdx < 100) {
    const s = fillIdx.toString().padStart(2, '0');
    if (!danDe36.includes(s)) danDe36.push(s);
    fillIdx++;
  }

  // Calculate probabilities 00-99
  const probabilities = {};
  const startDigitCounts = {};
  const endDigitCounts = {};
  for (let i = 0; i <= 9; i++) {
    startDigitCounts[i] = 0;
    endDigitCounts[i] = 0;
  }
  deHistory.forEach(d => {
    if (d.length === 2) {
      startDigitCounts[parseInt(d[0])] += 1;
      endDigitCounts[parseInt(d[1])] += 1;
    }
  });

  for (let i = 0; i < 100; i++) {
    const numStr = i.toString().padStart(2, '0');
    const count = frequencyMap[numStr] || 0;
    const daysAgo = lastSeenIndex[numStr] === -1 ? results.length + 5 : lastSeenIndex[numStr];

    let lotoProb = 23.8;
    if (count > 4) {
      lotoProb += 3.5;
    } else if (count >= 2) {
      lotoProb += 1.2;
    } else {
      lotoProb -= 2.5;
    }

    if (daysAgo === 0) {
      lotoProb += 2.8;
    } else if (daysAgo >= 8) {
      lotoProb += 4.5;
    } else if (daysAgo >= 4) {
      lotoProb += 2.0;
    } else {
      lotoProb -= 1.0;
    }

    const digitSum = parseInt(numStr[0]) + parseInt(numStr[1]);
    lotoProb += (digitSum % 3 === 0) ? 0.8 : -0.5;
    lotoProb = Math.min(42.0, Math.max(12.0, lotoProb));

    let deProb = 1.0;
    const startDigit = parseInt(numStr[0]);
    const endDigit = parseInt(numStr[1]);
    const startFreq = startDigitCounts[startDigit] || 0;
    const endFreq = endDigitCounts[endDigit] || 0;

    deProb += (startFreq * 0.15) + (endFreq * 0.15);

    if (numStr[0] === numStr[1]) {
      const latestDeDoublet = deHistory.slice(0, 5).some(d => d[0] === d[1]);
      deProb += latestDeDoublet ? -0.2 : 0.4;
    }
    deProb = Math.min(3.8, Math.max(0.4, deProb));

    probabilities[numStr] = {
      number: numStr,
      lotoChance: Math.round(lotoProb * 10) / 10,
      deChance: Math.round(deProb * 10) / 10,
      frequency: count,
      daysAgo: daysAgo
    };
  }

  // Calculate full predicted board
  const predictedBoard = {
    db: [predictPrizeSlot(results.map(r => r.prizes.db[0]), 5)],
    g1: [predictPrizeSlot(results.map(r => r.prizes.g1[0]), 5)],
    g2: [
      predictPrizeSlot(results.map(r => r.prizes.g2[0]), 5),
      predictPrizeSlot(results.map(r => r.prizes.g2[1]), 5)
    ],
    g3: [
      predictPrizeSlot(results.map(r => r.prizes.g3[0]), 5),
      predictPrizeSlot(results.map(r => r.prizes.g3[1]), 5),
      predictPrizeSlot(results.map(r => r.prizes.g3[2]), 5),
      predictPrizeSlot(results.map(r => r.prizes.g3[3]), 5),
      predictPrizeSlot(results.map(r => r.prizes.g3[4]), 5),
      predictPrizeSlot(results.map(r => r.prizes.g3[5]), 5)
    ],
    g4: [
      predictPrizeSlot(results.map(r => r.prizes.g4[0]), 4),
      predictPrizeSlot(results.map(r => r.prizes.g4[1]), 4),
      predictPrizeSlot(results.map(r => r.prizes.g4[2]), 4),
      predictPrizeSlot(results.map(r => r.prizes.g4[3]), 4)
    ],
    g5: [
      predictPrizeSlot(results.map(r => r.prizes.g5[0]), 4),
      predictPrizeSlot(results.map(r => r.prizes.g5[1]), 4),
      predictPrizeSlot(results.map(r => r.prizes.g5[2]), 4),
      predictPrizeSlot(results.map(r => r.prizes.g5[3]), 4),
      predictPrizeSlot(results.map(r => r.prizes.g5[4]), 4),
      predictPrizeSlot(results.map(r => r.prizes.g5[5]), 4)
    ],
    g6: [
      predictPrizeSlot(results.map(r => r.prizes.g6[0]), 3),
      predictPrizeSlot(results.map(r => r.prizes.g6[1]), 3),
      predictPrizeSlot(results.map(r => r.prizes.g6[2]), 3)
    ],
    g7: [
      predictPrizeSlot(results.map(r => r.prizes.g7[0]), 2),
      predictPrizeSlot(results.map(r => r.prizes.g7[1]), 2),
      predictPrizeSlot(results.map(r => r.prizes.g7[2]), 2),
      predictPrizeSlot(results.map(r => r.prizes.g7[3]), 2)
    ]
  };

  return {
    frequencies: frequencies,
    loloGan: ganList,
    probabilities: Object.values(probabilities),
    predictions: {
      bachThu,
      songThu,
      danDe10,
      danDe36,
      predictedBoard,
      date: results[0] ? (results[0].dateDisplay || results[0].pubDate) : new Date().toLocaleDateString('vi-VN')
    }
  };
}

function predictPrizeSlot(historyArray, length) {
  let predicted = '';
  for (let pos = 0; pos < length; pos++) {
    const counts = {};
    for (let i = 0; i <= 9; i++) counts[i] = 0;
    
    let activeCounts = 0;
    historyArray.forEach(num => {
      if (num && num.length >= length) {
        const char = num[num.length - length + pos];
        if (char >= '0' && char <= '9') {
          counts[parseInt(char)]++;
          activeCounts++;
        }
      }
    });

    let maxDigit = 0;
    let maxCount = -1;
    for (let i = 0; i <= 9; i++) {
      if (counts[i] > maxCount) {
        maxCount = counts[i];
        maxDigit = i;
      }
    }
    
    if (maxCount === 0 || activeCounts === 0) {
      predicted += Math.floor(pos * 3) % 10;
    } else {
      predicted += maxDigit;
    }
  }
  return predicted;
}

// --------------------------------------------------
// STATS & PREDICTIONS UI RENDERERS
// --------------------------------------------------
function renderStatistics(stats) {
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
  document.getElementById('prediction-date').textContent = pred.date;
  document.getElementById('pred-bach-thu').textContent = pred.bachThu;

  const songThuContainer = document.getElementById('pred-song-thu');
  songThuContainer.innerHTML = `
    <span>${pred.songThu[0]}</span>
    <span style="color: var(--text-secondary); font-size: 2.5rem; display: flex; align-items: center;">-</span>
    <span>${pred.songThu[1] || ''}</span>
  `;

  const dan10Container = document.getElementById('dan-de-10');
  dan10Container.innerHTML = '';
  pred.danDe10.forEach(num => {
    const bubble = document.createElement('span');
    bubble.className = 'bubble';
    bubble.textContent = num;
    dan10Container.appendChild(bubble);
  });

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
  filterProbabilities();
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

function spinSlotAnim(elementId, digitCount, duration, targetValue) {
  return new Promise((resolve) => {
    const el = document.getElementById(elementId);
    el.classList.add('simulating');
    
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
      el.innerText = targetValue;
      resolve(targetValue);
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

  if (!globalResultsData || !globalResultsData.stats || !globalResultsData.stats.predictions || !globalResultsData.stats.predictions.predictedBoard) {
    alert("Dữ liệu dự toán chưa sẵn sàng để quay thử!");
    isSimulating = false;
    spinBtn.disabled = false;
    spinBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Bắt đầu quay thử';
    return;
  }

  const board = globalResultsData.stats.predictions.predictedBoard;

  const slotValueMap = {
    'sim-db': board.db[0],
    'sim-g1': board.g1[0],
    'sim-g2-0': board.g2[0],
    'sim-g2-1': board.g2[1],
    'sim-g3-0': board.g3[0],
    'sim-g3-1': board.g3[1],
    'sim-g3-2': board.g3[2],
    'sim-g3-3': board.g3[3],
    'sim-g3-4': board.g3[4],
    'sim-g3-5': board.g3[5],
    'sim-g4-0': board.g4[0],
    'sim-g4-1': board.g4[1],
    'sim-g4-2': board.g4[2],
    'sim-g4-3': board.g4[3],
    'sim-g5-0': board.g5[0],
    'sim-g5-1': board.g5[1],
    'sim-g5-2': board.g5[2],
    'sim-g5-3': board.g5[3],
    'sim-g5-4': board.g5[4],
    'sim-g5-5': board.g5[5],
    'sim-g6-0': board.g6[0],
    'sim-g6-1': board.g6[1],
    'sim-g6-2': board.g6[2],
    'sim-g7-0': board.g7[0],
    'sim-g7-1': board.g7[1],
    'sim-g7-2': board.g7[2],
    'sim-g7-3': board.g7[3]
  };

  for (let i = 0; i < simSlots.length; i++) {
    const slot = simSlots[i];
    const targetVal = slotValueMap[slot.id] || '-'.repeat(slot.digits);
    await spinSlotAnim(slot.id, slot.digits, 400, targetVal);
  }

  const dbEl = document.getElementById('sim-db');
  if (dbEl) dbEl.classList.add('val-highlight');

  isSimulating = false;
  spinBtn.disabled = false;
  spinBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> Bắt đầu quay thử';
}

// --------------------------------------------------
// DREAM DICTIONARY (SỔ MƠ LÔ ĐỀ)
// --------------------------------------------------
let dreamSearchTimeout = null;

function loadInitialDreams() {
  renderDreams(dreamsDatabase.slice(0, 12));
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
  const query = document.getElementById('dream-input').value.trim().toLowerCase();
  
  clearTimeout(dreamSearchTimeout);
  dreamSearchTimeout = setTimeout(() => {
    const titleEl = document.getElementById('dream-results-title');
    if (query === '') {
      titleEl.textContent = 'Giấc Mơ Gợi Ý';
      loadInitialDreams();
      return;
    }
    
    titleEl.textContent = `Kết quả tìm kiếm cho: "${query}"`;
    const matches = dreamsDatabase.filter(item => 
      item.keyword.toLowerCase().includes(query) || 
      item.numbers.includes(query)
    );
    renderDreams(matches);
  }, 250);
}

function clearDreamSearch() {
  const input = document.getElementById('dream-input');
  input.value = '';
  searchDreams();
  input.focus();
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

  const elementSuffixes = {
    'Kim': ['9', '2', '8'],
    'Mộc': ['3', '4'],
    'Thủy': ['6', '1'],
    'Hỏa': ['7', '2'],
    'Thổ': ['0', '5']
  };

  const suffixes = elementSuffixes[data.element] || ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  const matchingProbs = globalResultsData.stats.probabilities.filter(p => {
    const lastDigit = p.number[1];
    return suffixes.includes(lastDigit);
  });

  const sortedLoto = [...matchingProbs].sort((a, b) => b.lotoChance - a.lotoChance);
  const sortedDe = [...matchingProbs].sort((a, b) => b.deChance - a.deChance);

  const lotoVal = (gender === 'female' && sortedLoto.length > 1) ? sortedLoto[1].number : sortedLoto[0].number;
  const deVal = (gender === 'female' && sortedDe.length > 1) ? sortedDe[0].number : sortedDe[0].number;

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
