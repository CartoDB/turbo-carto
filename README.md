# Turbo CartoCSS

AKA CartoCSS preprocessor

tl;dr Enables adding functions to CartoCSS that can be evaluated asynchronously.

[![Build Status](https://travis-ci.org/CartoDB/turbo-cartocss.png?branch=master)](https://travis-ci.org/CartoDB/turbo-cartocss)

TBC.

## Limitations

 - TBA

## Dependencies

 * Node >=0.10
 * npm >=2.x

## Install

To install the rest of the dependencies just run:

```
npm install
```

#### Some examples

Current examples expect to have CartoDB's SQL API running at http://development.localhost.lan:8080/. It should have a
publicly accessible `populated_places_simple` table.

Examples using a cli tool:

```shell
$ ./tools/cli.js examples/populated_places.css # will use a dummy datasource, check tools/cli.js source
$ ./tools/cli.js examples/populated_places.css --datasource sql --query 'select * from populated_places_simple'
```

Visit `examples/index.html`, it also .

## Tests

Tests suite can be run with:

```
npm test
```

That will check code style and run the tests.

## TODO

See https://github.com/CartoDB/turbo-cartocss/issues
