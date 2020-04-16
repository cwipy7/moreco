-------------------- DESCRIPTION --------------------

The provided code package can be used to deploy a locally-hosted web application
named MoReco (MOvie RECOmender), for tag-based movie recommendations. It consists
of a D3 (Data-Driven Documents) front-end and Python back-end. The directory
structure of the package has been described in greater detail below:

The `data_prep` directory contains CSVs (comma separated values) pertaining to
the downloaded datasets as well as the programatically obtained datasets.
The dataset consists of several sources: IMDB (Internet Movie DataBase),
MovieLens, and YouTube.  Initial EDA (exploratory data analysis), cleaning,
munging, and loading of the data was performed in the iPython (interactive Python)
Notebooks used to prepare the data.

The `visual` directory contains the bulk of the application code. The `data`
subdirectory houses the csv file containing all the tags handled by the
application, and the `db` subdirectory is where the `movie_sqlite.db` database
is downloaded to before starting the application. The `static` subdirectory
contains files required for front-end functionality (css (cascading style sheet),
javascript, images, etc (et cetera). The `templates` subdirectory contains the
html (hypertext markup language) file from which the MoReco webpage is generated.
The `server.py` script is used to launch a local server on which the app can be
run.

The `requirements.txt` file contains a list of all the Python libraries
required to run the application. The `run_local.py` file is a convenient script
that can be used to automatically install and run the package (more details in
the following section). The `screenshot.png` file contains a sample image of
what the application looks like when used.



-------------------- INSTALLATION --------------------

NOTE: We have hosted the MoReco app at https://moreco-app.herokuapp.com, which
      can be used as an alternative to running a local installation as
      described below.  The resources are limited on our hosted server, so during
      down times the app will be in hibernation mode and unresponsive
      for up to 30 seconds, once the app becomes active, it will remain active
      until a period in which no requests are made for 1 hour.

All the manual steps for installation have been automated into a convenient
script. Run `python run_local.py` (Pip Installs Packages) under the main directory
in order to automatically install the python requirements, download the database,
and start a local server.

Alternately, if the automated script does not work, here are the manual steps:

1) Un-pack the zip directory and navigate into the `moreco` directory using the
   command line terminal.

2) Run `pip install -r requirements.txt` to ensure that all required libraries
   are present. A python version of 3.7 or above is MOre RECOmmended than any
   older versions.

3) Download the `movie_sqlite.db` database from the following URL:
   https://github.com/cwipy7/moreco/releases/download/1/movie_sqlite.db

4) Place the database in the `visual/db/` directory (the location is marked
   with a file named `place_db_in_this_dir.txt`).

5) Navigate to the `visual/` directory and start the server by running the
   following command: `python server.py`.

6) Open a web browser and go to the link displayed in the terminal.



-------------------- EXECUTION --------------------

Instructions to use the application can be found on the webpage. They disappear
after searching for a movie, but can be toggled to appear again if needed. The
general outline to search for a movie is as follows:

1) Under the 'tags' list in the top left menu, select up to four tags. Desired
   tags may be found by scrolling through the list, or by using the search bar.

2) Click the '>' button to move the selected tags over to the 'selected tags'
   menu. Once chosen, tags can be removed by selecting them in the 'selected
   tags' menu and clicking the '<' button.

3) Once all the desired tags have been selected, click the 'Find Movies!' button.
   This will bring up a sunburst chart in the top right of the webpage (note
   that this step may take some time to complete as the recommendations are
   being processes and calculated).

4) The 'Legend' exists in the top right corner to show the color corresponding
   to each of the selected tags.

5) Each arc level in the sunburst chart corresponds to a number of tags taken
   into consideration when providing a recommendation.  The arc that is closest
   to the center of the circle represents 1 tag.  When traveling outwards from the
   center, each additional arc level adds 1 tag to the tags to consider when
   calculating the recommendation.  Each fragment of an arc on the sunburst chart
   corresponds to a specific permutation (weighted ordering) of the selected tags.
   Note that there may be some movie recommendations which are not unique to a
   given sunburst chart.

6) The weight given to the circles in the sunburst chart is maximum for the
   innermost circle and reduces as one moves outwards. Hence, for the innermost
   circle, choose the tag that is most important. Moving outwards, choose tags
   in decreasing order of importance.

6) As you mouse over different arcs, the title of the movie will be displayed
   below the sunburst chat and the poster of the of the movie recommended will
   appear in the centre of the sunburst.

7) Once you click on an arc, a tooltip containing information about the movie
   will appear next to the cursor. In addition, a youtube video containing a
   trailer for the movie will appear in the bottom left of the webpage (under
   the tag selection menu). Finally, a bar chart showing the relevance of each
   tag to that particular movie recommendation will appear in the bottom right
   of the webpage (under the sunburst chart).  These tag relevance scores
   shown in the bar chart are the raw (un-weighted) scores of the tags for the
   particular movie as they exist in the dataset.  The weighted scores used in
   calculating the Euclidean distance metric are not displayed.



-------------------- DEMO VIDEO --------------------

TODO
