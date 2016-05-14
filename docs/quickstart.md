# Quickstart

## Color ramps: *-fill

### Basic usage

```css
marker-fill: ramp([column_name], (red, green, blue));
                  |                    |
                  v                    |
      column to calculate ramp         |
                                       v
                  it will use a 3 buckets color ramp as provided
```


### Basic usage with colorbrewer or cartocolor

```css
marker-fill: ramp([column_name], colorbrewer(Greens));
                  |                    |
                  v                    |
      column to calculate ramp         |
                                       v
                it will use a color ramp from http://colorbrewer2.org/
```

### Change number of color brewer data classes

```css
marker-fill: ramp([column_name], colorbrewer(YlGnBu, 7));
                                                     |
                                                     v
                                          force number of classes
                                            default: 5 classes
```

### Change quantification method

```css
marker-fill: ramp([column_name], colorbrewer(Reds), jenks);
                                                      |
                                                      v
                                         force quantification method
                                             default: quantiles
```

## Numeric ramps: *-width, *-opacity

### Basic usage

```css
marker-width: ramp([column_name], (4, 8, 16, 32));
                   |                    |
                   v                    |
       column to calculate ramp         |
                                        |
                                        |
                                        |
                                        v
                       provide the steps for the symbol sizes
```

### Basic usage with interpolation for symbol size

```css
marker-width: ramp([column_name], 4, 18);
                   |              |   |
                   v              |   |
       column to calculate ramp   |   |
                                  v   |
           start value for the ramp   |
                                      |
                                      v
                            end value for the ramp
```

### Change quantification method

```css
marker-width: ramp([column_name], 4, 18, equal);
                                           |
                                           v
                               force quantification method
                                    default: quantiles
```

### Change number of buckets

```css
marker-width: ramp([column_name], 4, 18, 6);
                                         |
                                         v
                              force number of buckets
                                    default: 5
```

### Change both: number of buckets and quantification method

```css
marker-width: ramp([column_name], 4, 18, 6, jenks);
                                         |    |
                                         v    |
                   force number of classes    |
                                              v
                                 force quantification method
```

## Options

### Quantification methods

 - quantiles: as per [`CDB_QuantileBins`](https://github.com/CartoDB/cartodb-postgresql/blob/master/scripts-available/CDB_QuantileBins.sql).
 - equal: as per [`CDB_EqualIntervalBins`](https://github.com/CartoDB/cartodb-postgresql/blob/master/scripts-available/CDB_EqualIntervalBins.sql).
 - jenks: as per [`CDB_JenksBins`](https://github.com/CartoDB/cartodb-postgresql/blob/master/scripts-available/CDB_JenksBins.sql).
 - headtails: as per [`CDB_HeadsTailsBins`](https://github.com/CartoDB/cartodb-postgresql/blob/master/scripts-available/CDB_HeadsTailsBins.sql).