const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

function logSize(step) {
    console.log(step, html.length);
}

logSize("Start");

function extractBlock(summaryText) {
    const sIdx = html.indexOf(summaryText);
    if (sIdx === -1) return null;
    const startIdx = html.lastIndexOf('<details>', sIdx);
    let currentIdx = startIdx + 9;
    let depth = 1;
    while (depth > 0 && currentIdx < html.length) {
        const nextOpen = html.indexOf('<details>', currentIdx);
        const nextClose = html.indexOf('</details>', currentIdx);
        if (nextClose === -1) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            currentIdx = nextOpen + 9;
        } else {
            depth--;
            currentIdx = nextClose + 10;
        }
    }
    let actualStart = startIdx;
    while (html[actualStart - 1] === ' ' || html[actualStart - 1] === '\t' || html[actualStart - 1] === '\n') {
        actualStart--;
    }
    const block = html.slice(actualStart, currentIdx).trim();
    html = html.slice(0, actualStart) + html.slice(currentIdx);
    return block;
}

const taxAware = extractBlock('TAX-AWARE INVESTING'); logSize('taxAware');
const wealthAcc = extractBlock('WEALTH ACCELERATION'); logSize('wealthAcc');
const retirement = extractBlock('THE RETIREMENT PLAYBOOK'); logSize('retirement');
const healthCheck = extractBlock('PORTFOLIO HEALTH CHECKLIST'); logSize('healthCheck');
const healthcareIns = extractBlock('HEALTHCARE LIABILITY INSULATION'); logSize('healthcareIns');
const estatePlan = extractBlock('ESTATE PLANNING: THE SUPREME COURT'); logSize('estatePlan');
const lifecycle = extractBlock('AGE-SPECIFIC LIFECYCLE GUIDANCE'); logSize('lifecycle');
const glossary = extractBlock('KEY TERMS GLOSSARY'); logSize('glossary');

