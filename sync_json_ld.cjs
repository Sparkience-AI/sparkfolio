const fs = require('fs');
const { parse } = require('node-html-parser');

const html = fs.readFileSync('index.html', 'utf8');
const root = parse(html);

const faqs = [];
const detailsEls = root.querySelectorAll('details');

for (const details of detailsEls) {
  const summary = details.querySelector('summary');
  if (!summary) continue;
  
  let question = summary.text.trim();
  question = question.replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  
  const contentNode = details.querySelector('.details-content');
  if (!contentNode) continue;
  
  // Format HTML properly like before
  let answerHtml = contentNode.outerHTML.trim();
  
  faqs.push({
    "@type": "Question",
    "name": question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": answerHtml
    }
  });
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs
};

const jsonString = JSON.stringify(jsonLd);

const newHtml = html.replace(
  /<script type="application\/ld\+json">[\s\S]*?<\/script>/,
  `<script type="application/ld+json">\n${jsonString}\n    </script>`
);

fs.writeFileSync('index.html', newHtml, 'utf8');
console.log('Successfully generated and injected JSON-LD.');
