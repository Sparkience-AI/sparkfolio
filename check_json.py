import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'<script type="application/ld\+json">(.*?)</script>', text, re.DOTALL)
if match:
    json_ld = match.group(1).lower()
    sections = [
        'portfolio review',
        'fund exit',
        'wealth acceleration',
        'step-up sip',
        'tax-gain harvesting',
        'tgh',
        'retirement playbook',
        'asset location'
    ]
    for sec in sections:
        if sec in json_ld:
            print(f"FOUND in JSON-LD: {sec}")
        else:
            print(f"MISSING in JSON-LD: {sec}")
else:
    print('No JSON-LD found')
