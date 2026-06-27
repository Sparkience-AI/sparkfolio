import json
import re

file_path = r'C:\Users\nitin\Documents\antigravity\mysterious-volta\index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the JSON-LD block
script_start = content.find('<script type="application/ld+json">')
if script_start != -1:
    script_content_start = script_start + len('<script type="application/ld+json">')
    script_end = content.find('</script>', script_content_start)
    json_str = content[script_content_start:script_end].strip()
    
    try:
        data = json.loads(json_str)
        # Find the FAQPage entity
        faq_entity = None
        for entity in data.get('@graph', []):
            if entity.get('@type') == 'FAQPage':
                faq_entity = entity
                break
                
        if faq_entity:
            # Append new FAQs
            new_faqs = [
                {
                  "@type": "Question",
                  "name": "Why should I choose Direct Mutual Fund plans over Regular plans?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Regular plans charge a 1-1.5% extra commission every year. Over 20 years, this 1% fee drag compounds, potentially eating away 20-30% of your total wealth."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Lump Sum investing better than SIP?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Statistically, Vanguard found that Lump Sum investing beats SIP about 67% of the time because markets rise more than they fall. However, SIPs are highly recommended for peace of mind and discipline."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How big should my emergency fund be?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Salaried individuals should keep 3-6 months of expenses, families with dependents should keep 6-9 months, and freelancers or business owners should target 9-12 months."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is a Safe Withdrawal Rate for retirement in India?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Due to higher inflation in India, a Safe Withdrawal Rate (SWR) of 3% to 3.5% is recommended instead of the US 4% rule. A Bucket Strategy is also advised to mitigate Sequence of Returns Risk."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Should I invest in international markets from India?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, to avoid home bias and hedge against currency depreciation, a 15-30% allocation to international indices like the S&P 500 or Nasdaq 100 is recommended."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How should I allocate my investments based on time horizon?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "For goals under 3 years, use Debt funds or FDs. For 3-7 years, use Hybrid funds. For long-term goals over 7 years, invest primarily in Equity funds."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What are the tax benefits of NPS?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "NPS provides an exclusive tax deduction of up to ₹50,000 under section 80CCD(1B), which is in addition to the standard ₹1.5 Lakh limit under 80C."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Should I buy endowment policies for investment?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Endowment policies usually offer low returns of 4-6%. The best approach is to buy pure Term Insurance for protection and invest the remainder in mutual funds."
                  }
                }
            ]
            
            # check if they are already added
            existing_questions = [q['name'] for q in faq_entity.get('mainEntity', [])]
            for new_faq in new_faqs:
                if new_faq['name'] not in existing_questions:
                    faq_entity.setdefault('mainEntity', []).append(new_faq)
            
            new_json_str = json.dumps(data, indent=2)
            content = content[:script_content_start] + '\n' + new_json_str + '\n    ' + content[script_end:]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print("JSON-LD updated successfully.")
        else:
            print("FAQPage not found.")
    except Exception as e:
        print(f"Error parsing JSON: {e}")
else:
    print("Script tag not found.")
