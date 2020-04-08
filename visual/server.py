from flask import Flask, render_template, jsonify, send_file, request, redirect
import pandas as pd
import json
import numpy as np
import sqlite3
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances


app = Flask(__name__)

@app.route('/')
def moreco():
    return render_template('moreco.html')

@app.route('/genome-tags')
def load_tags():
    return send_file('data/genome-tags.csv')

@app.route('/visit-sequences')
def load_csv():
    return send_file('data/visit-sequences.csv')

@app.route('/healthcheck')
def hello_world():
    return 'Server Running!'

# Passing selected tag data back to python server so we can run cosine similarity or other algorithms in python
@app.route('/tagselection', methods=['GET', 'POST'])           
def tag_selection_from_d3():
    if request.method == 'POST':
        tag_data = request.get_json()
        print("Server received: ", tag_data)
        top_selection = similarity_handoff(tag_data)
        return jsonify(status="success", data=top_selection)

    else:
        return "Not Implemented"
        # return jsonify(status="success", data=tag_data)


def similarity_handoff(tag_data):
    # euclidean distance
    # tags = [1, 3, 8, 10]
    # top_n, tag_ids = get_top_cosine_similar(tags, top_n=5)
    # print(top_n)
    # print(tag_ids)

    selected_tag_ids = [tag['value'] for tag in tag_data]
    top_n, _ = get_top_similar(selected_tag_ids, top_n=10)
    top_selection = []

    for fk_id, relevance_score in top_n:
        print(fk_id)
        # entity_name = get_entity_name(fk_id)
        # url = get_poster_img_link(fk_id)   
        top_selection.append({
            'id': fk_id,
            'relevance_score': relevance_score,
            # 'img_link': url
        })

    print(top_selection)
    return top_selection


def get_conn():
    db_name = './db/movie_sqlite.db'
    conn = sqlite3.connect(db_name)
    return conn

def get_top_similar(tag_ids, entity_type=['movies','directors'][0], top_n=10,
                    metric=['euclidean', 'cosine'][0]):
    '''
    tag_ids: list of tag ids to consider (in ascending order)
    
    return:
        list of tuples [(entity_id, similarity value), ...],
        list of tag ids
    '''
    prefix = 'tt' if entity_type == 'movies' else 'nn'
#     select_cols = ',\n'.join([f'sum(case when tag_id = {tg} then relevance end) tag_id_{str(tg)}' for tg in tag_ids])
    select_cols = ',\n'.join([f'tag_id_{tg}' for tg in tag_ids])
    sql = f"""
        select fk_id,
            {select_cols}
        from scores
        where fk_id like '{prefix}%'
        ;
    """
    conn = get_conn()
    df = pd.read_sql(sql, conn).set_index('fk_id')
    conn.close()
    metric_function = {
        'euclidean': euclidean_distances,
        'cosine'   : cosine_similarity,
    }[metric]
       
    df[f'{metric}_similarity'] = metric_function(np.ones((1, len(tag_ids))),df.values).T
    df.sort_values(f'{metric}_similarity', inplace=True, ascending=False if metric=='cosine' else True)
    s = df[:top_n][f'{metric}_similarity']
    return list(zip(s.index, s))+[], tag_ids


def get_entity_name(fk_id):
    prefix = fk_id[:2]
    entity_type = {
        'nm': 'directors',
        'tt': 'movies',
    }[prefix]
    
    name_col = {
        'nm': 'name',
        'tt': 'primary_title',
    }[prefix]
    
    sql = f"""
        select {name_col}
        from {entity_type}
        where id = '{fk_id}'
        ;
    """
    conn = get_conn()
    c = conn.cursor()
    c.execute(sql)
    res = c.fetchall()[0][0]
    conn.close()
    return res

def get_poster_img_link(fk_id):    
    sql = f'''
        select img_url
        from posters
        where id = '{fk_id}'
    ;
    '''
    conn = get_conn()
    c = conn.cursor()
    c.execute(sql)
    res = c.fetchall()[0][0]
    return res

if __name__ == "__main__":
    # fk = 'nm0617588'
    # print(get_entity_name(fk))
    app.run(debug=True)