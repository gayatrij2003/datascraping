from flask import jsonify, render_template, request, session
import MySQLdb.cursors
from flask_mysqldb import MySQL
import pandas as pd

mysql = MySQL()


def get_domain():
    domain_list = []
    csv_file = None
    error = None

    try:
        conn = mysql.connection
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        if request.method == "POST":
            csv_file = request.files.get("file")
            if csv_file:
                try:
                    df = pd.read_csv(csv_file)
                    domain_columns = [
                        col for col in df.columns if "domain" in col.lower()
                    ]
                    if domain_columns:
                        domain_col = domain_columns[0]
                        csv_domains = [
                            str(d).strip()
                            for d in df[domain_col].dropna()
                            if str(d).strip()
                        ]
                        domain_list.extend(csv_domains)
                except Exception as e:
                    error = f"Error processing CSV file: {str(e)}"

            domain_text = request.form.get("domains", "").strip()
            if domain_text:
                form_domains = [
                    d.strip()
                    for line in domain_text.splitlines()
                    for d in line.split(",")
                    if d.strip()
                ]
                domain_list.extend(form_domains)

            domain_list = list(set(domain_list))

            if len(domain_list) > 10:
                error = "Maximum 10 domains allowed!"
            else:
                if domain_list:
                    insert_query = "INSERT IGNORE INTO domains (domain) VALUES (%s)"
                    cursor.executemany(
                        insert_query, [(domain,) for domain in domain_list]
                    )
                    conn.commit()

        cursor.execute("SELECT * FROM domains")
        domains = cursor.fetchall()

        result = (
            {
                "file": csv_file.filename if csv_file else None,
                "domains": domain_list,
                "data": domains,
                "error": error,
                "username": session.get("username"),
                "email": session.get("email"),
            }
            if "username" in session
            else None
        )

        return render_template("dashboard-domains.html", result=result)

    except Exception as e:
        return render_template(
            "dashboard-domains.html",
            result=(
                {
                    "file": csv_file.filename if csv_file else None,
                    "domains": domain_list,
                    "data": [],
                    "error": str(e),
                    "username": session.get("username"),
                    "email": session.get("email"),
                }
                if "username" in session
                else None
            ),
        )

    finally:
        if "cursor" in locals():
            cursor.close()
