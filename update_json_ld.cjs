const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('index.html', 'utf8');
const scriptRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
const match = html.match(scriptRegex);
if (!match) process.exit(1);

let jsonLd = JSON.parse(match[1]);
const $ = cheerio.load(html, { decodeEntities: false });

function getTextForSection(title) {
    let text = null;
    $('summary').each(function() {
        if ($(this).text().includes(title)) {
            const content = $(this).siblings('.details-content').text() || $(this).parent().text();
            text = content.replace(/\s+/g, ' ').trim();
        }
    });
    
    if (!text && title.includes('RESEARCH INTEGRITY')) {
       $('div').each(function() {
         if ($(this).text().includes('Research Integrity') && $(this).hasClass('font-bold')) {
            text = $(this).parent().text().replace(/\s+/g, ' ').trim();
         }
       });
    }
    return text;
}

let count = 0;
jsonLd.mainEntity.forEach(entity => {
    if (entity.name.includes('What is the Sparkfolio') || entity.name.includes('Conservative Allocation') || entity.name.includes('Moderate Allocation') || entity.name.includes('Aggressive Allocation')) return;
    
    const txt = getTextForSection(entity.name);
    if (txt) {
        entity.acceptedAnswer.text = txt;
        count++;
    }
});

const newScriptContent = JSON.stringify(jsonLd, null, 2);
const newHtml = html.replace(scriptRegex, () => `<script type="application/ld+json">\n${newScriptContent}\n    </script>`);
fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('JSON-LD updated safely! Updated', count, 'entries.');
