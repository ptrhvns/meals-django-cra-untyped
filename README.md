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
