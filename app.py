from flask import Flask, request, jsonify, render_template, send_from_directory
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

app = Flask(__name__)

# --- ROUTE FOR IMAGES ---
@app.route('/images/<path:filename>')
def custom_images(filename):
    return send_from_directory('images', filename)

# --- Database Setup ---
def init_db():
    conn = sqlite3.connect('unipath.db')
    cursor = conn.cursor()
    
    # 1. Users Table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            grade_status TEXT NOT NULL,
            password_hash TEXT NOT NULL
        )
    ''')
    
    # 2. User Profiles Table (For APS Score)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_email TEXT PRIMARY KEY,
            aps_score INTEGER DEFAULT 0
        )
    ''')
    
    # 3. NEW: Downloads Table (For tracking papers)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS downloads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_email TEXT NOT NULL,
            paper_name TEXT NOT NULL,
            paper_url TEXT NOT NULL,
            download_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

init_db()

# --- PAGE ROUTES ---

@app.route('/')
def home():
    return render_template('unipath.html')

@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/aps')
def aps():
    return render_template('aps.html')

@app.route('/nsfas')
def nsfas():
    return render_template('nsfas.html')

@app.route('/past-papers')
def past_papers():
    return render_template('past-papers.html')

@app.route('/universities')
def universities():
    return render_template('universities.html')

# --- Auto-Generated University Routes ---
university_files = [
    # Province pages
    'eastern-cape.html', 'free-state.html', 'gauteng.html', 
    'kwazulu-natal.html', 'limpopo.html', 'mpumalanga.html', 
    'northern-cape.html', 'north-west.html', 'western-cape.html',
    
    # University pages
    'cput.html', 'cut.html', 'dut.html', 'mut.html', 
    'nmu.html', 'nwu.html', 'rhodes.html', 'smu.html', 
    'spu.html', 'stellenbosch.html', 'tut.html', 'uct.html', 
    'ufh.html', 'ufs.html', 'uj.html', 'ukzn.html', 
    'ul.html', 'ump.html', 'unisa.html', 'univen.html', 
    'unizulu.html', 'up.html', 'uwc.html', 'vut.html', 
    'wits.html', 'wsu.html'
]
for filename in university_files:
    route_name = filename.replace('.html', '')
    def create_route(file=filename):
        return render_template(file)
    app.add_url_rule(
        f'/universities/{route_name}', 
        endpoint=route_name, 
        view_func=create_route
    )

# --- API Routes (Login & Signup) ---

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    grade = data.get('grade')
    password = data.get('password')

    if not all([name, email, grade, password]):
        return jsonify({"error": "All fields are required"}), 400

    hashed_pw = generate_password_hash(password)

    try:
        conn = sqlite3.connect('unipath.db')
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (full_name, email, grade_status, password_hash) VALUES (?, ?, ?, ?)",
            (name, email, grade, hashed_pw)
        )
        conn.commit()
        conn.close()
        return jsonify({"message": "Account created successfully!"}), 201
    except sqlite3.IntegrityError:
        return jsonify({"error": "Email already exists. Please sign in."}), 409

@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400

    conn = sqlite3.connect('unipath.db')
    cursor = conn.cursor()
    cursor.execute("SELECT full_name, password_hash FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[1], password):
        return jsonify({
            "message": "Login successful!",
            "user": {"name": user[0], "email": email}
        }), 200
    else:
        return jsonify({"error": "Invalid email or password"}), 401

# --- APS CRUD ROUTES (For the Dashboard) ---

@app.route('/api/save-aps', methods=['POST'])
def save_aps():
    data = request.get_json()
    email = data.get('email')
    aps = data.get('aps')
    
    if not email or aps is None:
        return jsonify({"error": "Missing data"}), 400
        
    conn = sqlite3.connect('unipath.db')
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO user_profiles (user_email, aps_score) 
        VALUES (?, ?) 
        ON CONFLICT(user_email) DO UPDATE SET aps_score = ?
    ''', (email, aps, aps))
    conn.commit()
    conn.close()
    return jsonify({"message": "APS saved successfully!"}), 200

@app.route('/api/get-aps/<email>', methods=['GET'])
def get_aps(email):
    conn = sqlite3.connect('unipath.db')
    cursor = conn.cursor()
    cursor.execute("SELECT aps_score FROM user_profiles WHERE user_email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return jsonify({"aps": row[0]}), 200
    else:
        return jsonify({"aps": 0}), 200

@app.route('/api/delete-aps', methods=['POST'])
def delete_aps():
    data = request.get_json()
    email = data.get('email')
    
    conn = sqlite3.connect('unipath.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM user_profiles WHERE user_email = ?", (email,))
    conn.commit()
    conn.close()
    return jsonify({"message": "APS score reset"}), 200

# --- NEW: DOWNLOAD CRUD ROUTES ---

@app.route('/api/save-download', methods=['POST'])
def save_download():
    data = request.get_json()
    email = data.get('email')
    paper_name = data.get('paper_name')
    paper_url = data.get('paper_url')
    
    conn = sqlite3.connect('unipath.db')
    cursor = conn.cursor()
    cursor.execute("INSERT INTO downloads (user_email, paper_name, paper_url) VALUES (?, ?, ?)", (email, paper_name, paper_url))
    conn.commit()
    conn.close()
    return jsonify({"message": "Download saved!"}), 201

@app.route('/api/get-downloads/<email>', methods=['GET'])
def get_downloads(email):
    conn = sqlite3.connect('unipath.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, paper_name, paper_url FROM downloads WHERE user_email = ? ORDER BY download_date DESC LIMIT 10", (email,))
    rows = cursor.fetchall()
    conn.close()
    return jsonify([{"id": row[0], "name": row[1], "url": row[2]} for row in rows])

@app.route('/api/delete-download/<int:download_id>', methods=['DELETE'])
def delete_download(download_id):
    conn = sqlite3.connect('unipath.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM downloads WHERE id = ?", (download_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Download record deleted"}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)