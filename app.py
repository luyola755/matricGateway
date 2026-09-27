from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import hashlib
import re
import os

# static_folder=None: we do NOT want Flask's automatic "serve every file
# in this folder" behavior (static_folder='.', static_url_path='' from
# before) - that was serving app.py and matric_gateway.db itself over
# HTTP to anyone who asked. We serve only the specific site files below.
app = Flask(__name__, static_folder=None)
CORS(app)

# Only these extensions are ever served as site files. Blocks .py, .db,
# and anything else from being downloaded via the catch-all route.
ALLOWED_EXTENSIONS = {'.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.webp'}


# ============================================================
# DATABASE SETUP
# ============================================================

def init_db():
    print("Starting database setup...")

    db = sqlite3.connect('matric_gateway.db')
    c = db.cursor()

    # Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS Users(
            UserID INTEGER PRIMARY KEY AUTOINCREMENT,
            Username TEXT UNIQUE NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            FullName TEXT NOT NULL,
            PasswordHash TEXT NOT NULL,
            CreateDate DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    print("Users table ready")

    # Students table
    c.execute('''
        CREATE TABLE IF NOT EXISTS Students(
            StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
            FirstName TEXT NOT NULL,
            LastName TEXT NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            Phone TEXT,
            Course TEXT,
            EnrollmentDate DATE DEFAULT CURRENT_DATE
        )
    ''')
    print("Students table ready")

    # Applications table
    c.execute('''
        CREATE TABLE IF NOT EXISTS Applications(
            ApplicationID INTEGER PRIMARY KEY AUTOINCREMENT,
            StudentID INTEGER,
            University TEXT NOT NULL,
            Program TEXT NOT NULL,
            ApplicationDate DATE DEFAULT CURRENT_DATE,
            Status TEXT DEFAULT 'Pending',
            FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
        )
    ''')
    print("Applications table ready")

    # NSFAS table
    c.execute('''
        CREATE TABLE IF NOT EXISTS NSFAS_Records(
            NSFASID INTEGER PRIMARY KEY AUTOINCREMENT,
            StudentID INTEGER,
            ApplicationDate DATE DEFAULT CURRENT_DATE,
            Status TEXT DEFAULT 'Pending',
            FOREIGN KEY (StudentID) REFERENCES Students(StudentID)
        )
    ''')
    print("NSFAS table ready")

    # Past Papers table
    c.execute('''
        CREATE TABLE IF NOT EXISTS Past_Papers(
            PaperID INTEGER PRIMARY KEY AUTOINCREMENT,
            Subject TEXT NOT NULL,
            Year INTEGER NOT NULL,
            PaperType TEXT,
            DownloadLink TEXT
        )
    ''')
    print("Past Papers table ready")

    # Admin user
    c.execute('SELECT * FROM Users WHERE Username = ?', ('admin',))
    if not c.fetchone():
        print("Creating admin user...")
        admin_hash = hashlib.sha256('admin'.encode()).hexdigest()
        c.execute('''
            INSERT INTO Users (Username, Email, FullName, PasswordHash)
            VALUES (?, ?, ?, ?)
        ''', ('admin', 'admin@matricgateway.co.za', 'Administrator', admin_hash))
        print("Admin created (admin/admin)")

    # Sample students
    c.execute('SELECT COUNT(*) FROM Students')
    if c.fetchone()[0] == 0:
        print("Adding sample students...")
        students = [
            ('Thabo', 'Mbeki', 'thabo@student.co.za', '0712345678', 'BSc Computer Science'),
            ('Nelson', 'Mandela', 'nelson@student.co.za', '0723456789', 'BA Law'),
            ('Desmond', 'Tutu', 'desmond@student.co.za', '0734567890', 'BCom Accounting'),
            ('Miriam', 'Makeba', 'miriam@student.co.za', '0745678901', 'BSc Mathematics'),
            ('Chris', 'Hani', 'chris@student.co.za', '0756789012', 'BEng Civil'),
        ]
        for s in students:
            c.execute('''
                INSERT INTO Students (FirstName, LastName, Email, Phone, Course)
                VALUES (?, ?, ?, ?, ?)
            ''', s)
        print("5 sample students added")

    db.commit()
    db.close()
    print("Database setup complete!")


# ============================================================
# HELPERS
# ============================================================

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email)


# ============================================================
# API STATUS (moved from '/' to '/api' so it doesn't clash with
# the site's homepage - see SERVE HTML PAGES section below)
# ============================================================

@app.route('/api', methods=['GET'])
def api_home():
    return jsonify({
        'success': True,
        'message': 'Matric Gateway Python Server is running!',
        'endpoints': [
            'GET    /api/test',
            'POST   /api/login',
            'POST   /api/signup',
            'GET    /api/users',
            'GET    /api/students',
            'POST   /api/students',
            'PUT    /api/students/<id>',
            'DELETE /api/students/<id>'
        ]
    })


# ============================================================
# TEST
# ============================================================

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({
        'success': True,
        'message': 'Python server is running!',
        'database': 'matric_gateway.db'
    })


