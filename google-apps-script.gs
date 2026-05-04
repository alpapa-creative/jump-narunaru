const SPREADSHEET_ID = '1-R6KaGYbttNxMPQ85FgC4zg68hZfGPcg4LKjmS8Auqs';
const SHEET_NAME = 'scores';
const HEADERS = [
  'timestamp',
  'name',
  'floor',
  'title',
  'type',
  'missCount',
  'jumpCount',
  'userAgent'
];

function setupRankingSheet() {
  const sheet = getScoreSheet_();
  ensureHeaders_(sheet);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const callback = params.callback || '';

  try {
    const action = String(params.action || 'ranking').toLowerCase();
    if (action === 'submit') {
      const result = appendScore_(params);
      return respond_({
        ok: true,
        rank: result.rank,
        ranking: result.ranking
      }, callback);
    }

    return respond_({
      ok: true,
      ranking: getRanking_(toInt_(params.limit, 10, 1, 50))
    }, callback);
  } catch (error) {
    return respond_({
      ok: false,
      error: error && error.message ? error.message : String(error)
    }, callback);
  }
}

function appendScore_(params) {
  const sheet = getScoreSheet_();
  ensureHeaders_(sheet);

  const row = [
    new Date(),
    cleanName_(params.name),
    toInt_(params.floor, 0, 0, 9999),
    cleanText_(params.title, 40),
    cleanText_(params.type, 40),
    toInt_(params.missCount, 0, 0, 9999),
    toInt_(params.jumpCount, 0, 0, 9999),
    cleanText_(params.ua || '', 120)
  ];

  sheet.appendRow(row);
  SpreadsheetApp.flush();

  const ranking = getRanking_(10);
  const rank = findSubmittedRank_(ranking, row);
  return { rank: rank, ranking: ranking };
}

function getRanking_(limit) {
  const sheet = getScoreSheet_();
  ensureHeaders_(sheet);

  const values = sheet.getDataRange().getValues();
  if (values.length <= 1) return [];

  return values
    .slice(1)
    .filter(function(row) {
      return row[1] && Number(row[2]) >= 0;
    })
    .map(function(row, index) {
      return {
        sourceIndex: index,
        timestamp: row[0],
        name: cleanName_(row[1]),
        floor: Number(row[2]) || 0,
        title: cleanText_(row[3], 40),
        type: cleanText_(row[4], 40),
        missCount: Number(row[5]) || 0,
        jumpCount: Number(row[6]) || 0
      };
    })
    .sort(function(a, b) {
      if (b.floor !== a.floor) return b.floor - a.floor;
      const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
      const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
      return aTime - bTime;
    })
    .slice(0, limit)
    .map(function(row, index) {
      return {
        rank: index + 1,
        name: row.name,
        floor: row.floor,
        title: row.title,
        type: row.type
      };
    });
}

function findSubmittedRank_(ranking, submittedRow) {
  for (var i = 0; i < ranking.length; i++) {
    if (ranking[i].name === submittedRow[1] && ranking[i].floor === submittedRow[2]) {
      return ranking[i].rank;
    }
  }
  return null;
}

function getScoreSheet_() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('スプレッドシートが見つかりません。SPREADSHEET_IDを設定するか、スプレッドシートに紐づくApps Scriptで実行してください。');
  }

  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function ensureHeaders_(sheet) {
  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const needsHeader = currentHeaders.some(function(value, index) {
    return value !== HEADERS[index];
  });

  if (needsHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
}

function cleanName_(value) {
  const text = cleanText_(value, 10);
  return text || 'NO NAME';
}

function cleanText_(value, maxLength) {
  return String(value || '')
    .replace(/[<>&"']/g, '')
    .trim()
    .slice(0, maxLength);
}

function toInt_(value, defaultValue, min, max) {
  const number = parseInt(value, 10);
  if (isNaN(number)) return defaultValue;
  return Math.max(min, Math.min(max, number));
}

function respond_(payload, callback) {
  const safeCallback = /^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback) ? callback : '';
  const body = safeCallback
    ? safeCallback + '(' + JSON.stringify(payload) + ');'
    : JSON.stringify(payload);

  return ContentService
    .createTextOutput(body)
    .setMimeType(safeCallback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}
