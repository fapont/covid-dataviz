from flask import Flask, render_template, request, redirect

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/')
@app.route('/<page>')
def showpage(page=None):
   if page:
      # called with page parameter
      return render_template(f'{page}.html')
   else:
      # called with no parameters 
      return render_template('index.html')