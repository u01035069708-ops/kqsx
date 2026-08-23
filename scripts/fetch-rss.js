const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
    
    // Normalize dateDisplay from title
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

  // Scan history to calculate statistics
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

  // Calculate frequencies
  const frequencies = Object.entries(frequencyMap).map(([num, count]) => ({
    number: num,
    count
  })).sort((a, b) => b.count - a.count);

  // Calculate dry spell (gan)
  const ganList = Object.entries(lastSeenIndex).map(([num, idx]) => ({
    number: num,
    daysAgo: idx === -1 ? results.length + 5 : idx
  })).sort((a, b) => b.daysAgo - a.daysAgo);

  // Predictions Algorithms
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

  const dataDir = path.join(__dirname, '..', 'data');
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

async function run() {
  console.log("Fetching RSS lottery results...");
  const rssUrl = 'https://kqxs.net.vn/rss-feed/xo-so-mien-bac-xsmb-xstd.rss';
  
  try {
    const response = await axios.get(rssUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const parsedResults = parseRSS(response.data);
    
    if (parsedResults.length > 0) {
      const mergedResults = mergeAndSaveResults(parsedResults);

      // Calculate and save predictions history
      try {
        const history = calculatePredictionsHistory(mergedResults);
        const dataDir = path.join(__dirname, '..', 'data');
        const predPath = path.join(dataDir, 'predictions.json');
        fs.writeFileSync(predPath, JSON.stringify(history, null, 2), 'utf8');
        console.log(`Successfully wrote ${history.length} prediction history items to ${predPath}`);
      } catch (predErr) {
        console.error("Error generating or writing predictions history:", predErr.message);
      }
    } else {
      throw new Error("Parsed results array is empty.");
    }
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error.message);
    process.exit(1);
  }
}

run();
