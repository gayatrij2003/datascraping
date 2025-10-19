import MySQLdb.cursors
from flask import request, render_template, session
from flask_mysqldb import MySQL

mysql = MySQL()


def get_keyword_data(fetch_only=False, service=None):
    conn = mysql.connection
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)
    if not fetch_only and service is None:
        service = request.form.get("service") or request.args.get("service")

    if service:
        session["selected_services"] = service

    try:
        cursor.execute("SELECT * FROM keyword ORDER BY id ASC")
        results = cursor.fetchall()
        if not fetch_only:
            if service and service.lower() not in [
                row["keyword"].lower() for row in results
            ]:
                cursor.execute("INSERT INTO keyword (keyword) VALUES (%s)", (service,))
                conn.commit()
                cursor.execute("SELECT * FROM keyword ORDER BY id ASC")
                results = cursor.fetchall()
            return render_template(
                "keyword/dashboard-justdial-keyword-data.html",
                result={
                    "data": results,
                    "service": service or "",
                    "username": session["username"],
                    "email": session["email"] if "username" in session else None,
                    "total_pages": 1,
                },
            )
        else:
            return results
    except Exception as e:
        if not fetch_only:
            return render_template(
                "dashboard-justdial-keyword-data.html",
                result={
                    "data": results if "results" in locals() else [],
                    "service": service or "",
                    "username": session["username"],
                    "email": session["email"] if "username" in session else None,
                    "total_pages": 1,
                },
                error=str(e),
            )
        else:
            return []
    finally:
        cursor.close()
