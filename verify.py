import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

tagsToCheck = ['div', 'section', 'details', 'summary', 'main', 'body', 'html', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 'span', 'p', 'ul', 'li', 'a']

errors = 0
for tag in tagsToCheck:
    openCount = len(re.findall(r'<' + tag + r'\b', html, re.IGNORECASE))
    closeCount = len(re.findall(r'</' + tag + r'>', html, re.IGNORECASE))
    
    # Ignore p and li because HTML5 allows them to be unclosed, though it's good practice
    if openCount != closeCount and tag not in ['p', 'li', 'a']:
        print(f"Mismatch for <{tag}>: {openCount} open, {closeCount} close")
        errors += 1

if errors == 0:
    print('All structural tags are balanced.')
else:
    print(f'{errors} tags have mismatches.')
