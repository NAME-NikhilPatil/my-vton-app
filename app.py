from flask import Flask, render_template, send_from_directory

# Initialize the Flask app
app = Flask(__name__, static_folder='static')

@app.route('/')
def index():
    """Serves the main index.html file."""
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    """Serves files from the static folder (for main.js)."""
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)