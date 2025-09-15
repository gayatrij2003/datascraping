import mysql.connector
import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime
import time
from urllib.parse import quote

# ----------------- DATABASE CONNECTION -----------------
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="P@ssword321",
    database="data"
)
cursor = conn.cursor()

# ----------------- CREATE TABLE IF NOT EXISTS -----------------
cursor.execute("""
CREATE TABLE IF NOT EXISTS web_data (
    srno INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    jd_url VARCHAR(255),
    location VARCHAR(255),
    service VARCHAR(255),
    website VARCHAR(255),
    scraped_at DATETIME,
    UNIQUE KEY unique_contact (company_name, phone_number)
)
""")

# ----------------- HEADERS -----------------
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9"
}

# ----------------- SAVE FUNCTION -----------------
def save_to_db(name, phone, email, jd_url, location, service, website):
    now = datetime.now()
    try:
        cursor.execute("""
            INSERT IGNORE INTO web_data
            (company_name, phone_number, email, jd_url, location, service, website, scraped_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (name, phone, email, jd_url, location, service, website, now))
        conn.commit()
        print(f"✅ Saved {name} | {phone} | {location} | {jd_url}")
    except mysql.connector.Error as e:
        print(f"DB Error: {e}")

# ----------------- FETCH CITIES & KEYWORDS -----------------
cursor.execute("SELECT city_name FROM city")
cities = [row[0] for row in cursor.fetchall()]

cursor.execute("SELECT keyword FROM keyword")
keywords = [row[0] for row in cursor.fetchall()]

# ----------------- JUSTDIAL SCRAPER -----------------
def scrape_justdial(cities, keywords, max_pages=3):
    base_url = "https://www.justdial.com/{city}/{keyword}/page-{page}"

    for city in cities:
        for keyword in keywords:
            for page in range(1, max_pages+1):
                url = base_url.format(city=quote(city.replace(" ", "-")),
                                      keyword=quote(keyword.replace(" ", "-")),
                                      page=page)
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
                        break  # stop pagination if page is empty

                    for listing in listings:
                        # ✅ Company Name
                        name_tag = listing.find("span", class_="lng_cont_name") \
                                   or listing.find("h2") \
                                   or listing.find("a", {"data-name": True})
                        name = (
                            name_tag.get("data-name", "").strip()
                            if name_tag and name_tag.has_attr("data-name")
                            else name_tag.text.strip() if name_tag else "N/A"
                        )

                        # ✅ Phone Numbers
                        phone_numbers = re.findall(r'(?:\+91[\-\s]?)?[6-9]\d{9}', listing.get_text(" ", strip=True))
                        if not phone_numbers:
                            phone_numbers = ["Hidden"]

                        # ✅ Email (rare on Justdial)
                        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', listing.get_text())
                        email = email_match.group(0) if email_match else "N/A"

                        # ✅ Justdial URL
                        url_tag = listing.find("a", href=True)
                        company_url = url_tag['href'] if url_tag else url

                        # ✅ Location
                        location_tag = (
                            listing.find("span", class_="cont_fl_addr") or
                            listing.find("span", class_="lng_add") or
                            listing.find("p", class_="contact-info") or
                            listing.find("span", {"itemprop": "address"}) or
                            listing.find("div", class_="address")
                        )
                        location = ' '.join(location_tag.stripped_strings) if location_tag else city

                        # ✅ Service (use keyword as service category)
                        service = keyword

                        # ✅ Website (not available on Justdial)
                        website = "N/A"

                        # ✅ Save all phone numbers separately
                        for phone in phone_numbers:
                            save_to_db(name, phone, email, company_url, location, service, website)

                    time.sleep(1)  # avoid blocking

                except Exception as e:
                    print(f"❌ Error scraping {url}: {e}")
                    continue

# ----------------- RUN SCRAPER -----------------
scrape_justdial(cities, keywords, max_pages=5)

# ----------------- CLOSE CONNECTION -----------------
cursor.close()
conn.close()
