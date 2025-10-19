import MySQLdb.cursors

from flask_mysqldb import MySQL
from flask import render_template, request, session

mysql = MySQL()


from flask import jsonify


def edit_city_route():
    try:
        if request.method == "POST":
            data = request.get_json()
            if not data:
                return jsonify({"error": "Invalid JSON"}), 400

            city_data = data.get("city")
            if not city_data:
                return jsonify({"error": "Missing city or keyword data"}), 400

            city_name = city_data.get("name")
            city_id = city_data.get("id")

            if not city_name or not city_id:
                return jsonify({"error": "Missing name or id"}), 400

            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            query = """UPDATE city SET city_name=%s WHERE id=%s"""
            values = (city_name, city_id)
            cursor.execute(query, values)
            mysql.connection.commit()
            cursor.close()

            return jsonify({"success": True}), 200

        else:
            city_id = request.args.get("city_id")
            city_name = request.args.get("city_name")
            return render_template(
                "dashboard-justdial-city-data.html",
                result={
                    "city_id": city_id,
                    "city_name": city_name,
                    "username": session.get("username"),
                    "email": session.get("email") if "username" in session else None,
                },
            )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
