---
date: 2014-12-16T21:52:28Z
tags:
- sql
title: SQL - Group by on steroids
aliases: [/sql-group-by-on-steroids]
---

The most powerful SQL databases, like Oracle (but, in this case, also SQL Server, DB2 and Sybase) have a lot of tricks. This time we're going to see one that applies to `GROUP BY` expressions.

First, let's define a simple schema:

```sql
CREATE TABLE Sales (
    country     VARCHAR(10),
    sale_date   DATE,
    amount      NUMBER
);

INSERT ALL
    INTO Sales VALUES ( 'Italy',   TO_DATE('2014-10-01', 'YYYY-MM-DD'), 52)
    INTO Sales VALUES ( 'Italy',   TO_DATE('2014-10-10', 'YYYY-MM-DD'), 54)
    INTO Sales VALUES ( 'Italy',   TO_DATE('2014-11-21', 'YYYY-MM-DD'), 53)
    INTO Sales VALUES ( 'Italy',   TO_DATE('2014-12-20', 'YYYY-MM-DD'), 59)
    INTO Sales VALUES ( 'Italy',   TO_DATE('2015-01-03', 'YYYY-MM-DD'), 51)
    INTO Sales VALUES ( 'France',  TO_DATE('2014-10-03', 'YYYY-MM-DD'), 62)
    INTO Sales VALUES ( 'France',  TO_DATE('2014-10-15', 'YYYY-MM-DD'), 64)
    INTO Sales VALUES ( 'France',  TO_DATE('2014-11-23', 'YYYY-MM-DD'), 63)
    INTO Sales VALUES ( 'France',  TO_DATE('2014-12-21', 'YYYY-MM-DD'), 6)
    INTO Sales VALUES ( 'France',  TO_DATE('2015-01-05', 'YYYY-MM-DD'), 61)
    INTO Sales VALUES ( 'Germany', TO_DATE('2014-10-07', 'YYYY-MM-DD'), 72)
    INTO Sales VALUES ( 'Germany', TO_DATE('2014-10-30', 'YYYY-MM-DD'), 74)
    INTO Sales VALUES ( 'Germany', TO_DATE('2014-11-15', 'YYYY-MM-DD'), 73)
    INTO Sales VALUES ( 'Germany', TO_DATE('2014-12-30', 'YYYY-MM-DD'), 79)
    INTO Sales VALUES ( 'Germany', TO_DATE('2015-01-15', 'YYYY-MM-DD'), 71)
    SELECT 1 FROM DUAL;
```

