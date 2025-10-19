from flask import render_template, request, session, jsonify
import MySQLdb.cursors
from flask_mysqldb import MySQL
import json

mysql = MySQL()


def keyword_delete_route():
    try:
        conn = mysql.connection
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        data = request.get_json()

        if not data or "keywords" not in data:
            return (
                jsonify({"success": False, "message": "No keywords data provided"}),
                400,
            )

        keywords_to_delete = data["keywords"]

        if not keywords_to_delete:
            return (
                jsonify(
                    {"success": False, "message": "No keywords selected for deletion"}
                ),
                400,
            )

        cursor.execute("SELECT COUNT(*) as count FROM keyword")
        total_keywords = cursor.fetchone()["count"]

        if total_keywords == len(keywords_to_delete):
            cursor.execute("DELETE FROM keyword")
            conn.commit()
            return jsonify(
                {
                    "success": True,
                    "message": "Successfully deleted all keywords",
                    "deleted_count": total_keywords,
                }
            )

        keyword_ids = [
            int(keyword["id"]) for keyword in keywords_to_delete if "id" in keyword
        ]
        if not keyword_ids:
            return (
                jsonify({"success": False, "message": "No valid keyword IDs provided"}),
                400,
            )

        placeholders = ",".join(["%s"] * len(keyword_ids))
        query = f"DELETE FROM keyword WHERE id IN ({placeholders})"
        cursor.execute(query, keyword_ids)
        deleted_count = cursor.rowcount
        conn.commit()

        if deleted_count > 0:
            return jsonify(
                {
                    "success": True,
                    "message": f"Successfully deleted {deleted_count} keywords",
                    "deleted_count": deleted_count,
                }
            )
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "message": "No matching keywords found to delete. They may have already been removed.",
                        "deleted_count": 0,
                    }
                ),
                200,
            )

    except Exception as e:
        print(f"Error in keyword_delete_route: {str(e)}")
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"An error occurred while processing your request: {str(e)}",
                }
            ),
            500,
        )
