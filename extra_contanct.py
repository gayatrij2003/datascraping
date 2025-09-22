import mysql.connector
import requests
from bs4 import BeautifulSoup
import json
import time
import re
from urllib.parse import urlparse

# ----------------- DATABASE CONNECTION -----------------
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="P@ssword321",
    database="scrap_data"
)
cursor = conn.cursor()

# ----------------- FUNCTION TO CLEAN DOMAIN -----------------
def clean_domain(url):
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower()   # extract netloc part (e.g. www.example.com)
        if domain.startswith("www."):    # remove www.
            domain = domain[4:]
        return domain
    except Exception:
        return url

# ----------------- FUNCTION TO EXTRACT WEBSITE -----------------
def extract_website(jd_url):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    website = None
    try:
        response = requests.get(jd_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        # Step 1: Check <script type="application/ld+json">
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and "website" in data:
                    website = data["website"]
                    break
                elif isinstance(data, list):
                    for item in data:
                        if "website" in item:
                            website = item["website"]
                            break
            except:
                continue

        # Step 2: Fallback - scan <a> tags
        if not website:
            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"]
                if "http" in href and "justdial.com" not in href:
                    website = href
                    break
    except Exception as e:
        print(f"Error extracting website: {e}")
        website = None

    return website if website else "N/A"

# ----------------- FUNCTION TO EXTRACT EMAIL -----------------
def extract_email(jd_url, website=None):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    email = None
    try:
        # Step 1: Check Justdial page
        response = requests.get(jd_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        # Check JSON-LD data
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and "email" in data:
                    email = data["email"]
                    break
            except:
                continue

        # Check for mailto links
        if not email:
            for a_tag in soup.find_all("a", href=True):
                if a_tag["href"].startswith("mailto:"):
                    email = a_tag["href"].replace("mailto:", "")
                    break

        # Step 2: If still not found, check company website
        if not email and website and website != "N/A":
            try:
                resp = requests.get("http://" + website, headers=headers, timeout=10)
                matches = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", resp.text)
                if matches:
                    email = matches[0]   # take first found email
            except:
                pass

    except Exception as e:
        print(f"Error extracting email: {e}")

    return email if email else "N/A"

# ----------------- FUNCTION TO EXTRACT CONTACTS -----------------
def extract_contacts(jd_url, website=None):
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    contacts = []

    try:
        # Step 1: Check JD detail page
        response = requests.get(jd_url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        text_content = soup.get_text(" ", strip=True)

        # Find all Indian mobile numbers
        numbers = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{9}', text_content)
        contacts.extend(numbers)

        # Step 2: If website exists, check website for numbers too
        if website and website != "N/A":
            try:
                resp = requests.get("http://" + website, headers=headers, timeout=10)
                web_numbers = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{9}', resp.text)
                contacts.extend(web_numbers)
            except:
                pass

    except Exception as e:
        print(f"Error extracting contacts: {e}")

    # Remove duplicates
    contacts = list(set(contacts))
    return ", ".join(contacts) if contacts else "N/A"

# ----------------- MAIN LOOP -----------------
cursor.execute("SELECT srno, company_name, phone_number, jd_url FROM contact_data")
companies = cursor.fetchall()

for comp in companies:
    srno, company_name, phone_number, jd_url = comp

    website = extract_website(jd_url)
    if website != "N/A":
        website = clean_domain(website)

    email = extract_email(jd_url, website)
    contacts = extract_contacts(jd_url, website)

    scraped_at = time.strftime('%Y-%m-%d %H:%M:%S')

    # Update website + email + contacts
    cursor.execute("""
        UPDATE contact_data
        SET website = %s, email = %s, contacts = %s, scraped_at = %s
        WHERE srno = %s
    """, (website, email, contacts, scraped_at, srno))

    conn.commit()
    print(f"✅ Updated: {company_name} | Website: {website} | Email: {email} | Contacts: {contacts}")

conn.close()





