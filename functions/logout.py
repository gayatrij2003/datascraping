import bcrypt
import MySQLdb.cursors
from flask import redirect, render_template, request, url_for, session


def logout_route():
    session.pop("username", None)
    session.pop("email", None)
    return redirect(url_for("login"))
