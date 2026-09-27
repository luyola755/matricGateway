import sqlite3
db = sqlite3.connect('matric_gateway.db')
c = db.cursor()

# See all users
c.execute('SELECT UserID, Username, FullName, Email FROM Users')
print("USERS:")
for row in c.fetchall():
    print(row)

# See all students
c.execute('SELECT * FROM Students')
print("\nSTUDENTS:")
for row in c.fetchall():
    print(row)

db.close()