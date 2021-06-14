from flask import Flask, render_template, request, redirect, jsonify, send_from_directory
import pandas as pd


app = Flask(__name__)
# global variables
COUNTRIES = []


@app.route('/')
@app.route('/<page>')
def showpage(page=None):
   if page:
      if page == "table":
         return showtable()
      else:
      # called with page parameter
         return render_template(f'{page}.html', countries=COUNTRIES)
   else:
      # called with no parameters 
      return render_template('index.html')
   

@app.route('/data/<path:path>')
def send_data(path):
    return send_from_directory('data', path)
 
def showtable():
   data = pd.read_csv("web/data/covid-data.csv")

   months = {'01' : 'January', '02' : 'February', '03' : 'March', '04' : 'April', '05' : 'May', '06' : 'June',
             '07' : 'July', '08' : 'August', '09' : 'September', '10' : 'October', '11' : 'November', '12' : 'December'}
   data["month"] = data["date"].apply(lambda x: x.split("-")[1]).apply(lambda x: months[x])
   data["year"] = data["date"].apply(lambda x: x.split("-")[0])


   data["COVID cases for 100 000 people"] = 100000 * (data["total_cases"] / data["population"])
   data["COVID cases for 100 000 people"] = data["COVID cases for 100 000 people"].apply(lambda x: x if pd.isna(x) else int(x))
   data["COVID deaths for 100 000 people"] = 100000 * (data["total_deaths"] / data["population"])
   data["COVID deaths for 100 000 people"] = data["COVID deaths for 100 000 people"].apply(lambda x: x if pd.isna(x) else int(x))

   selection = ["continent", "location", "date", "year", "month", "new_cases", "new_deaths", "total_cases","total_deaths", "COVID cases for 100 000 people", "COVID deaths for 100 000 people"]

   data = data.loc[data['date'].str.endswith("-01")]

   return render_template('table.html', columns=selection, data=data[selection].values)


@app.before_first_request
def compute():
   # download last data here 
   data = pd.read_csv("web/data/covid-data.csv")
   global COUNTRIES
   COUNTRIES = data["location"].unique()
   
   
   