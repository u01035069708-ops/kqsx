const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Cache configuration
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Mock data in case the external website is down or rate-limited
const mockData = [
  {
    title: "Kết quả xổ số Miền Bắc (Hà Nội) ngày 05/07/2026 (Chủ Nhật)",
    pubDate: "05/07/2026",
    link: "https://xosodaiphat.com/xsmb-05-07-2026.html",
    prizes: {
      db: ["84620"],
      g1: ["39572"],
      g2: ["72615", "83940"],
      g3: ["12039", "85621", "49301", "72648", "91023", "38472"],
      g4: ["7482", "9103", "8472", "6391"],
      g5: ["8472", "9102", "3847", "1290", "7483", "9201"],
      g6: ["738", "920", "182"],
      g7: ["84", "92", "10", "47"]
    }
  },
  {
    title: "Kết quả xổ số Miền Bắc (Hà Nội) ngày 02/07/2026 (Thứ 5)",
    pubDate: "02/07/2026",
    link: "https://xosodaiphat.com/xsmb-02-07-2026.html",
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
  },
  {
    title: "Kết quả xổ số Miền Bắc (Hà Nội) ngày 29/06/2026 (Thứ 2)",
    pubDate: "29/06/2026",
    link: "https://xosodaiphat.com/xsmb-29-06-2026.html",
    prizes: {
      db: ["37642"],
      g1: ["47110"],
      g2: ["81418", "41783"],
      g3: ["28815", "70574", "27729", "66429", "04690", "34208"],
      g4: ["3076", "9255", "1860", "8838"],
      g5: ["5877", "1562", "7701", "6084", "7290", "1945"],
      g6: ["244", "631", "879"],
      g7: ["94", "08", "93", "70"]
    }
  }
];

