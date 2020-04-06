from flask import Flask, render_template, jsonify, send_file
import pandas as pd
import json

app = Flask(__name__)

@app.route('/')
def moreco():
    return render_template('moreco.html')

@app.route('/genome-tags')
def load_tags():
    return send_file('data/genome-tags.csv')

@app.route('/healthcheck')
def hello_world():
    return 'Server Running!'


if __name__ == "__main__":
    app.run(debug=True)