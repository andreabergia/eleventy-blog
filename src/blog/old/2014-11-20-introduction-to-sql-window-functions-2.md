---
date: 2014-11-20T21:57:44Z
tags:
- sql
title: Introduction to SQL Window Functions / 2
aliases: [/introduction-to-sql-window-functions-2]
---

As we have seen [in the previous part]({% ref "2014-11-12-introduction-to-sql-window-functions.markdown" %}), window functions are an usefull tool to solve a lot of SQL problems with great performances. Let's see some more tricks.

### LAG and LEAD revised

We have already discussed the window functions `LAG` and `LEAD`. As we have said, they are used to get respectively the previous or next value in the window. What we haven't mentioned is that you can not only take the previous, but also the record before (or after) it and so on. The syntax is more generally `LAG(expression, n)`, where using `LAG(expression)` means `n = 1`. So we can write queries like these:

```sql
SELECT
  article_id,
  year,
  quantity,
  LAG(quantity) OVER (PARTITION BY article_id
                      ORDER BY year) AS prevYear,
  LAG(quantity, 2) OVER (PARTITION BY article_id
                      ORDER BY year) AS twoYearsAgo
FROM Sales s1
ORDER BY year, article_id
```

Try doing that without window functions!

## ROW NUMBER

The window function `ROW_NUMBER` assigns an unique number to each record in the window. You might have already used this function without a window definition, but it actually _is_ a window function. Notice that the number assigned to records with the same position in the window is random.

Let's take a look at this query:

```sql
SELECT
  article_id,
  year,
  quantity,
  ROW_NUMBER() OVER (PARTITION BY article_id ORDER BY quantity)
 FROM Sales s1
ORDER BY article_id, year
```

The data returned by this query is:

```
ARTICLE_ID  YEAR    QUANTITY    ROW_NUMBER
Jeans       2008    31          1
Jeans       2009    33          3
Jeans       2010    36          4
Jeans       2011    33          2
Jeans       2012    38          5
Jeans       2013    41          7
Jeans       2014    40          6
Shirts      2008    63          1
Shirts      2009    66          2
Shirts      2010    68          3
Shirts      2011    72          6
Shirts      2012    69          4
Shirts      2013    71          5
Shirts      2014    74          7
```

It isn't predictable which values Jeans 2009 and Jeans 2011 will have, since they both have the same `quantity`.

## RANK and DENSE RANK

The window function `RANK` will give the logical position of the record in the window. The difference between it and `ROW_NUMBER` is records that order in the same position will have the same rank.

`RANK` will skip missing values, meaning that you might have a sequence like 1, 2, 2, 4. `DENSE_RANK` is almost identical, except that it won't skip position, so it would return 1, 2, 2, 3. Because of this, `RANK` might perform slightly faster in some situations. Let's see the following query:

```sql
SELECT
  article_id,
  year,
  quantity,
  RANK() OVER (PARTITION BY article_id ORDER BY quantity),
  DENSE_RANK() OVER (PARTITION BY article_id ORDER BY quantity)
 FROM Sales s1
ORDER BY article_id, quantity
```

The results are:

```
ARTICLE_ID  YEAR    QUANTITY    RANK    DENSE_RANK
Jeans       2008    31          1       1
Jeans       2011    33          2       2
Jeans       2009    33          2       2
Jeans       2010    36          4       3
Jeans       2012    38          5       4
Jeans       2014    40          6       5
Jeans       2013    41          7       6
Shirts      2008    63          1       1
Shirts      2009    66          2       2
Shirts      2010    68          3       3
Shirts      2012    69          4       4
Shirts      2013    71          5       5
Shirts      2011    72          6       6
Shirts      2014    74          7       7
```

## FIRST VALUE and LAST VALUE

The functions `FIRST_VALUE` and `LAST_VALUE` will return, well, the first and last value of an expression over the window. The difference between them and `MIN` or `MAX` is that you can select the first value of an expression, but apply an `ORDER BY` _another_ expression! Sample time:

```sql
SELECT
  article_id,
  year,
  quantity,
  FIRST_VALUE(quantity) OVER (PARTITION bY article_id
                              ORDER BY year)
                              AS firstYear
 FROM Sales s1
ORDER BY article_id, quantity
```

```
ARTICLE_ID  YEAR    QUANTITY    FIRSTYEAR
Jeans       2008    31          31
Jeans       2009    33          31
Jeans       2011    33          31
Jeans       2010    36          31
Jeans       2012    38          31
Jeans       2014    40          31
Jeans       2013    41          31
Shirts      2008    63          63
Shirts      2009    66          63
Shirts      2010    68          63
Shirts      2012    69          63
Shirts      2013    71          63
Shirts      2011    72          63
Shirts      2014    74          63
```
