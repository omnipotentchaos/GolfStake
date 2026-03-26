import os
import glob

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_str in content:
        content = content.replace(old_str, new_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

# Fix 9.99 and 99.99 pricing in various files
replace_in_file('src/app/how-it-works/page.js', '£9.99', '₹500')
replace_in_file('src/app/how-it-works/page.js', '£99.99', '₹1000')

replace_in_file('src/app/page.js', '<span className={styles.pricingCurrency}>£</span>\n                <span className={styles.pricingAmount}>9.99</span>', '<span className={styles.pricingCurrency}>₹</span>\n                <span className={styles.pricingAmount}>500</span>')
replace_in_file('src/app/page.js', '<span className={styles.pricingCurrency}>£</span>\n                <span className={styles.pricingAmount}>99.99</span>', '<span className={styles.pricingCurrency}>₹</span>\n                <span className={styles.pricingAmount}>1000</span>')
replace_in_file('src/app/page.js', '£{prize', '₹{prize')
replace_in_file('src/app/page.js', '£{chari', '₹{chari')

replace_in_file('src/app/signup/page.js', '£9.99', '₹500')
replace_in_file('src/app/signup/page.js', '£99.99', '₹1000')

# Now mass replace any other £ with ₹ across common files
for ext in ['**/*.js', '**/*.jsx']:
    for filepath in glob.glob('src/' + ext, recursive=True):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if '£' in content:
            content = content.replace('£', '₹')
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
