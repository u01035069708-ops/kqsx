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
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log("Created directory: data/");
      }
      
      const outputPath = path.join(dataDir, 'kqsx.json');
      fs.writeFileSync(outputPath, JSON.stringify(parsedResults, null, 2), 'utf8');
      console.log(`Successfully wrote ${parsedResults.length} items to ${outputPath}`);
    } else {
      throw new Error("Parsed results array is empty.");
    }
  } catch (error) {
    console.error("Error fetching or parsing RSS feed:", error.message);
    process.exit(1);
  }
}

run();
