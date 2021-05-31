from flask import Flask, render_template, request, redirect, jsonify, send_from_directory

app = Flask(__name__)

@app.route('/')
def index():
   print("hello")
   return render_template('index.html')


@app.route('/endpoint')
def endpoint():
   return jsonify(username="mokart", email="mokart@mokart.fr", id="1")


@app.route('/')
@app.route('/<page>')
def showpage(page=None):
   if page:
      # called with page parameter
      return render_template(f'{page}.html')
   else:
      # called with no parameters 
      return render_template('index.html')
   
   
@app.route('/data/<path:path>')
def send_data(path):
    return send_from_directory('data', path)