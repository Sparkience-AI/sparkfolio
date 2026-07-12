const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('index.html', 'utf8');
const $ = cheerio.load(html, { decodeEntities: false });

const faqs = [];
$('details').each(function() {
    const summary = $(this).find('summary');
    if (!summary.length) return;
    
    let titleText = summary.text().trim();
    // Normalize spaces
    titleText = titleText.replace(/\s+/g, ' ').trim();
    
    const content = $(this).find('.details-content');
    if (!content.length) return;
    
    let answerText = content.text().replace(/\s+/g, ' ').trim();
    
    faqs.push({
        "@type": "Question",
        "name": titleText,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": answerText
        }
    });
});

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs
};

const scriptRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/;
const newScriptContent = JSON.stringify(jsonLd, null, 2);
const newHtml = html.replace(scriptRegex, () => `<script type="application/ld+json">\n${newScriptContent}\n    </script>`);
fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('JSON-LD updated safely! Total entries:', faqs.length);
