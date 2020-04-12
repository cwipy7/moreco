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
