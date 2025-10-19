from flask import jsonify, render_template, request, session
import MySQLdb.cursors
from flask_mysqldb import MySQL
import whois
import dns.resolver
import time
import socket
from ipwhois import IPWhois
import concurrent.futures
from functools import partial

mysql = MySQL()


def getProperDate(date):
    return (
        date[0].strftime("%Y-%m-%d")
        if isinstance(date, list)
        else (date.strftime("%Y-%m-%d") if date else "N/A")
    )


def process_domain_data(data):
    domain = data.get("domain", "").strip()
    if not domain:
        return None

    result = {
        "srno": data.get("srno"),
        "domain": domain,
        "registrar": "N/A",
        "expiration_date": "N/A",
        "country": "N/A",
        "name_servers": "N/A",
        "mx_servers": "N/A",
        "ip_address": "N/A",
        "hosting_provider": "N/A",
    }

    try:
        # whois data
        try:
            domain_info_whois = whois.whois(domain)
            result["registrar"] = domain_info_whois.registrar or "N/A"
            result["expiration_date"] = getProperDate(domain_info_whois.expiration_date)
            result["country"] = domain_info_whois.country or "N/A"
            all_name_servers = domain_info_whois.name_servers or []
            all_name_servers = [
                str(name_server).lower()
                for name_server in all_name_servers
                if name_server
            ]
            name_servers = list(set(all_name_servers))[:4]
            result["name_servers"] = ", ".join(name_servers) if name_servers else "N/A"
        except Exception as e:
            print(f"Error getting whois data for {domain}: {str(e)}")

        # MX records
        try:
            domain_info_mx = dns.resolver.resolve(domain, "MX")
            mx_servers = [mx.exchange.to_text().rstrip(".") for mx in domain_info_mx]
            result["mx_servers"] = ", ".join(mx_servers) if mx_servers else "N/A"
        except (
            dns.resolver.NoAnswer,
            dns.resolver.NXDOMAIN,
            dns.resolver.NoNameservers,
            dns.resolver.Timeout,
        ) as e:
            print(f"No MX Records for {domain}: {str(e)}")

        # IP address and hosting provider
        try:
            ip_address = socket.gethostbyname(domain)
            result["ip_address"] = ip_address
            res = IPWhois(ip_address).lookup_rdap().get("network", {})
            result["hosting_provider"] = res.get("name", "N/A") or "N/A"
        except Exception as e:
            print(f"Error getting IP/Network info for {domain}: {str(e)}")

    except Exception as e:
        print(f"Unexpected error processing {domain}: {str(e)}")

    return result


def get_justdial_domains_data():
    cursor = None
    try:
        conn = mysql.connection
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        base_query = "FROM domain_detail"
        where_conditions = []
        query_params = []

        query = f"SELECT * {base_query} ORDER BY srno ASC"
        cursor.execute(query, query_params)
        justdial_domains = cursor.fetchall()

        if not justdial_domains:
            return render_template(
                "justdial_domains_data.html",
                result=(
                    {
                        "data": [],
                        "username": session.get("username"),
                        "email": session.get("email"),
                    }
                    if "username" in session
                    else None
                ),
            )

        # Process domains in parallel
        results = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_to_domain = {
                executor.submit(process_domain_data, domain_data): domain_data
                for domain_data in justdial_domains
            }

            for future in concurrent.futures.as_completed(future_to_domain):
                domain_data = future_to_domain[future]
                try:
                    result = future.result()
                    if result:
                        results.append(result)
                except Exception as e:
                    print(
                        f"Error processing domain {domain_data.get('domain', 'unknown')}: {str(e)}"
                    )

        results.sort(key=lambda x: x["srno"])

        return render_template(
            "justdial_domains_data.html",
            result=(
                {
                    "data": results,
                    "username": session.get("username"),
                    "email": session.get("email"),
                }
                if "username" in session
                else None
            ),
        )

    except Exception as e:
        print(f"Error in get_justdial_domains_data: {str(e)}")
        return jsonify({"error": str(e)}), 500

    finally:
        if cursor:
            cursor.close()
