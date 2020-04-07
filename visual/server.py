from flask import Flask, render_template, jsonify, send_file, request, redirect
import pandas as pd
import json
import numpy as np
import sqlite3
from sklearn.metrics.pairwise import cosine_similarity


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
        top_selection = cosine_handoff(tag_data)
        return jsonify(status="success", data=top_selection)

    else:
        return "Not Implemented"
        # return jsonify(status="success", data=tag_data)


def cosine_handoff(tag_data):
    # cosine similarity
    # tags = [1, 3, 8, 10]
    # top_n, tag_ids = get_top_cosine_similar(tags, top_n=5)
    # print(top_n)
    # print(tag_ids)

    selected_tag_ids = [tag['value'] for tag in tag_data]
    top_n, _ = get_top_cosine_similar(selected_tag_ids, top_n=10)
    top_selection = []

    for id, relevance_score in top_n:
        top_selection.append({
            'id': id,
            'relevance_score': relevance_score
        })

    print(top_selection)
    return top_selection


def get_conn():
    db_name = './db/movie_sqlite.db'
    conn = sqlite3.connect(db_name)
    return conn

def get_top_cosine_similar(tag_ids, entity_type=['movies','directors'][0], top_n=10):
    '''
    tag_ids: list of tag ids to consider
    
    return:
        list of tuples [(entity_id, cosine similarity value), ...],
        list of tag ids
    '''
    prefix = 'tt' if entity_type == 'movies' else 'nn'
    select_cols = ',\n'.join([f'sum(case when tag_id = {tg} then relevance end) tag_id_{str(tg)}' for tg in tag_ids])
    sql = f"""
        select fk_id,
            {select_cols}
        from tag_relevance
        where tag_id in {tuple(tag_ids)}
        and fk_id like '{prefix}%'
        group by fk_id;
    """
    conn = get_conn()
    df = pd.read_sql(sql, conn).set_index('fk_id')
    conn.close()
    df['cosine_similarity'] = cosine_similarity(np.ones((1, len(tag_ids))),df.values).T
    df.sort_values('cosine_similarity', inplace=True, ascending=False)
    s = df[:top_n]['cosine_similarity']
    return list(zip(s.index, s)), tag_ids


@app.route('/poster')
def picture():
    return redirect('https://m.media-amazon.com/images/M/MV5BNTJjNmIzYWItNDE4OC00ZWQ3LWI0YzctODQyMTZjM2QxOWJhXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_UY268_CR2,0,182,268_AL_.jpg')



if __name__ == "__main__":
    app.run(debug=True)