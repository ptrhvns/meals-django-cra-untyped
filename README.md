# Meals

## Description

This is a website for managing meals (recipes, menus, shopping lists, grocery
stores, etc.).

## Setting Up a Development Environment.

The following assumes the use of a Linux (Ubuntu 20.04) development environment.

- Install programming language version managers (see external instructions):

  - [pyenv](https://github.com/pyenv/pyenv)
  - [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv)
  - [nodenv](https://github.com/nodenv/nodenv)

- Install Python a virtual environment:

  ```sh
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

