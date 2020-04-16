import pandas as pd
import requests
from bs4 import BeautifulSoup as BS
import numpy as np

df = pd.read_csv("movieid_title_year.csv")

urlList = list()
size = len(df)
count = 0
errors = 0
print(urlList)

for row in df.iterrows():
        print("Processing {} / {}, errors {}".format(count, size, errors))
        title = (row[1]['primary_title']).replace(" ","+").replace("-", "+")
        year =  (row[1]['release_year'])
        search_terms = "{}+{}+trailer".format(title,year)
        #print(search_terms)
        url = "https://www.youtube.com/results?search_query={}".format(search_terms)
        page = requests.get(url)
        soup = BS(page.content, "html.parser")    
        try:
            video = soup.find("a", {"class": "yt-uix-sessionlink spf-link"})
            #print(video)
            video_url = video['href']
            #print(video_url)
            urlList.append(video_url)   
        except(TypeError, AttributeError):
            urlList.append("NONE")
            errors += 1
        count += 1
    
df['video_url']= np.array(urlList)
df.to_csv('video_urls.csv', index=False)
print("complete!")

