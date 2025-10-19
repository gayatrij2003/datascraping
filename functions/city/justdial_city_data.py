import MySQLdb.cursors
from flask import request, render_template, session
from flask_mysqldb import MySQL

mysql = MySQL()


def get_city_data(fetch_only=False, city=None):
    conn = mysql.connection
    cursor = conn.cursor(MySQLdb.cursors.DictCursor)

    if not fetch_only and city is None:
        city = request.form.get("city") or request.args.get("city")

    if city:
        session["selected_city"] = city

    try:
        cursor.execute("SELECT * FROM city ORDER BY id ASC")
        results = cursor.fetchall()
        if not fetch_only:
            if city and city.lower() not in [
                row["city_name"].lower() for row in results
            ]:
                cursor.execute("INSERT INTO city (city_name) VALUES (%s)", (city,))
                conn.commit()
                cursor.execute("SELECT * FROM city ORDER BY id ASC")
                results = cursor.fetchall()
            return render_template(
                "city/dashboard-justdial-city-data.html",
                result={
                    "data": results,
                    "city": city or "",
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
                "dashboard-justdial-city-data.html",
                result={
                    "data": results if "results" in locals() else [],
                    "city": city or "",
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
