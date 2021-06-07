from flask import Flask, render_template, request, redirect, jsonify, send_from_directory
import pandas as pd


app = Flask(__name__)
# global variables
COUNTRIES = []


@app.route('/')
@app.route('/<page>')
def showpage(page=None):
   if page:
      # called with page parameter
      return render_template(f'{page}.html', countries=COUNTRIES)
   else:
      # called with no parameters 
      return render_template('index.html')
   

@app.route('/data/<path:path>')
def send_data(path):
    return send_from_directory('data', path)
 
 
 
@app.before_first_request
def compute():
   # download last data here 
   data = pd.read_csv("web/data/covid-data.csv")
   global COUNTRIES
   COUNTRIES = data["location"].unique()
   