BABEL = node_modules/.bin/babel
WEBPACK = node_modules/.bin/webpack
LINT = node_modules/.bin/eslint

WEBPACK_ARGS = --config webpack.config.js -p

SRC = $(shell find src -name "*.js" -type f)
LIB = $(SRC:src/%.js=lib/%.js)

all : build

build : $(LIB)

$(LIB) : lib/%.js: src/%.js
	mkdir -p $(@D)
	$(LINT) $<
	$(WEBPACK) $(WEBPACK_ARGS)

clean :
	rm -rf lib

clean-deps :
	rm -rf node_modules

.PHONY: build clean clean-deps

