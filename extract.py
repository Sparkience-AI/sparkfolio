import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

match = re.search(r'(<script type=\"application/ld\+json\">.*?</script>)', text, re.DOTALL)
if match:
    with open('json_ld.txt', 'w', encoding='utf-8') as out:
        out.write(match.group(1))
