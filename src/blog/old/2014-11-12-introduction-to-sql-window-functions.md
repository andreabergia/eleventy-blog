---
date: 2014-11-12T22:43:00Z
tags:
- sql
title: Introduction to SQL Window Functions / 1
aliases: [/introduction-to-sql-window-functions]
---

Window functions are an extremely powerful powerful part of the SQL 2003 standard, supported by most modern releases of databases such as Oracle 8+, Postgres 9.1+, SQL Server 2005+ and others. Sadly neither SQLLite or MySql seem to support them yet, but if you are working with a database where they are available, _do_ use them: they can make your life a lot easier. Generally, with window functions, you can write simpler and faster code than you would without.

Let's start with a very simple schema and some data:

```sql
CREATE TABLE Sales (
  article_id VARCHAR(10),
  year INTEGER,
  quantity INTEGER
);

INSERT INTO Sales VALUES ('Shirts', 2008, 63);
INSERT INTO Sales VALUES ('Shirts', 2009, 66);
INSERT INTO Sales VALUES ('Shirts', 2010, 68);
INSERT INTO Sales VALUES ('Shirts', 2011, 72);
INSERT INTO Sales VALUES ('Shirts', 2012, 69);
INSERT INTO Sales VALUES ('Shirts', 2013, 71);
INSERT INTO Sales VALUES ('Shirts', 2014, 74);

INSERT INTO Sales VALUES ('Jeans', 2008, 31);
INSERT INTO Sales VALUES ('Jeans', 2009, 33);
INSERT INTO Sales VALUES ('Jeans', 2010, 36);
INSERT INTO Sales VALUES ('Jeans', 2011, 33);
INSERT INTO Sales VALUES ('Jeans', 2012, 38);
INSERT INTO Sales VALUES ('Jeans', 2013, 41);
INSERT INTO Sales VALUES ('Jeans', 2014, 40);
```

