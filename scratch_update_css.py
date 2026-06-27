import re

file_path = r'C:\Users\nitin\Documents\antigravity\mysterious-volta\src\style.css'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update A: .section animation
content = content.replace(
    '.section { padding: var(--space-12) 0; position: relative; }',
    '.section { padding: var(--space-12) 0; position: relative; opacity: 0; transform: translateY(20px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }\n.section.animated { opacity: 1; transform: translateY(0); }'
)

# Update B: Smooth Accordion
accordion_old = """details .details-content {
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease;
}
details[open] .details-content {
  max-height: 1000px;
  opacity: 1;
}"""
accordion_new = """details .details-content {
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
}
details[open] .details-content {
  opacity: 1;
}"""
content = content.replace(accordion_old, accordion_new)

# Update C: Missing utilities and additions
additions = """
/* === MISSING UTILITIES & ADDITIONS === */
.text-left { text-align: left; }
.mb-1 { margin-bottom: 0.25rem; }
.mb-3 { margin-bottom: 0.75rem; }
.p-6 { padding: 1.5rem; }
.pl-5 { padding-left: 1.25rem; }
.italic { font-style: italic; }
.opacity-70 { opacity: 0.7; }
.max-w-2xl { max-width: 42rem; }
.justify-start { justify-content: flex-start; }

.callout-tip { 
  background: rgba(14, 116, 144, 0.05); 
  border: 1px solid var(--primary-blue); 
  border-left-width: 4px; 
  border-radius: 4px; 
  padding: 0.75rem; 
  font-size: 0.85rem; 
  color: var(--primary-navy); 
  line-height: 1.4; 
  margin-top: 1rem; 
}

.nav-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(12, 35, 64, 0.4);
  z-index: 999;
}

.no-scroll {
  overflow: hidden;
}
"""

if "/* === MISSING UTILITIES & ADDITIONS === */" not in content:
    content += additions

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("style.css updated successfully.")
