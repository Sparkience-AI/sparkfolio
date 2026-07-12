const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// I will dump the old index html from git AGAIN because it was deleted
const { execSync } = require('child_process');
const oldHtml = execSync('git show b669c86:index.html').toString('utf8');

const bodyStart = html.indexOf('<body>');
const oldBodyStart = oldHtml.indexOf('<body>');

function getBlock(sourceHtml, summaryText, startIdxLimit) {
    const sIdx = sourceHtml.indexOf(summaryText, startIdxLimit);
    if (sIdx === -1) return null;
    const startIdx = sourceHtml.lastIndexOf('<details>', sIdx);
    
    let currentIdx = startIdx + 9;
    let depth = 1;
    while (depth > 0 && currentIdx < sourceHtml.length) {
        const nextOpen = sourceHtml.indexOf('<details>', currentIdx);
        const nextClose = sourceHtml.indexOf('</details>', currentIdx);
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
    while (actualStart > 0 && (sourceHtml[actualStart - 1] === ' ' || sourceHtml[actualStart - 1] === '\t' || sourceHtml[actualStart - 1] === '\n')) {
        actualStart--;
    }
    return sourceHtml.slice(actualStart, currentIdx);
}

const glossaryBlock = getBlock(html, 'KEY TERMS GLOSSARY', bodyStart);
const researchBlock = getBlock(oldHtml, 'RESEARCH INTEGRITY &amp; REFERENCES', oldBodyStart);

if (!glossaryBlock || !researchBlock) {
    console.error("Failed to extract blocks", !!glossaryBlock, !!researchBlock);
    process.exit(1);
}

const appIdx = html.indexOf('APPENDIX & RESOURCES', bodyStart);
if (appIdx === -1) {
    console.error("Failed to find APPENDIX & RESOURCES");
    process.exit(1);
}

const wrapperStart = html.lastIndexOf('<div class="mt-8 border-t pt-8">', appIdx);
let currentIdx = wrapperStart + 4;
let depth = 1;
while (depth > 0 && currentIdx < html.length) {
    const nextOpen = html.indexOf('<div', currentIdx);
    const nextClose = html.indexOf('</div>', currentIdx);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        currentIdx = nextOpen + 4;
    } else {
        depth--;
        currentIdx = nextClose + 6;
    }
}

const replacement = '\n          ' + glossaryBlock.trim() + '\n          ' + researchBlock.trim() + '\n';
html = html.slice(0, wrapperStart) + replacement + html.slice(currentIdx);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Restored bottom section successfully!');
