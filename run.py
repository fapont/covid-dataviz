from web import app
import requests
from data_cleaning import barchartrace

def download_data():
    req = requests.get("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/owid-covid-data.csv?raw=true")
    url_content = req.content
    csv_file = open('web/data/covid-data.csv', 'wb')
    csv_file.write(url_content)
    csv_file.close()



if __name__ == "__main__":
    download_data()
    barchartrace().clean_generate()
    app.run(debug=True, port=8000)
    