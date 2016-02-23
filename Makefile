SHELL=/bin/bash

all:
	npm install

clean:
	@rm -rf ./node_modules

node_modules:
	npm install

dist:
	./node_modules/.bin/browserify -s turbocartocss src/index.js > dist/bundle.js

jshint: node_modules
	@./node_modules/.bin/jshint src/ test/

check-code-style: node_modules
	./node_modules/.bin/semistandard

format: node_modules
	./node_modules/.bin/semistandard-format -w src/*.js src/**/*.js test/**/*.js

TEST_SUITE := $(shell find test/{integration,unit} -name "*.js")

MOCHA_TIMEOUT := 500

test: node_modules
	./node_modules/.bin/mocha -u bdd -t $(MOCHA_TIMEOUT) $(TEST_SUITE) ${MOCHA_ARGS}

test-all: check-code-style jshint test

coverage: node_modules
	@./node_modules/.bin/istanbul cover node_modules/.bin/_mocha -- -u bdd -t 5000 $(TEST_SUITE)

.PHONY: dist test coverage
