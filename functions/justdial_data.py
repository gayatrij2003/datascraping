from flask import jsonify, render_template, request, session
import MySQLdb.cursors
from flask_mysqldb import MySQL

mysql = MySQL()
from flask import request


def get_justdial_data():
    try:
        conn = mysql.connection
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        query = """
            SELECT srno, company_name, phone_number, contacts, email, location, scraped_at, service, website
            FROM contact_data 
            ORDER BY srno ASC
        """

        cursor.execute(query)
        company_data = cursor.fetchall()
        cursor.execute("SELECT COUNT(*) as total FROM contact_data")
        total_records = cursor.fetchone()["total"]

        query_params = request.args.to_dict()
        return render_template(
            "dashboard-justdial-data.html",
            result={
                "data": company_data,
                "page": 1,
                "per_page": total_records,
                "total_records": total_records,
                "total_pages": 1,
                "query_params": query_params,
                "username": session.get("username"),
                "email": session.get("email"),
            },
        )

    except Exception as e:
        print(f"Error: {str(e)}")
        return render_template(
            "dashboard-justdial-data.html",
            result={"status": "error", "message": str(e)},
        )
