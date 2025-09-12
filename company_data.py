
import mysql.connector
import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import time

# ----------------- DATABASE CONNECTION -----------------
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="P@ssword321",
    database="scrap_data"
)
cursor = conn.cursor()

# ----------------- TABLE CREATION -----------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS justdial_scrap_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    source VARCHAR(255),
    url VARCHAR(255),
    location VARCHAR(255),
    scraped_at DATETIME,
    UNIQUE KEY unique_contact (company_name, phone_number)
)
""")

# ----------------- HEADERS -----------------
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36"
}

# ----------------- SAVE FUNCTION -----------------
def save_to_db(name, phone, email, source, url, location):
    now = datetime.now()
    try:
        cursor.execute("""
            INSERT IGNORE INTO justdial_scrap_data
            (company_name, phone_number, email, source, url, location, scraped_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (name, phone, email, source, url, location, now))
        conn.commit()
        print(f"✅ Saved {name} | {phone} | {location} | {url}")
    except mysql.connector.Error as e:
        print(f"DB Error: {e}")

# ----------------- FETCH CITIES & KEYWORDS -----------------
cursor.execute("SELECT city_name FROM city")
cities = [row[0] for row in cursor.fetchall()]

cursor.execute("SELECT keyword FROM keyword")
keywords = [row[0] for row in cursor.fetchall()]

# ----------------- JUSTDIAL SCRAPER -----------------
def scrape_justdial(cities, keywords):
    base_url = "https://www.justdial.com/{city}/{keyword}/nct-0"

    for city in cities:
        for keyword in keywords:
            url = base_url.format(city=city.replace(" ", "-"), keyword=keyword.replace(" ", "-"))
            print(f"\n🔍 Scraping URL: {url}")

            try:
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code != 200:
                    print(f"⚠️ Failed to fetch {url} | Status: {response.status_code}")
                    continue

                soup = BeautifulSoup(response.text, "html.parser")

                # ✅ Listings container
                listings = soup.find_all("div", class_="resultbox") or soup.find_all("div", class_="cntanr")
                if not listings:
                    print("⚠️ No listings found on this page.")
                    continue

                for listing in listings:
                    # ✅ Company Name
                    name_tag = listing.find("span", class_="lng_cont_name") \
                               or listing.find("h2") \
                               or listing.find("a", {"data-name": True})
                    name = (
                        name_tag.text.strip()
                        if name_tag and name_tag.text.strip()
                        else name_tag.get("data-name", "N/A")
                        if name_tag
                        else "N/A"
                    )

                    # ✅ Phone Numbers (Regex-based)
                    phone_numbers = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{9}', listing.text)
                    if not phone_numbers:
                        phone_numbers = ["Hidden"]

                    # ✅ Email Extraction
                    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', listing.text)
                    email = email_match.group(0) if email_match else "N/A"

                    # ✅ Company Page URL (Direct Justdial Link)
                    url_tag = listing.find("a", href=True)
                    company_url = url_tag['href'] if url_tag else url

                    # ✅ Exact Location / Address (robust extraction with city fallback)
                    location_tag = (
                        listing.find("span", class_="cont_fl_addr") or
                        listing.find("span", class_="lng_add") or
                        listing.find("p", class_="contact-info") or
                        listing.find("span", {"itemprop": "address"}) or
                        listing.find("div", class_="address")
                    )
                    location = ' '.join(location_tag.stripped_strings) if location_tag else city  # fallback to city

                    # ✅ Source
                    source = "Justdial"

                    # ✅ Save all phone numbers separately
                    for phone in phone_numbers:
                        save_to_db(name, phone, email, source, company_url, location)

                time.sleep(1)  # avoid blocking

            except Exception as e:
                print(f"❌ Error scraping {url}: {e}")

# ----------------- RUN SCRAPER -----------------
scrape_justdial(cities, keywords)

# ----------------- CLOSE CONNECTION -----------------
cursor.close()
conn.close()
