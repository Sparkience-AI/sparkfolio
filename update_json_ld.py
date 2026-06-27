import json, re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract UI accordions
details_blocks = re.findall(r'<details[^>]*>(.*?)</details>', html, re.DOTALL)

json_questions = []
for block in details_blocks:
    summary_match = re.search(r'<summary[^>]*>(.*?)</summary>', block, re.DOTALL)
    if summary_match:
        # Extract title text
        title_html = summary_match.group(1)
        # Remove inner tags from title (like SVG icons)
        title_text = re.sub(r'<[^>]+>', '', title_html).strip()
        
        # Extract content
        content_html = block[summary_match.end():].strip()
        
        json_questions.append({
            '@type': 'Question',
            'name': title_text,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': content_html
            }
        })

ld_data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': json_questions
}

new_ld_str = json.dumps(ld_data, ensure_ascii=False)

start_tag = '<script type="application/ld+json">'
end_tag = '</script>'

start_idx = html.find(start_tag)
end_idx = html.find(end_tag, start_idx)

if start_idx != -1 and end_idx != -1:
    new_html = html[:start_idx + len(start_tag)] + '\n' + new_ld_str + '\n' + html[end_idx:]
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print(f'Successfully updated JSON-LD with {len(json_questions)} accordions.')
else:
    print('Could not find script tag.')
