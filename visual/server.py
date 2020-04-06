from flask import Flask, render_template, jsonify, send_file, request
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

# Passing selected tag data back to python server so we can run cosine similarity or other algorithms in python
@app.route('/tagselection', methods=['GET', 'POST'])           
def tag_selection_from_d3():
    if request.method == 'POST':
        tag_data = request.get_json()
        print("Server received: ", tag_data)
        top_movies = cosine_handoff(tag_data)
        return jsonify(status="success", data=top_movies)

    else:
        return "Not Implemented"
        # return jsonify(status="success", data=tag_data)


def cosine_handoff(tag_data):
    # something something cosine
    movie_names = ['movie1_' + tag_data[0]['tag'], 'movie2_' + tag_data[0]['tag']]
    top_movies = [
        {   'movie': movie_names[0],
            'tag_relevance': '0.99'
        },
        {   'movie': movie_names[1],
            'tag_relevance': '0.70'
        }
    ]

    return top_movies



if __name__ == "__main__":
    app.run(debug=True)