// HTML Decoder helper
function decodeHtmlEntities(str) {
  return str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

// Regex XML description parser
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

// Parse RSS XML string into JSON structure
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
    
    // Normalize dateDisplay from title: e.g. "KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY 04/07 (Thứ Bảy)" -> "04/07 (Thứ Bảy)"
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

// Calculate lottery statistics & generate predictions
function calculateStatsAndPredictions(results) {
  if (!results || results.length === 0) return {};

  const frequencyMap = {};
  const lastSeenIndex = {};

  // Initialize
  for (let i = 0; i < 100; i++) {
    const numStr = i.toString().padStart(2, '0');
    frequencyMap[numStr] = 0;
    lastSeenIndex[numStr] = -1;
  }

  // Scan history to calculate statistics (latest draws first)
  results.forEach((draw, drawIdx) => {
    const lotoList = [];
    Object.values(draw.prizes).forEach(prizeArray => {
      prizeArray.forEach(num => {
        if (num.length >= 2) {
          const loto = num.substring(num.length - 2);
          lotoList.push(loto);
          frequencyMap[loto] = (frequencyMap[loto] || 0) + 1;
          if (lastSeenIndex[loto] === -1) {
            lastSeenIndex[loto] = drawIdx; // Days since last seen
          }
        }
      });
    });
    draw.lotoList = lotoList;
    draw.de = draw.prizes.db[0] ? draw.prizes.db[0].substring(draw.prizes.db[0].length - 2) : '';
  });

  // Calculate frequencies
  const frequencies = Object.entries(frequencyMap).map(([num, count]) => ({
    number: num,
    count
  })).sort((a, b) => b.count - a.count);

  // Calculate dry spell (gan) - index indicates draws since last seen
  const ganList = Object.entries(lastSeenIndex).map(([num, idx]) => ({
    number: num,
    daysAgo: idx === -1 ? results.length + 5 : idx // If never seen in feed, assume longer dry spell
  })).sort((a, b) => b.daysAgo - a.daysAgo);

  // Algorithms for Prediction
  // 1. Bạch thủ lô: Pick the top frequency number that did NOT appear in the latest draw
  const latestLotos = new Set(results[0]?.lotoList || []);
  const hotNotLatest = frequencies.find(f => !latestLotos.has(f.number));
  const bachThu = hotNotLatest ? hotNotLatest.number : frequencies[0].number;

  // 2. Song thủ lô: Top 2 hot numbers not in the latest draw, or their reverse
  const songThuCandidates = frequencies.filter(f => !latestLotos.has(f.number)).slice(0, 2);
  let songThu = songThuCandidates.map(c => c.number);
  if (songThu.length < 2) {
    songThu = [frequencies[0].number, frequencies[1].number];
  }

  // 3. Dàn đề 10 số (Special Prize prediction): Analyze historical Special Prizes (de)
  const deHistory = results.map(r => r.de).filter(Boolean);
  const digitCounts = {};
  for (let i = 0; i <= 9; i++) digitCounts[i] = 0;
  deHistory.forEach(d => {
    if (d.length === 2) {
      digitCounts[parseInt(d[0])] += 1;
      digitCounts[parseInt(d[1])] += 1;
    }
  });
  
  // Find top digit appearing in DB
  const sortedDigits = Object.entries(digitCounts).sort((a, b) => b[1] - a[1]);
  const topDigit = sortedDigits[0] ? sortedDigits[0][0] : '7';
  
  const danDe10 = [];
  for (let i = 0; i <= 9; i++) {
    danDe10.push(`${topDigit}${i}`);
  }

  // 4. Dàn đề 36 số: Pick numbers that contain the top 3 digits
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
  // Fill if less than 36
  let fillIdx = 0;
  while (danDe36.length < 36 && fillIdx < 100) {
    const s = fillIdx.toString().padStart(2, '0');
    if (!danDe36.includes(s)) danDe36.push(s);
    fillIdx++;
  }

  // Calculate probability for all numbers from 00 to 99
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

    // Baseline loto prob is 23.8%
    let lotoProb = 23.8;

    // Adjust based on frequency (average count in 10 draws is 2.7)
    if (count > 4) {
      lotoProb += 3.5;
    } else if (count >= 2) {
      lotoProb += 1.2;
    } else {
      lotoProb -= 2.5;
    }

    // Adjust based on dry spell (gan)
    if (daysAgo === 0) {
      lotoProb += 2.8; // Reappear chance (lô rơi)
    } else if (daysAgo >= 8) {
      lotoProb += 4.5; // High chance to break gan
    } else if (daysAgo >= 4) {
      lotoProb += 2.0;
    } else {
      lotoProb -= 1.0;
    }

    // Add minor deterministic fluctuation based on digit sum
    const digitSum = parseInt(numStr[0]) + parseInt(numStr[1]);
    lotoProb += (digitSum % 3 === 0) ? 0.8 : -0.5;

    // Clamp between 12% and 42%
    lotoProb = Math.min(42.0, Math.max(12.0, lotoProb));

    // Special Prize (Đề) Probability: baseline 1.0%
    let deProb = 1.0;
    const startDigit = parseInt(numStr[0]);
    const endDigit = parseInt(numStr[1]);

    // Adjust based on head/tail digit frequencies in past DBs
    const startFreq = startDigitCounts[startDigit] || 0;
    const endFreq = endDigitCounts[endDigit] || 0;

    deProb += (startFreq * 0.15) + (endFreq * 0.15);

    // Kép (doublet) adjustment
    if (numStr[0] === numStr[1]) {
      const latestDeDoublet = deHistory.slice(0, 5).some(d => d[0] === d[1]);
      deProb += latestDeDoublet ? -0.2 : 0.4;
    }

    // Clamp between 0.4% and 3.8%
    deProb = Math.min(3.8, Math.max(0.4, deProb));

    probabilities[numStr] = {
      number: numStr,
      lotoChance: Math.round(lotoProb * 10) / 10,
      deChance: Math.round(deProb * 10) / 10,
      frequency: count,
      daysAgo: daysAgo
    };
  }

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

// Route to fetch and process lottery data
app.get('/api/results', async (req, res) => {
  const now = Date.now();
  if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
    return res.json(cachedData);
  }

  try {
    const response = await axios.get('https://kqxs.net.vn/rss-feed/xo-so-mien-bac-xsmb-xstd.rss', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const parsedResults = parseRSS(response.data);
    
    if (parsedResults.length > 0) {
      const stats = calculateStatsAndPredictions(parsedResults);
      cachedData = {
        success: true,
        source: 'live',
        results: parsedResults,
        stats
      };
      lastFetchTime = now;
      return res.json(cachedData);
    } else {
      throw new Error("Empty items parsed");
    }
  } catch (error) {
    console.error("Error fetching RSS feed, serving fallback mock data:", error.message);
    
    // Inject dateDisplay into mockData
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
    return res.json({
      success: true,
      source: 'mock_fallback',
      results: mockData,
      stats
    });
  }
});

// Load Dream dictionary
let dreamsDatabase = [];
const dreamsPath = path.join(__dirname, 'dreams.json');
try {
  if (fs.existsSync(dreamsPath)) {
    dreamsDatabase = JSON.parse(fs.readFileSync(dreamsPath, 'utf8'));
  }
} catch (e) {
  console.error("Error loading dreams database:", e);
}

// Search Dream dictionary
app.get('/api/dreams', (req, res) => {
  const query = (req.query.q || '').trim().toLowerCase();
  if (!query) {
    // Return a random selection of 10 dreams as suggestions
    const shuffled = [...dreamsDatabase].sort(() => 0.5 - Math.random());
    return res.json(shuffled.slice(0, 12));
  }

  // Simple keyword matching
  const matches = dreamsDatabase.filter(item => 
    item.keyword.toLowerCase().includes(query) || 
    item.numbers.includes(query)
  );
  
  res.json(matches);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
