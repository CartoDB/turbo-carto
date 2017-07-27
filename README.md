# Turbo-Carto

Next-Gen Styling for Data-Driven Maps, AKA CartoCSS preprocessor.

tl;dr Enables adding functions to CartoCSS that can be evaluated asynchronously.

[![Build Status](https://travis-ci.org/CartoDB/turbo-carto.png?branch=master)](https://travis-ci.org/CartoDB/turbo-carto)

## Ramps

It's all about ramps.

You can create color and symbol size ramps with just a single line of code. You no longer need to worry about
calculating the bins for your thematic map, if your data changes your CartoCSS changes.


### Very basic introduction to CartoCSS

In CartoCSS you usually assign values to properties and apply filters in order to change those values based on some
data attributes.

The general form for properties and filters is:

```css
#selector {
    property: value;
    [filter] {
        property: value;
    }
}
```

An example of a filter based on price attribute:

```css
#selector {
    marker-width: 10;
    [price > 100] {
        marker-width: 20;
    }
}
```

### Turbo-Carto ramps

Turbo-Carto high-level API for ramps is as follows:

```css
#selector {
    property: ramp([attribute], (...values), (...filters), mapping);
}
```

Where:
 - `property` is the CartoCSS property you want to create.
 - `[attribute]` usually is a column/key name from your dataset.
 - `(...values)` is **what** `property` is gonna get for different filters.
 - `(...filters)` is **how** `property` is gonna get the different values.
 - `mapping` is the type of filter that will be applied: <, <=, >, >=, =.

So for the previous example you could write (see [examples/readme/example-0.css](./examples/readme/example-0.css)):

```css
#selector {
    marker-width: ramp([price], (10, 20), (100));
}
```

In this case, the first value is the default value.


If you want to have a category map, to generate a CartoCSS like:

```css
#selector {
    marker-fill: red;
    [room_type = "Private Room"] {
        marker-fill: green;
    }
}
```

You can use the same approach but specifying the mapping type to be an equality (see [examples/readme/example-1.css](./examples/readme/example-1.css)):

```css
#selector {
    marker-fill: ramp([room_type], (green, red), ("Private room"), =);
}
```

See that in this case the last value is the default value, and if the number of values is equal to the number of filters
it won't have a default value, like in (see [examples/readme/example-2.css](./examples/readme/example-2.css)):

```css
#selector {
    marker-fill: ramp([room_type], (green, red), ("Private room"), =);
}
```

That's nice, but it is still unlinked from the actual data/attributes.

#### Mappings default values

 - `<` and `<=`: Last provided value will be the default value.
 - `=`: Last provided value will be the default value, if the number of values is
equal to the number of filters it won't have a default value.
 - `>` and `>=`: First provided value will be the default value.

#### Associate ramp filters to your data

To generate ramps based on actual data you have to say what kind of quantification you want to use, for that purpose
Turbo-Carto provides some shorthand methods that will delegate the filters computation to different collaborators.

Let's say you want to compute the ramp using jenks as quantification function (see [examples/readme/example-3.css](./examples/readme/example-3.css)):

```css
#selector {
    marker-width: ramp([price], (10, 20, 30), jenks());
}
```

Or generate a category map depending on the room_type property (see [examples/readme/example-4.css](./examples/readme/example-4.css)):

```css
#selector {
    marker-fill: ramp([room_type], (red, green, blue), category(2));
}
```

You can override the mapping if you know your data requires an more strict filter (see [examples/readme/example-5.css](./examples/readme/example-5.css)):

```css
#selector {
    marker-width: ramp([price], (10, 20, 30), jenks(), >=);
}
```

Shorthand methods include:
 - `category()`: default mapping is `=`.
 - `equal()`: default mapping is `>`.
 - `headtails()`: default mapping is `<`.
 - `jenks()`: default mapping is `>`.
 - `quantiles()`: default mapping is `>`.

#### Color schemes

For color schemes, there are a couple of handy functions to retrieve color palettes: `cartocolor` and `colorbrewer`.

You can create a choropleth map using Reds color palette from colorbrewer (see [examples/readme/example-6.css](./examples/readme/example-6.css)):

```css
#selector {
    polygon-fill: ramp([avg_price], colorbrewer(Reds), jenks());
}
```

Or a category map using Bold color palette from cartocolor (see [examples/readme/example-7.css](./examples/readme/example-7.css)):

```css
#selector {
    polygon-fill: ramp([room_type], cartocolor(Bold), category(4));
}
```

Go to [CARTOcolors](https://carto.com/carto-colors) website to discover the wide diversity of color schemes that are available.

#### Numeric ramps

Sometimes is really useful to have a continuous range that can be split in as many bins as desired, so you don't have to
worry about how many values you have to provide for your calculated filters. You only specify the start and the end, and
the values are computed linearly (see [examples/readme/example-8.css](./examples/readme/example-8.css)):

```css
#selector {
    marker-width: ramp([price], range(4, 40), equal(5));
}
```

It is kind of similar to color palettes where depending on your number of filters you get the correct number of values.


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

Visit `examples/index.html`, to test different styles using CartoDB's SQL API as datasource.

## Tests

Tests suite can be run with:

```
npm test
```

That will check code style and run the tests.

## TODO

See https://github.com/CartoDB/turbo-carto/issues
