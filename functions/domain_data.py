from flask import jsonify, render_template, request, session
import MySQLdb.cursors
from flask_mysqldb import MySQL

mysql = MySQL()
from flask import request


def get_domain_data():
    try:
        conn = mysql.connection
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        cursor.execute("SELECT * FROM domain_data ORDER BY ID ASC")
        domain_data = cursor.fetchall()

        return render_template(
            "dashboard-domain-data.html",
            result={
                "data": domain_data,
                "username": session["username"],
                "email": session["email"] if "username" in session else None,
            },
        )
    except Exception as e:
        return render_template(
            "dashboard-domain-data.html",
            result={
                "status": "error",
                "message": str(e),
                "data": [],
                "username": session["username"],
                "email": session["email"] if "username" in session else None,
            },
        )
