from flask import Flask, render_template, jsonify, send_file, request, redirect
import pandas as pd
import json
import numpy as np
import sqlite3
from sklearn.metrics.pairwise import cosine_similarity, euclidean_distances
import itertools


app = Flask(__name__)
tag_cache = {}

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
        # print("Server received: ", tag_data)
        top_selection = similarity_handoff(tag_data)
        return jsonify(status="success", data=top_selection)

    else:
        return "Not Implemented"
        # return jsonify(status="success", data=tag_data)


def similarity_handoff(tag_data):
    top_selection = []
    pathways = {
        'path': [],
        'recommendation': [],
        'image': [],
        'trailer': [],
        'tag_scores': [],
        'metadata': []
    }
    tag_mapper = populate_tag_data()

    selected_tag_ids = [tag['value'] for tag in tag_data]
    selected_tag_names = [tag['tag'] for tag in tag_data]

    tagCombinations = generateCombinations(selected_tag_ids)
    tagCombinations_list = [i.split("+") for i in tagCombinations]

    for combination in tagCombinations_list:
        result = get_top_similar(combination, metric='weighted_euclidean', top_n=1)
        top_recommend = result[0][0][0]
        top_recommend_tag_scores = result[1][0]
        # print('top_recommend: ', top_recommend)
        # print(top_recommend_tag_scores)
        pathways['path'].append(combination)
        pathways['recommendation'].append(get_entity_name(top_recommend))
        pathways['image'].append(get_poster_img_link(top_recommend))
        pathways['trailer'].append(get_trailer(top_recommend))
        pathways['tag_scores'].append(top_recommend_tag_scores)
        pathways['metadata'].append(get_tooltip_metadata(top_recommend))

    # convert all tag_ids in path into names
    for index1, path in enumerate(pathways['path']):
        for index2, element in enumerate(path):
            pathways['path'][index1][index2] = tag_mapper[int(element)]

    # convert all tag_ids in tag_scores into names
    for index1, tag_scores in enumerate(pathways['tag_scores']):
        for index2, element in enumerate(tag_scores):
            pathways['tag_scores'][index1][index2] = (tag_mapper[int(element[0])], element[1])

    top_selection.append({
        "sunburst": pathways
    })

    return top_selection

def open_pkl_jar(table):
    global tag_cache
    if tag_cache.get(table) is None:
        pkl_filename = f'./db/pickles/{table}.pkl'
        tag_cache[table] = pd.read_pickle(pkl_filename, compression='gzip')
    return tag_cache[table]

def get_conn():
    db_name = './db/movie_sqlite.db'
    conn = sqlite3.connect(db_name)
    return conn

def get_top_similar(tag_ids, entity_type=['movies','directors'][0], top_n=10,
                    metric=['euclidean', 'cosine', 'weighted_euclidean'][0]):
    '''
    tag_ids: list of tag ids to consider (in ascending order)

    return:
        list of tuples [(entity_id, similarity value), ...],
        list of tag ids
    '''
    prefix = 'tt' if entity_type == 'movies' else 'nn'

    df = open_pkl_jar('scores')
    tag_cols = [f'tag_id_{t}' for t in tag_ids]
    df = df[tag_cols].copy()

    metric_function = {
        'euclidean': euclidean_distances,
        'weighted_euclidean': weighted_euclidean,
        'cosine'   : cosine_similarity,
    }[metric]
    df[f'{metric}_similarity'] = metric_function(np.ones((1, len(tag_ids))), df.values).T
    df.sort_values(f'{metric}_similarity', inplace=True, ascending=False if metric=='cosine' else True)
    s = df[:top_n][f'{metric}_similarity']

    col_names = [f'tag_id_{tg}' for tg in tag_ids]
    individual_tag_scores = [list(zip([c.strip('tag_id_') for c in df[:5][col_names].columns], r)) for r in df[:5][col_names].values]
    return list(zip(s.index, s))+[], individual_tag_scores, tag_ids

    # return list(zip(s.index, s))+[], tag_ids


def weighted_euclidean(v1, v2, descending_weights=True):
    # weights are set at [1, 1/2, 1/4, 1/8, ...]    # TODO: experiment with alternative weighting schemes
    weights = [(1/(2**i)) for i in range(v2.shape[1])]
    if not descending_weights:
        weights.reverse()
    dist = v1-v2
    return np.sqrt((weights*dist**2).sum(axis=1))


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

    df = open_pkl_jar(entity_type)
    res = df[name_col][fk_id]
    res = res if res else None

    return res

def get_poster_img_link(fk_id):

    df = open_pkl_jar('posters')
    res = df['img_url'][fk_id]
    res = res if res else None

    return res

def generateCombinations2(tagList):
    # itertools.permutations returns list of tuples
    # need to convert each tuple into strings separated by '+' chars
    tupleCombinations = list(itertools.permutations(tagList))
    joinedCombinations = []

    for tupleElem in tupleCombinations:
        joinedElem = ""
        for tag in tupleElem:
            joinedElem = joinedElem + str(tag) + "+"
        # have an extra '+' at the end that we need to remove
        joinedCombinations.append(joinedElem[:-1])

    return joinedCombinations

def populate_tag_data():
    df = open_pkl_jar('tags')
    return dict(df['name'])


def generateCombinations(tagList):
    # itertools.permutations returns list of tuples
    # since we need permutations for all possible lengths,
	# we have a loop to go over them from low to high
    tupleCombinations = []
    low = 1
    high = len(tagList) + 1
    for num in range(low, high):
        tempNumList = [list(x) for x in itertools.permutations(tagList, num)]
        tupleCombinations.extend(tempNumList)

    # need to convert each tuple into strings separated by '+' chars
    joinedCombinations = []

    for tupleElem in tupleCombinations:
        joinedElem = ""
        for tag in tupleElem:
            joinedElem = joinedElem + str(tag) + "+"
        # have an extra '+' at the end that we need to remove
        joinedCombinations.append(joinedElem[:-1])

    return joinedCombinations

def get_trailer(fk_id):
    df = open_pkl_jar('trailers')
    roll_em = 'oHg5SJYRHA0'
    res = df['yt_video_id'].get(fk_id, roll_em)
    return res


def get_tooltip_metadata(fk_id):
    cols = ['year',
            'genres',
            'title',
            'runtime_minutes']
    df = open_pkl_jar('movie_meta')
    res = df[cols][df.index == fk_id].copy()
    res = tuple(res.to_records()[0])
    return res if res else None

if __name__ == "__main__":
    app.run(debug=True)
