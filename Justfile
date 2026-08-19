set dotenv-load

# List available commands
[private]
default:
  just help

# List available commands
help:
  just --justfile {{justfile()}} --list

# Chart module from https://github.com/hotosm/justfiles
chart *args:
    @curl -sS https://raw.githubusercontent.com/hotosm/justfiles/main/chart.just \
      -o {{justfile_directory()}}/tasks/chart.just;
    @just --justfile {{justfile_directory()}}/tasks/chart.just --set chart_name "login" {{args}}