Incidentally, notice [the trick](https://stackoverflow.com/questions/39576/best-way-to-do-multi-row-insert-in-oracle) we used to insert multiple rows.

Let's also create a simple view to help us group the data by years and months:

```sql
CREATE OR REPLACE VIEW VWSales AS
SELECT country,
       sale_date,
       EXTRACT(year FROM sale_date) AS year,
       EXTRACT(month FROM sale_date) AS month,
       EXTRACT(day FROM sale_date) AS day,
       amount
  FROM Sales;
```

Ok, let's start with a simple query: let's get the total of sales by country and year:

```sql
SELECT country, year, SUM(amount)
  FROM VWSales
 GROUP BY country, year;
```

which gives us the expected answer:

```
France   2014    195
France   2015    61
Germany  2014    298
Germany  2015    71
Italy    2014    218
Italy    2015    51
```

Now, let's make the request a bit harder. We want to get the total of sales by country and year, but also see the total for a given country across all years and the total for an year across all countries. Basically, if we placed the data in a matrix-like, row-column organization, we want to see the totals across the rows and columns. We can achieve this with this query:

```sql
SELECT * FROM
(
  SELECT country, year, SUM(amount)
    FROM VWSales
   GROUP BY country, year
  UNION ALL
  SELECT country, NULL, SUM(amount)
    FROM VWSales
   GROUP BY country
  UNION ALL
   SELECT NULL, year, SUM(amount)
    FROM VWSales
   GROUP BY year
)
ORDER BY country, year
```

which gives us:

```
France    2014      195
France    2015      61
France    (null)    256
Germany   2014      298
Germany   2015      71
Germany   (null)    369
Italy     2014      218
Italy     2015      51
Italy     (null)    269
(null)    2014      711
(null)    2015      183
```

If we take a look at the execution plan, though, we can see that we have three full table scans on our table. That's terrible!

### GROUP BY CUBE

A better solution to our requirement is to use the great `GROUP BY CUBE` feature. Let's first see the new query:

```sql
SELECT country, year, SUM(amount)
  FROM VWSales
 GROUP BY CUBE(country, year)
 ORDER BY country, year
```

This query extracts (almost) the same result as before: we actually have one more row for `(null)`, `(null)`. However, the execution plan is quite different: we now have only one full table scan! Muchbetter!

So, what does the `GROUP BY CUBE` syntax means? It basically tells Oracle to perform all the combinations of the columns included, meaning that not only do we get all the pairs of values, but we also get pairs of the form `(null, year)`, `(country, null)` and `(null, null)` automatically. This can be extremely helpful if we need some OLAP-like kind of reporting, from which actually the `CUBE` name is taken.

Obviously you don't have to include only two columns in the `GROUP BY` clause; any number will work, but be careful because you'll get an explosion of results since all the possible combinations will be computed.

### GROUP BY ROLLUP

A related feature is `GROUP BY ROLLUP`. Suppose you'd need to get the same query as before, but including also the month. `GROUP BY CUBE` would generate too many rows, since it would also generate rows of the form `(country, null as year, month)` which aren't that useful: our columns have a _hierarchical_ structure. So, we can write the query with `GROUP BY ROLLUP`:

```sql
SELECT country, year, month, SUM(amount)
  FROM VWSales
 GROUP BY ROLLUP(country, year, month)
 ORDER BY country, year, month
```

which gives us:

```
France      2014    10      126
France      2014    11      63
France      2014    12      6
France      2014    (null)  195
France      2015    1       61
France      2015    (null)  61
France      (null)  (null)  256
Germany     2014    10      146
Germany     2014    11      73
Germany     2014    12      79
Germany     2014    (null)  298
Germany     2015    1       71
Germany     2015    (null)  71
Germany     (null)  (null)  369
Italy       2014    10      106
Italy       2014    11      53
Italy       2014    12      59
Italy       2014    (null)  218
Italy       2015    1       51
Italy       2015    (null)  51
Italy       (null)  (null)  269
(null)      (null)  (null)  894
```

Quoting from [Oracle's documentation](https://docs.oracle.com/cd/B12037_01/server.101/b10736/aggreg.htm):

> ROLLUP enables a SELECT statement to calculate multiple levels of subtotals across a specified group of dimensions. It also calculates a grand total. ROLLUP is a simple extension to the GROUP BY clause, so its syntax is extremely easy to use. The ROLLUP extension is highly efficient, adding minimal overhead to a query.

### GROUPING SETS

To get even more control, we can use `GROUP BY GROPING SETS`. This allows us to specify multiple ways of grouping up the data. For instance, the previous query with `ROLLUP` did not include rows of the type `(null, year, null)` since the grouping was hierarchical on all dimensions, including the country. Similary, the first query with `CUBE`, if we added months, would have had a lot of pointless rows. We can solve the problem with `GROUPING SETS`:

```sql
SELECT country, year, month, SUM(amount)
  FROM VWSales
 GROUP BY GROUPING SETS((country, year, month),
                        (country, year),
                        (country),
                        (year),
                        ())
 ORDER BY country, year, month
```

Basically we have to give the convenience of the expressions `ROLLUP` and `CUBE` and specifiy manually all the different kinds of aggregations we want. However, we can get exactly the results we want:

```
France      2014    10      126
France      2014    11      63
France      2014    12      6
France      2014    (null)  195
France      2015    1       61
France      2015    (null)  61
France      (null)  (null)  256
Germany     2014    10      146
Germany     2014    11      73
Germany     2014    12      79
Germany     2014    (null)  298
Germany     2015    1       71
Germany     2015    (null)  71
Germany     (null)  (null)  369
Italy       2014    10      106
Italy       2014    11      53
Italy       2014    12      59
Italy       2014    (null)  218
Italy       2015    1       51
Italy       2015    (null)  51
Italy       (null)  (null)  269
(null)      2014    (null)  711
(null)      2015    (null)  183
(null)      (null)  (null)  894
```

Notice that we have had to include the special group `()` to get the grand total.

### Conclusions

Admittedly, this kind of queries don't come up very often. But, when they do, `GROUP BY CUBE`, `ROLLUP` and `GROUPING SETS` can give you a much simpler and faster query.

Some documentation is available at [Oracle's](https://docs.oracle.com/cd/B12037_01/server.101/b10736/aggreg.htm) and [SQL Server's](http://technet.microsoft.com/en-us/library/bb522495(v=sql.105).aspx) websites.