# ============================================================
# LOGIN
# ============================================================

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username', '').strip()
    password = data.get('password', '').strip()

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password required'}), 400

    try:
        db = sqlite3.connect('matric_gateway.db')
        c = db.cursor()
        hashed = hash_password(password)
        c.execute('''
            SELECT UserID, Username, FullName, Email
            FROM Users
            WHERE (Username = ? OR Email = ?) AND PasswordHash = ?
        ''', (username, username, hashed))
        user = c.fetchone()
        db.close()

        if user:
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'id': user[0],
                    'username': user[1],
                    'fullName': user[2],
                    'email': user[3]
                }
            })
        else:
            return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

    except Exception as e:
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500


# ============================================================
# SIGNUP
# ============================================================

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    fullname = data.get('fullName', '').strip()
    username = data.get('username', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not all([fullname, username, email, password]):
        return jsonify({'success': False, 'message': 'All fields required'}), 400

    if len(username) < 3:
        return jsonify({'success': False, 'message': 'Username must be 3+ characters'}), 400

    if not validate_email(email):
        return jsonify({'success': False, 'message': 'Invalid email format'}), 400

    if len(password) < 6:
        return jsonify({'success': False, 'message': 'Password must be 6+ characters'}), 400

    try:
        db = sqlite3.connect('matric_gateway.db')
        c = db.cursor()

        c.execute('SELECT * FROM Users WHERE Username = ?', (username,))
        if c.fetchone():
            db.close()
            return jsonify({'success': False, 'message': 'Username already taken'}), 409

        c.execute('SELECT * FROM Users WHERE Email = ?', (email,))
        if c.fetchone():
            db.close()
            return jsonify({'success': False, 'message': 'Email already registered'}), 409

        hashed = hash_password(password)
        c.execute('''
            INSERT INTO Users (Username, Email, FullName, PasswordHash)
            VALUES (?, ?, ?, ?)
        ''', (username, email, fullname, hashed))

        db.commit()
        db.close()
        return jsonify({'success': True, 'message': 'Account created'})

    except Exception as e:
        return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500


# ============================================================
# USERS
# ============================================================

@app.route('/api/users', methods=['GET'])
def get_users():
    try:
        db = sqlite3.connect('matric_gateway.db')
        c = db.cursor()
        c.execute('SELECT UserID, Username, Email, FullName, CreateDate FROM Users')
        users = c.fetchall()
        db.close()

        result = []
        for u in users:
            result.append({
                'id': u[0],
                'username': u[1],
                'email': u[2],
                'fullName': u[3],
                'createDate': u[4]
            })
        return jsonify(result)

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# ============================================================
# STUDENTS CRUD
# ============================================================

@app.route('/api/students', methods=['GET'])
def get_students():
    try:
        db = sqlite3.connect('matric_gateway.db')
        c = db.cursor()
        c.execute('SELECT * FROM Students')
        rows = c.fetchall()
        db.close()

        result = []
        for s in rows:
            result.append({
                'id': s[0],
                'firstName': s[1],
                'lastName': s[2],
                'email': s[3],
                'phone': s[4],
                'course': s[5],
                'enrollmentDate': s[6]
            })
        return jsonify(result)

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/students', methods=['POST'])
def add_student():
    data = request.json
    try:
        db = sqlite3.connect('matric_gateway.db')
        c = db.cursor()
        c.execute('''
            INSERT INTO Students (FirstName, LastName, Email, Phone, Course)
            VALUES (?, ?, ?, ?, ?)
        ''', (data['firstName'], data['lastName'], data['email'], data['phone'], data['course']))
        db.commit()
        db.close()
        return jsonify({'success': True, 'message': 'Student added'})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/students/<int:id>', methods=['PUT'])
def update_student(id):
    data = request.json
    try:
        db = sqlite3.connect('matric_gateway.db')
        c = db.cursor()
        c.execute('''
            UPDATE Students
            SET FirstName = ?, LastName = ?, Email = ?, Phone = ?, Course = ?
            WHERE StudentID = ?
        ''', (data['firstName'], data['lastName'], data['email'], data['phone'], data['course'], id))
        db.commit()
        db.close()
        return jsonify({'success': True, 'message': 'Student updated'})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    try:
        db = sqlite3.connect('matric_gateway.db')
        c = db.cursor()
        c.execute('DELETE FROM Students WHERE StudentID = ?', (id,))
        db.commit()
        db.close()
        return jsonify({'success': True, 'message': 'Student deleted'})

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    

# ============================================================
# SERVE SITE FILES (this is the ONLY '/' route now - there used
# to be a second, earlier one above returning JSON, which always
# won and made this one unreachable)
# ============================================================

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({'success': False, 'message': 'Not found'}), 404
    return send_from_directory('.', filename)



# ============================================================
# RUN
# ============================================================

if __name__ == '__main__':
    print("")
    print("========================================")
    print("   MATRIC GATEWAY - PYTHON SERVER")
    print("========================================")
    print("")

    init_db()

    print("")
    print("Server ready at http://localhost:5000")
    print("Press CTRL+C to stop")
    print("========================================")
    print("")

    app.run(debug=True, host='0.0.0.0', port=5000, use_reloader=False)