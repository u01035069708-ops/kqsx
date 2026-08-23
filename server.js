const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Cache configuration
let cachedData = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Mock data in case the external website is down or rate-limited
const mockData = [
  {
    title: "KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY 05/07 (Chủ Nhật)",
    pubDate: "05/07/2026",
    dateDisplay: "05/07 (Chủ Nhật)",
    link: "https://kqxs.net.vn/xo-so-ngay/mien-bac-xsmb-5-7-2026/",
    prizes: {
      db: ["66771"],
      g1: ["64531"],
      g2: ["53751", "62057"],
      g3: ["22964", "18198", "37503", "11113", "09823", "04737"],
      g4: ["9277", "9799", "6109", "0123"],
      g5: ["0604", "9280", "2063", "1981", "9947", "0517"],
      g6: ["990", "376", "186"],
      g7: ["99", "35", "03", "86"]
    }
  },
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
  },
  {
    title: "KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY 01/07 (Thứ Tư)",
    pubDate: "01/07/2026",
    dateDisplay: "01/07 (Thứ Tư)",
    link: "https://kqxs.net.vn/xo-so-ngay/mien-bac-xsmb-1-7-2026/",
    prizes: {
      db: ["31854"],
      g1: ["28354"],
      g2: ["12465", "72384"],
      g3: ["32906", "04292", "63731", "65959", "51261", "35224"],
      g4: ["6100", "2989", "3278", "6536"],
      g5: ["7660", "3350", "5711", "7836", "2034", "1179"],
      g6: ["131", "832", "553"],
      g7: ["91", "07", "35", "80"]
    }
  },
  {
    title: "KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY 30/06 (Thứ Ba)",
    pubDate: "30/06/2026",
    dateDisplay: "30/06 (Thứ Ba)",
    link: "https://kqxs.net.vn/xo-so-ngay/mien-bac-xsmb-30-6-2026/",
    prizes: {
      db: ["72948"],
      g1: ["83921"],
      g2: ["91823", "02912"],
      g3: ["73821", "90182", "38219", "01928", "82910", "47291"],
      g4: ["7382", "9102", "3829", "0192"],
      g5: ["8392", "0192", "3829", "7281", "9102", "3829"],
      g6: ["738", "910", "281"],
      g7: ["83", "91", "02", "29"]
    }
  },
  {
    title: "KẾT QUẢ XỔ SỐ MIỀN BẮC NGÀY 29/06 (Thứ Hai)",
    pubDate: "29/06/2026",
    dateDisplay: "29/06 (Thứ Hai)",
    link: "https://kqxs.net.vn/xo-so-ngay/mien-bac-xsmb-29-6-2026/",
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

// Calculate predictions history for the last 7 draws
function calculatePredictionsHistory(results) {
  if (!results || results.length === 0) return [];
  
  const history = [];
  // Calculate predictions for up to 7 recent draws (excluding the oldest ones that have no history)
  const daysToCalculate = Math.min(7, results.length);
  
  for (let i = 0; i < daysToCalculate; i++) {
    const currentDraw = results[i];
    const historicalDraws = results.slice(i + 1);
    
    if (historicalDraws.length > 0) {
      const stats = calculateStatsAndPredictions(historicalDraws);
      const pred = stats.predictions;
      
      const lotoList = [];
      Object.values(currentDraw.prizes).forEach(prizeArray => {
        prizeArray.forEach(num => {
          if (num.length >= 2) {
            lotoList.push(num.substring(num.length - 2));
          }
        });
      });
      const de = currentDraw.prizes.db[0] ? currentDraw.prizes.db[0].substring(currentDraw.prizes.db[0].length - 2) : '';
      
      const bachThuHit = lotoList.includes(pred.bachThu);
      const songThuHits = pred.songThu.filter(num => lotoList.includes(num));
      const danDe10Hit = pred.danDe10.includes(de);
      const danDe36Hit = pred.danDe36.includes(de);
      
      history.push({
        date: currentDraw.dateDisplay || currentDraw.pubDate,
        dateTitle: currentDraw.title,
        actual: {
          db: currentDraw.prizes.db[0] || '',
          de: de,
          lotos: lotoList
        },
        predicted: {
          bachThu: pred.bachThu,
          songThu: pred.songThu,
          danDe10: pred.danDe10,
          danDe36: pred.danDe36
        },
        evaluation: {
          bachThuHit,
          songThuHitsCount: songThuHits.length,
          songThuHits: songThuHits,
          danDe10Hit,
          danDe36Hit
        }
      });
    }
  }
  return history;
}

// Merge new draws with existing draws in kqsx.json, remove duplicates, keep top 7
function mergeAndSaveResults(newResults) {
  if (!newResults || newResults.length === 0) return [];

  const dataDir = path.join(__dirname, 'data');
  const kqsxPath = path.join(dataDir, 'kqsx.json');

  let existingResults = [];
  try {
    if (fs.existsSync(kqsxPath)) {
      existingResults = JSON.parse(fs.readFileSync(kqsxPath, 'utf8'));
    }
  } catch (err) {
    console.error("Error reading existing kqsx.json for merge:", err.message);
  }

  // Combine both arrays
  const combined = [...newResults, ...existingResults];

  // Filter out duplicates based on title/date
  const uniqueMap = new Map();
  combined.forEach(item => {
    const key = item.dateDisplay || item.title;
    if (key && !uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  // Convert back to array
  let mergedResults = Array.from(uniqueMap.values());

  // Sort them chronologically descending
  mergedResults.sort((a, b) => {
    const dateA = new Date(a.pubDate || 0);
    const dateB = new Date(b.pubDate || 0);
    
    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      const getYearPart = (item) => {
        const match = item.title.match(/(\d{1,2})\/(\d{1,2})/);
        if (match) {
          return new Date(2026, parseInt(match[2]) - 1, parseInt(match[1])).getTime();
        }
        return 0;
      };
      return getYearPart(b) - getYearPart(a);
    }
    return dateB - dateA;
  });

  // Limit to 7 items
  const finalResults = mergedResults.slice(0, 7);

  // Ensure dataDir exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Save to kqsx.json
  fs.writeFileSync(kqsxPath, JSON.stringify(finalResults, null, 2), 'utf8');
  console.log(`Saved ${finalResults.length} unique results to ${kqsxPath}`);

  return finalResults;
}

// Route to fetch and process lottery data
app.get('/api/results', async (req, res) => {
  const now = Date.now();
  
  // Cache linh hoạt: 1 phút trong giờ quay thưởng (18:00 - 19:00 VN), bình thường 5 phút
  const vnHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })).getHours();
  const activeCacheDuration = (vnHour === 18) ? (1 * 60 * 1000) : CACHE_DURATION;

  if (cachedData && (now - lastFetchTime < activeCacheDuration)) {
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
      const mergedResults = mergeAndSaveResults(parsedResults);
      const stats = calculateStatsAndPredictions(mergedResults);
      
      // Save predictions history
      try {
        const history = calculatePredictionsHistory(mergedResults);
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(path.join(dataDir, 'predictions.json'), JSON.stringify(history, null, 2), 'utf8');
      } catch (err) {
        console.error("Error saving predictions history:", err.message);
      }

      cachedData = {
        success: true,
        source: 'live',
        results: mergedResults,
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

    const mergedResults = mergeAndSaveResults(mockData) || mockData;
    const stats = calculateStatsAndPredictions(mergedResults);

    // Save predictions history for mock
    try {
      const history = calculatePredictionsHistory(mergedResults);
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(path.join(dataDir, 'predictions.json'), JSON.stringify(history, null, 2), 'utf8');
    } catch (err) {
      console.error("Error saving fallback predictions history:", err.message);
    }

    return res.json({
      success: true,
      source: 'mock_fallback',
      results: mergedResults,
      stats
    });
  }
});

// Route to get prediction history of the last 7 days
app.get('/api/predictions-history', (req, res) => {
  const predictionsPath = path.join(__dirname, 'data', 'predictions.json');
  try {
    if (fs.existsSync(predictionsPath)) {
      const data = fs.readFileSync(predictionsPath, 'utf8');
      return res.json(JSON.parse(data));
    }
  } catch (e) {
    console.error("Error reading predictions history:", e);
  }
  
  // Dynamic fallback calculation
  const results = (cachedData && cachedData.results) ? cachedData.results : mockData;
  const history = calculatePredictionsHistory(results);
  res.json(history);
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

// Background auto-fetch task during draw hours (18:00 - 19:00 VN time)
// Runs every 2 minutes. Pulls and updates kqsx.json, predictions.json and cachedData.
setInterval(async () => {
  const vnHour = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" })).getHours();
  if (vnHour !== 18) return;

  console.log("Auto-fetching RSS feed during drawing hour (18:00 - 19:00)...");
  try {
    const response = await axios.get('https://kqxs.net.vn/rss-feed/xo-so-mien-bac-xsmb-xstd.rss', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const parsedResults = parseRSS(response.data);
    if (parsedResults.length > 0) {
      const dataDir = path.join(__dirname, 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Update local files using merge
      const mergedResults = mergeAndSaveResults(parsedResults);
      
      const history = calculatePredictionsHistory(mergedResults);
      fs.writeFileSync(path.join(dataDir, 'predictions.json'), JSON.stringify(history, null, 2), 'utf8');
      
      // Update cache
      const stats = calculateStatsAndPredictions(mergedResults);
      cachedData = {
        success: true,
        source: 'live',
        results: mergedResults,
        stats
      };
      lastFetchTime = Date.now();
      console.log("Auto-fetch completed successfully. Data cache updated.");
    }
  } catch (err) {
    console.error("Auto-fetch failed during drawing hour:", err.message);
  }
}, 2 * 60 * 1000); // 2 minutes interval

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
