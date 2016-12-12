# Changelog

## Version 0.19.0
Released 2016-12-12
 
 - Updated CartoColor version to 4.0.0.


## Version 0.18.0
Released 2016-10-11

 - Adds column to metadata rules.


## Version 0.17.1
Released 2016-09-28

 - Fix selector in rules metadata.


## Version 0.17.0
Released 2016-09-28

 - Returns a metadata object per parsed rule.


## Version 0.16.0
Released 2016-07-21

 - Updates cartocolor to 3.0.0.


## Version 0.15.1
Released 2016-07-20

 - Fix category ramps: force equality filter on non numeric filters.


## Version 0.15.0
Released 2016-07-19

 - New API: `property: ramp([attribute], (...values), (...filters), mapping);`.
   - It's backwards compatible with previous signatures.
 - New `range(min, max)` function.
 - High level functions for quantifications: `category()`, `equal()`, `headtails()`, `jenks()`, and `quantiles()`.
 - Improved documentation and examples.
 - Removes `colors` and `buckets` function.


## Version 0.14.0
Released 2016-07-06

 - Improve turbo-carto error with better messages: context not part of message anymore.


## Version 0.13.0
Released 2016-07-05

- Updates cartocolor to 2.0.2 #38.


## Version 0.12.1
Released 2016-06-20

 - Ramps using as many values as provided when there are less than tuples #37


## Version 0.12.0
Released 2016-06-13

- Added context object to TurboCartoError


## Version 0.11.0
Released 2016-06-03

- Export version from package


## Version 0.10.1
Released 2016-06-01

- Use double quotes for exact strategy.


## Version 0.10.0
Released 2016-05-19

- Add support for exact strategies, this allows, for instance, to create categorical ramps.


## Version 0.9.1
Released 2016-05-17

- Updates cartocolor to 1.1.0


## Version 0.9.0
Released 2016-05-13

- Adds custom errors to expose better/more information about what failed
- Strategy for ramp datasource: allows to hint turbo-carto about how to split buckets
- Allow providing a hardcoded quantification ramp via anonymous function


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
and with array length in color ramps

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
