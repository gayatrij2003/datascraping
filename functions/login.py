import bcrypt
import MySQLdb.cursors
from flask import redirect, render_template, request, url_for, session


def login_route(mysql):
    if request.method == "POST":
        username = request.form.get("username", "").strip()
        password = request.form.get("password", "").strip()

        conn = mysql.connection
        cursor = conn.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT * FROM user WHERE username = %s", (username,))
        user = cursor.fetchone()
        if user and bcrypt.hashpw(
            password.encode("utf-8"), user["password"].encode("utf-8")
        ) == user["password"].encode("utf-8"):
            session["username"] = user["username"]
            session["email"] = user.get("email", "")
            return redirect(url_for("index"))
        else:
            return render_template(
                "login.html",
                result={"username": username, "error": "Invalid username or password"},
                loggedIn=False,
            )

    return render_template(
        "login.html", result={"username": "", "error": ""}, loggedIn=False
    )