You can play with this dataset on [SQLFiddle](http://sqlfiddle.com/#!12/a6513/15).

Let's start simple: let's extract the average, minimum and maximum sales for each article type. This can be achieved with a simple `GROUP BY` query:

```sql
SELECT
  article_id,
  AVG(quantity) as average,
  MIN(quantity) as worst,
  MAX(quantity) as best
FROM Sales
GROUP BY article_id
```

which returns:

```
ARTICLE_ID  AVERAGE  WORST  BEST
Jeans       36       31     41
Shirts      69       63     74
```

What if we wanted to extract the year with the best result? Then the query becomes more complicated. For example, we could write it like this:

```sql
SELECT
  article_id,
  year,
  quantity
FROM Sales s1
WHERE s1.quantity = ( SELECT MAX(quantity)
                        FROM Sales s2
                       WHERE s1.article_id = s2.article_id )
```

which returns:

```
ARTICLE_ID  YEAR    QUANTITY
Shirts      2014    74
Jeans       2013    41
```

Another option is to use the `ALL` clause, and write the query like this:

```sql
SELECT
  article_id,
  year,
  quantity
FROM Sales s1
WHERE s1.quantity >= ALL ( SELECT s2.quantity
                             FROM Sales s2
                            WHERE s1.article_id = s2.article_id )
```

The two queries above should have the same execution plan and performances.

### Simple window functions

Ok, so far so good. Let us now suppose you wanted to extract the sales for each year and article _and_ the maximum for that article type. We can do it like this:

```sql
SELECT
  article_id,
  year,
  quantity,
  (SELECT MAX(s2.quantity)
     FROM Sales s2
    WHERE s2.article_id = s1.article_id) AS maxForArticle
FROM Sales s1
```

This query returns, as expected:

```
ARTICLE_ID  YEAR    QUANTITY    MAXFORARTICLE
Shirts      2008    63          74
Shirts      2009    66          74
Shirts      2010    68          74
Shirts      2011    72          74
Shirts      2012    69          74
Shirts      2013    71          74
Shirts      2014    74          74
Jeans       2008    31          41
Jeans       2009    33          41
Jeans       2010    36          41
Jeans       2011    33          41
Jeans       2012    38          41
Jeans       2013    41          41
Jeans       2014    40          41
```

This is a situation where window functions can help. Let's start by seeing the query:

```sql
SELECT
  article_id,
  year,
  quantity,
  MAX(quantity) OVER (PARTITION BY article_id) AS maxForArticle
FROM Sales
```

The syntax is: _window function name_ (in this case `MAX`), then the `OVER` clause and a window definition. In this case, we want to take the maximum value of the field `quantity` on the subset of records with the given `article_id`, so we'll `PARTITION` the data by `article_id`. We can use different functions; `AVG`, `MIN`, `COUNT` and others that we'll discuss later.

Window definitions can include a `PARTITION` clause and/or an `ORDER BY` clause. Note that we can use multiple windows in a query:

```sql
SELECT
  article_id,
  year,
  quantity,
  MAX(quantity) OVER (PARTITION BY article_id) AS maxByArticle,
  MAX(quantity) OVER (PARTITION BY year) AS maxByYear
FROM Sales s1
ORDER BY article_id, year
```

In this case we have two windows, one that works by `article_id` and one by `year`.

Window functions, for what we saw so far, seem little more than just syntax, but actually they can be _far_ more efficient than sub-selects. Databases have special support for window functions and can execute better plans for them.

### LAG and LEAD functions

Let's now start with an harder request. Let's suppose we want to extract the difference in sales between one year and the previous. We can use the functions `LAG` or `LEAD` to solve this problem. These window functions extract (respectively) the previous or next value in the given window.

Let's take a look at this query:

```sql
SELECT
  article_id,
  year,
  quantity,
  LAG(quantity) OVER (PARTITION BY article_id
                      ORDER BY year) AS prevYear
FROM Sales s1
ORDER BY year, article_id
```

The data returned by this query is:

```
ARTICLE_ID   YEAR   QUANTITY    PREVYEAR
Jeans        2008   31          (null)
Shirts       2008   63          (null)
Jeans        2009   33          31
Shirts       2009   66          63
Jeans        2010   36          33
Shirts       2010   68          66
Jeans        2011   33          36
Shirts       2011   72          68
Jeans        2012   38          33
Shirts       2012   69          72
Jeans        2013   41          38
Shirts       2013   71          69
Jeans        2014   40          41
Shirts       2014   74          71
```

We are asking for the value value (`LAG`) of the given expression - in this case `quantity` - on the previous record `OVER` the given window - in this case `PARTITION BY article_id ORDER BY year`. This is a partition that includes the sales of the same article as the current row. With the `ORDER BY` clause, we have sorted the data by `year` and so we know what the previous record is - the record for the previous year. Note that even though we have a different `ORDER BY` in the outer `SELECT`, the window function has no problem pulling the correct data.

To get the value in the _next_ record, we can use `LEAD`.

Let's now solve the request above and extract the difference between the sales of one year from the previous:

```sql
SELECT
  article_id,
  year,
  quantity,
  quantity - LAG(quantity) OVER (PARTITION BY article_id
                                 ORDER BY year)
                                 AS diffFromPrev
FROM Sales s1
ORDER BY year, article_id
```

which gives this result:

```
ARTICLE_ID  YEAR    QUANTITY    DIFFFROMPREV
Jeans       2008    31          (null)
Shirts      2008    63          (null)
Jeans       2009    33          2
Shirts      2009    66          3
Jeans       2010    36          3
Shirts      2010    68          2
Jeans       2011    33          -3
Shirts      2011    72          4
Jeans       2012    38          5
Shirts      2012    69          -3
Jeans       2013    41          3
Shirts      2013    71          2
Jeans       2014    40          -1
Shirts      2014    74          3
```

Finally, if you want to use a window function over all the data set, you can use the syntax `OVER ()`.

### Conclusions

Window functions can not only solve lots of problems that would require writing very complex queries, or ad-hoc iterative code in the requesting application, but they can also often do it with higher performances. Go, learn and use them!

**Update**: [part two]({% ref "2014-11-20-introduction-to-sql-window-functions-2.markdown" %}) is available.
