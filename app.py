from flask import Flask, render_template, redirect, url_for
from flask_mysqldb import MySQL
from functions.city.justdial_city_data import get_city_data
from functions.keyword.justdial_keyword_data import get_keyword_data
from functions.justdial_data import get_justdial_data
from functions.login import login_route
from functions.logout import logout_route
from functions.domains import get_domain
from functions.domain_data import get_domain_data
from functions.justdial_domains_data import get_justdial_domains_data
from functions.city.justdial_city_delete import city_delete_route
from functions.city.city_edit import edit_city_route
from functions.keyword.justdial_keyword_delete import keyword_delete_route
from functions.keyword.keyword_edit import edit_keyword_route
import secrets
from flask import session
from functools import wraps
app = Flask(__name__, static_folder="static", static_url_path="/static")
app.secret_key = secrets.token_hex(16)
# MySQL Configuration
app.config["MYSQL_HOST"] = "localhost"
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "root"
app.config["MYSQL_DB"] = "DataScraping"

# Initialize MySQL
mysql = MySQL(app)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'username' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route("/", methods=["GET"])
@login_required
def index():
    if 'username' in session:
        return redirect(url_for('justdial_city'))  
    return redirect(url_for('login'))


@app.route("/justdial_city_data", methods=["GET", "POST"], endpoint="justdial_city")
@login_required
def justdial_city():
    return get_city_data()

@app.route("/city_delete", methods=["POST"], endpoint="justdial_city_delete")
@login_required
def justdial_city_delete():
    return city_delete_route()

@app.route("/city_edit", methods=["POST"], endpoint="justdial_city_edit")
@login_required
def justdial_city_edit():
    return edit_city_route()

@app.route("/keyword_edit", methods=["POST"], endpoint="justdial_keyword_edit")
@login_required
def justdial_keyword_edit():
    return edit_keyword_route()
    
@app.route("/keyword_delete", methods=["POST"], endpoint="justdial_keyword_delete")
@login_required
def justdial_keyword_delete():
    return keyword_delete_route()

@app.route("/justdial_keyword_data", methods=["GET","POST"], endpoint="justdial_keyword")
@login_required
def justdial_keyword():
    return get_keyword_data()


@app.route("/justdial_data", methods=["GET","POST"], endpoint="justdial_data")
@login_required
def justdial_data():
    return get_justdial_data()

@app.route("/domains", methods=["GET","POST"], endpoint="domains")
@login_required
def domains_route():
    return get_domain()

@app.route("/domain_data", methods=["GET","POST"], endpoint="domain_data")
@login_required
def domain_data():
    return get_domain_data()

@app.route("/justdial_extracted_domains", methods=["GET","POST"], endpoint="justdial_extracted_domains")
@login_required
def justdial_extracted_domains():
    return get_justdial_domains_data()

@app.route("/login", methods=["GET","POST"], endpoint="login")
def login():
    if 'username' in session:
        return redirect(url_for('index'))
    return login_route(mysql)


@app.route("/logout", methods=["GET"], endpoint="logout")
def logout():
    return logout_route()


if __name__ == "__main__":
    app.run(debug=True, port=8000)
