# Meals

## Description

This is a website for managing meals (recipes, menus, shopping lists, grocery
stores, etc.).

## Setting Up a Development Environment

The following assumes the use of a Linux (Ubuntu 20.04) development environment.

- Install programming language version managers (see external instructions):

  - [pyenv](https://github.com/pyenv/pyenv)
  - [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv)
  - [nodenv](https://github.com/nodenv/nodenv)

- Install Python a virtual environment:

  ```sh
  cd server
  PYTHON_VERSON=$(awk -F/ '{print $1}' .python-version)
  pyenv install $PYTHON_VERSION
  pyenv virtualenv $PYTHON_VERSON meals
  pyenv shell "${PYTHON_VERSON}/envs/meals"
  ```

- Install [Poetry](https://python-poetry.org) for Python dependency management
  (use `pyenv-virtualenv` to manage the virtualenv as it seems to handle shell
  issues better).

- Install Node.js:

  ```sh
  cd client
  NODE_VERSION=$(cat .node-version)
  nodenv install $NODE_VERSION
  ```

- Install application packages:

  ```sh
  poetry install
  (cd client; npm install)
  ```

- Install [PostgreSQL](https://www.postgresql.org/) (tested on version 12.8):

  ```sh
  sudo apt update -y
  sudo apt install postgresql postgresql-contrib
  ```

- Configure PostgreSQL:

  ```sh
  sudo service postgresql start
  sudo -u postgres createuser --interactive

    Enter name of role to add: meals
    Shall the new role be a superuser? (y/n) y

  sudo -u postgres createdb meals
  sudo -u postgres psql

    alter user meals password '$PASSWORD';
    \q

  psql -d meals -U meals -W # Test that user and privileges work.

    create table testtable (id serial primary key, testcol text);
    drop table testtable;
    \q
  ```

- Install [Redis](https://redis.io/) (tested on version 6.0.6):

  ```sh
  sudo apt update -y
  sudo apt install redis-server
  ```

- Configure Redis:

  ```sh
  sudo $EDITOR /etc/redis/redis.conf

    # ...
    # supervised no
    supervised systemd
    # ...
    # requirepass foobared
    requirepass $PASSWORD
    # ...

  sudo systemctl restart redis.service
  ```

- Setup environment variables for server application:

  ```sh
  cd server
  cp config/.env.example config/.env

  # Generate a SECRET_KEY for use below.
  python -c 'from django.core.management import utils; print(utils.get_random_secret_key())'

  # Edit config file, and put in valid values.
  $EDITOR config/.env
  ```

- Run database migrations:

  ```sh
  cd server
  python manage.py migrate
  ```

- Create Django superuser for access admin site:

  ```sh
  cd server
  python manage.py createsuperuser
  ```

## Running Development Processes

- Start the Django server (serves the API):

  ```sh
  cd server
  python manage.py runserver
  ```

- Start Celery (runs background jobs):

  ```sh
  cd server
  watchmedo auto-restart --directory=./ -p '*tasks*.py' -R -- celery -A config worker -l INFO
  ```

- Start the React server (serves the client app):

  ```sh
  cd client
  npm start
  ```

## Running tests

- Run server tests:

  ```sh
  cd server
  pytest
  ```

- Run server tests, and report on test coverage:

  ```sh
  cd server

  # Pick one of:
  pytest --cov --cov-report html # HTML report
  pytest --cov --cov-report term-missing # terminal report

  # Open htmlcov/index.html with a browser if HTML report is chosen.
  ```
