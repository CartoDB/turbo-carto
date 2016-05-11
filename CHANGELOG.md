# Changelog

## Version 0.8.1
Released 2016-mm-dd


## Version 0.8.0
Released 2016-05-11

- Improve/fix numeric ramps
- Replace properties decl in place instead of appending to parent #25
- Ramp function not coupled with selector types, e.g., polygon-color #24
- Support for tuples via anonymous functions #23


## Version 0.7.1

- Fixes cartocolor dep

## Version 0.7.0

- Cartocolor integration #19


## Version 0.6.0
Released 2016-04-26

- Renames project to turbo-carto.
- adding function to allow arbitrary colors in ramp call #13


## Version 0.5.1
Released 2016-04-26

- Use fixed versions in package.json


## Version 0.5.0
Released 2016-04-04

 - Move SQL API datasource to examples, datasource not part of public API.


## Version 0.4.0
Released 2016-02-24

 - Ramp now reverses rule selectors from min to max values


## Version 0.3.0
Released 2016-02-23

Allow to use a custom number of buckets in ramps #6

Number of buckets can be specified with a param in numeric ramps
and with array lenght in color ramps

IMPORTANT: Backwards incompatible change
Datasource now requires an extra param for the number of buckets.


## Version 0.2.0
Released 2016-02-23

 - Make ramp first level function.
 - Functions now has knowledge and can modify css tree at their decl level.
 - Rewritten using promises.


## Version 0.1.0
Released 2016-02-10

 - Initial release.
