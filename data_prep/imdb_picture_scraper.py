import pandas as pd
import requests
from bs4 import BeautifulSoup as BS
import numpy as np

ids = pd.read_csv("movies_and_directors.csv")
ids = ids.drop(ids.columns[0], axis=1)

def get_url(entity_id):
    if entity_id.startswith("nm"):
        url =  'https://www.imdb.com/name/'+entity_id
        return (url, False)
    else:
        url = 'https://www.imdb.com/title/'+entity_id
        return (url, True)

urlList = list()
size = len(ids)
count = 0
for row in ids.iterrows():
    print("Processing {} / {}".format(count, size))
    entity = (row[1]['entity_id'])
    url = get_url(entity)
    #print(url)
    page = requests.get(url[0])
    soup = BS(page.content, "html.parser")     
    if url[1]:
        #for movies
        try:
            poster = soup.find("div", {"class": "poster"})
            picture = poster.a.img['src']
            urlList.append(picture)   
        except(TypeError):
            urlList.append("NONE")
    else:
        try:
        #for directors
            poster = soup.find("img", {"id": "name-poster"})
            picture = poster['src']    
            urlList.append(picture)   
        except(TypeError):
            urlList.append("NONE")
    count += 1
    
ids['img_url'] = np.array(urlList)
ids.to_csv('image_urls.csv', index=False)

