# moreco
Data &amp; Visual Analytics Group Project

<a href="url"><img src="screenshot.png" align="center" width="400" ></a>

# Data Source

3 Data sets were obtained from the following sources:

* IMDB Title- [Basics](https://datasets.imdbws.com/) [info](https://www.imdb.com/interfaces/)
* IMDB Ratings- [Ratings](https://datasets.imdbws.com/)  [info](https://www.imdb.com/interfaces/)
* IMDB Cast/Crew - [Principals](https://datasets.imdbws.com/) [info](https://www.imdb.com/interfaces/)
* IMDB Director/Writer - [Crew](https://datasets.imdbws.com/) [info](https://www.imdb.com/interfaces/)
* GroupLens - [MovieLens 25M](https://grouplens.org/datasets/movielens/) [info](http://files.grouplens.org/datasets/movielens/ml-25m-README.html)

# Database Schema

```
CREATE TABLE tags (
    id integer PRIMARY KEY,
    name text NOT NULL
);
```
```
CREATE TABLE movies (
    id text PRIMARY KEY NOT NULL,
    kind text,
    primary_title text,
    original_title text,
    release_year integer,
    runtime_minutes integer,
    genres text
);
```
```
CREATE TABLE tag_relevance (
    fk_id text NOT NULL,
    tag_id name text NOT NULL,
    relevance real NOT NULL
);
```
```
CREATE TABLE directors (
    id text PRIMARY KEY,
    name text
);
```

# Raw Dataset Schema

**[genome_scores]**
	==>['movieId', 'tagId', 'relevance']

**[genome_tags]**
	==>['tagId', 'tag']

**[links]**
	==>['movieId', 'imdbId', 'tmdbId']

**[movies]**
	==>['movieId', 'title', 'genres']

**[ratings]**
	==>['userId', 'movieId', 'rating', 'timestamp']

**[tags]**
	==>['userId', 'movieId', 'tag', 'timestamp']

**[imdb_name_basics]**
	==>['nconst', 'primaryName', 'birthYear', 'deathYear', 'primaryProfession', 'knownForTitles']

**[imdb_title_basics]**
	==>['tconst', 'titleType', 'primaryTitle', 'originalTitle', 'isAdult', 'startYear', 'endYear', 'runtimeMinutes', 'genres']

**[imdb_ratings]**
	==>['tconst', 'averageRating', 'numVotes']

**[imdb_crew]**
	==>['tconst', 'directors', 'writers']

**[imdb_principals]**
	==>['tconst', 'ordering', 'nconst', 'category', 'job', 'characters']
	
# How to Run

## _Automatic_

The manual steps have been added to a script for convenience.  The database will be downloaded as part of this script.  Downloading will be skipped if it already exists.  Note that this doesn't detect database changes so you will need to manually download it if you don't have the latest database.

1. Run `python run_local.py`

## _Manual_

1. Download the `movie_sqlite.db` database from the [releases](https://github.com/cwipy7/moreco/releases) in the repo.

2. Place downloaded databse in the `db` directory.

3. Navigate to `visual` dir.

4. Start the server with `python server.py`

5. Open web browser to the link posted.

	
# Technologies Used

 <a href="https://www.python.org/"><img src="https://www.python.org/static/community_logos/python-logo-master-v3-TM.png" width="45%"></img></a>
 <a href="https://flask.palletsprojects.com/en/1.1.x/"><img src="https://flask.palletsprojects.com/en/1.1.x/_images/flask-logo.png" width="45%"></img></a>
 
 <a href="https://www.python.org/"><img src="https://www.python.org/static/community_logos/python-logo-master-v3-TM.png" width="45%"></img></a>
 
 <a href="www.heroku.com"><img src="https://brand.heroku.com/static/media/heroku-logotype-spacing-horizontal.7594cf7f.svg" width="45%"></img></a>
 
 <a href="https://www.sqlite.org/index.html"><img src="https://f0.pngfuel.com/png/890/928/sqlite-logo-png-clip-art.png" width="45%"></img></a>
 
 <a href="https://www.postgresql.org/"><img src="https://www.pngfind.com/pngs/m/168-1682595_source-ericsaupe-com-report-mysql-logo-png-postgresql.png" width="45%"></img></a>
 
 <a href="https://pandas.pydata.org/"><img src="https://www.seekpng.com/png/full/70-701902_pandas-logo-pandas-python-logo.png" width="45%"></img></a>
 
 <a href="https://numpy.org/"><img src="https://user-images.githubusercontent.com/98330/64479472-4b35c900-d16c-11e9-8d49-71fc02cd539f.png" width="45%"></img></a>
 
 <a href="https://scikit-learn.org/stable/"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Scikit_learn_logo_small.svg/1280px-Scikit_learn_logo_small.svg.png" width="45%"></img></a>
 
 <a href="https://github.com/"><img src="" width="45%"></img></a>
 
 <a href="https://products.office.com/en-us/excel"><img src="https://i.warosu.org/data/g/thumb/0523/34/1452380794598s.jpg" width="45%"></img></a>
 
 <a href="https://openrefine.org/"><img src="https://www.pilsudski.org/images/stories/2017/OpenRefine.png" width="45%"></img></a>
 
  <a href="https://www.r-project.org/"><img src="https://i.ya-webdesign.com/images/rstudio-vector-2.png" width="45%"></img></a>
  
<a href=" https://en.wikipedia.org/wiki/Microsoft_Paint"><img src="https://fabric-it.com/wp-content/uploads/2019/02/mspaint-logo.jpg" width="45%"></img></a>


<a href="https://d3js.org/"><img src="https://spng.subpng.com/20180417/wce/kisspng-d3-js-javascript-library-data-visualization-tips-5ad5fd4a96eb92.8788130315239734506182.jpg" width="45%"></img></a>

<a href="https://www.spyder-ide.org/"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Spyder_logo.svg/1024px-Spyder_logo.svg.png" width="45%"></img></a>

<a href="https://www.jetbrains.com/pycharm/"><img src="https://resources.jetbrains.com/storage/products/pycharm/img/meta/pycharm_logo_300x300.png" width="45%"></img></a>

<a href="https://products.office.com/en-us/word"><img src="https://s3.amazonaws.com/s3.timetoast.com/public/uploads/photos/10461618/Word_2.0.png" width="45%"></img></a>

<a href="https://www.google.com/slides/about/"><img src="https://blog.ourgreenfish.com/hubfs/Google-Slides-API.jpg" width="45%"></img></a>

<a href="https://www.google.com/forms/about/"><img src="https://www.pngfind.com/pngs/m/297-2974558_google-forms-for-business-google-survey-form-logo.png" width="45%"></img></a>


<a href="https://www.google.com/docs/about/"><img src="https://www.pngfind.com/pngs/m/304-3045968_google-docs-for-business-google-docs-logo-png.png" width="45%"></img></a>


