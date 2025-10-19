import MySQLdb.cursors

from flask_mysqldb import MySQL
from flask import render_template, request, session

mysql = MySQL()


from flask import jsonify


def edit_keyword_route():
    try:
        if request.method == "POST":
            data = request.get_json()
            if not data:
                return jsonify({"error": "Invalid JSON"}), 400

            keyword_data = data.get("keyword")
            if not keyword_data:
                return jsonify({"error": "Missing city or keyword data"}), 400

            keyword_name = keyword_data.get("name")
            keyword_id = keyword_data.get("id")

            if not keyword_name or not keyword_id:
                return jsonify({"error": "Missing name or id"}), 400

            cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
            query = """UPDATE keyword SET keyword=%s WHERE id=%s"""
            values = (keyword_name, keyword_id)
            cursor.execute(query, values)
            mysql.connection.commit()
            cursor.close()

            return jsonify({"success": True}), 200

        else:
            keyword_id = request.args.get("keyword_id")
            keyword_name = request.args.get("keyword_name")
            return render_template(
                "dashboard-justdial-keyword-data.html",
                result={
                    "keyword_id": keyword_id,
                    "keyword_name": keyword_name,
                    "username": session.get("username"),
                    "email": session.get("email") if "username" in session else None,
                },
            )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
