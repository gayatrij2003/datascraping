from flask import render_template, request, session, jsonify
import MySQLdb.cursors
from flask_mysqldb import MySQL
import json

mysql = MySQL()


def city_delete_route():
    try:
        conn = mysql.connection
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)

        data = request.get_json()

        if not data or "cities" not in data:
            return (
                jsonify({"success": False, "message": "No cities data provided"}),
                400,
            )

        cities_to_delete = data["cities"]

        if not cities_to_delete:
            return (
                jsonify(
                    {"success": False, "message": "No cities selected for deletion"}
                ),
                400,
            )

        cursor.execute("SELECT COUNT(*) as count FROM city")
        total_cities = cursor.fetchone()["count"]

        if total_cities == len(cities_to_delete):
            cursor.execute("DELETE FROM city")
            conn.commit()
            return jsonify(
                {
                    "success": True,
                    "message": "Successfully deleted all cities",
                    "deleted_count": total_cities,
                }
            )

        # Delete selected cities
        city_ids = [str(city["id"]) for city in cities_to_delete if "id" in city]
        if not city_ids:
            return (
                jsonify({"success": False, "message": "No valid city IDs provided"}),
                400,
            )

        placeholders = ",".join(["%s"] * len(city_ids))
        query = f"DELETE FROM city WHERE id IN ({placeholders})"
        cursor.execute(query, city_ids)
        deleted_count = cursor.rowcount
        conn.commit()

        if deleted_count > 0:
            return jsonify(
                {
                    "success": True,
                    "message": f"Successfully deleted {deleted_count} cities",
                    "deleted_count": deleted_count,
                }
            )
        else:
            return (
                jsonify(
                    {
                        "success": True,
                        "message": "No matching cities found to delete. They may have already been removed.",
                        "deleted_count": 0,
                    }
                ),
                200,
            )

    except Exception as e:
        print(f"Error in city_delete_route: {str(e)}")
        return (
            jsonify(
                {
                    "success": False,
                    "message": f"An error occurred while processing your request: {str(e)}",
                }
            ),
            500,
        )
