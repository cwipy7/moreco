# moreco
Data &amp; Visual Analytics Group Project

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

**[genome_tags]**
	==>['tagId', 'tag']

**[links]**
	==>['movieId', 'imdbId', 'tmdbId']

**[movies]**
	==>['movieId', 'title', 'genres']

**[tags]**
	==>['userId', 'movieId', 'tag', 'timestamp']

**[imdb_title_basics]**
	==>['tconst', 'titleType', 'primaryTitle', 'originalTitle', 'isAdult', 'startYear', 'endYear', 'runtimeMinutes', 'genres']

**[imdb_crew]**
	==>['tconst', 'directors', 'writers']

**[imdb_principals]**
	==>['tconst', 'ordering', 'nconst', 'category', 'job', 'characters']

**[imdb_name_basics]**
	==>['nconst', 'primaryName', 'birthYear', 'deathYear', 'primaryProfession', 'knownForTitles']

**[directors]**
	==>['id', 'name']
