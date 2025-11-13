---
date: 2015-03-02T21:10:49Z
tags:
- sql
title: CONNECT BY in Oracle
aliases: [/connect-by-in-oracle]
---

In this post, we're going to discuss a very useful SQL extension to work with hierarchal queries. This is sadly only implemented by Oracle and although a [few other databases](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL) support it as well, it won't work in PostgreSQL, MySql nor SQL Server.

### The dataset

Let's create a _very_ simple hierarchal dataset to work with.

```sql
CREATE TABLE GeoArea
(
    parentName  VARCHAR2(100),
    code        VARCHAR2(100)
);

INSERT INTO GeoArea VALUES (NULL, 'World');
INSERT INTO GeoArea VALUES ('World', 'Europe');
INSERT INTO GeoArea VALUES ('Europe', 'Germany');
INSERT INTO GeoArea VALUES ('Germany', 'Berlin');
INSERT INTO GeoArea VALUES ('Germany', 'Stuttgart');
INSERT INTO GeoArea VALUES ('Germany', 'Hamburg');
INSERT INTO GeoArea VALUES ('Europe', 'Italy');
INSERT INTO GeoArea VALUES ('Italy', 'Rome');
INSERT INTO GeoArea VALUES ('Italy', 'Turin');
INSERT INTO GeoArea VALUES ('Italy', 'Milan');
INSERT INTO GeoArea VALUES ('World', 'Asia');
INSERT INTO GeoArea VALUES ('Asia', 'China');
INSERT INTO GeoArea VALUES ('China', 'Beijing');
```

### `CONNECT BY`

Let's now see an example of a query that uses the tree structure:

```sql
SELECT code, LEVEL
  FROM GeoArea
 CONNECT BY PRIOR code = parentName
 START WITH parentName IS NULL;
```

The result set is:

```
World       1
Asia        2
China       3
Beijing     4
Europe      2
Germany     3
Berlin      4
Hamburg     4
Stuttgart   4
Italy       3
Milan       4
Rome        4
Turin       4
```

The `CONNECT BY` clause is used to express the relationship between a node and the previous one (either the parent or the child); in this case we are matching the `parentName` of the current record with the `code` of the `PRIOR` record. This means that we are going down in the tree; the `PRIOR` record represents the parent and the current record the child.

The `START WITH` clause can be used to filter the starting nodes of the tree. Note that this is quite different from putting the filter in the `WHERE` clause: the `WHERE` is applied first and is used to filter the complete dataset. Afterwards the `START WITH` expression is used to select the starting nodes of the trees, that will be built from the records filtered by the `WHERE` expression. Thus the records that match the `WHERE` expression should be a complete subtree of the initial table.

In this query we have used the special column `LEVEL`. This represent the 1-based depth of the record in the tree.

### `CONNECT_BY_ROOT` and `SYS_CONNECT_BY_PATH`

Let's another sample query:

```sql
SELECT code, CONNECT_BY_ROOT code, SYS_CONNECT_BY_PATH(code, '/')
  FROM GeoArea
 CONNECT BY PRIOR code = parentName
 START WITH parentName IS NULL
 ORDER BY LEVEL;
```

This query returns:

```
World       World   /World
Europe      World   /World/Europe
Asia        World   /World/Asia
Germany     World   /World/Europe/Germany
Italy       World   /World/Europe/Italy
China       World   /World/Asia/China
Rome        World   /World/Europe/Italy/Rome
Milan       World   /World/Europe/Italy/Milan
Stuttgart   World   /World/Europe/Germany/Stuttgart
Hamburg     World   /World/Europe/Germany/Hamburg
Turin       World   /World/Europe/Italy/Turin
Beijing     World   /World/Asia/China/Beijing
Berlin      World   /World/Europe/Germany/Berlin
```

The `CONNECT_BY_ROOT` expression returns the value of the following expression in the root node of the subtree containing the current record.

The `SYS_CONNECT_BY_PATH` is used to get the full path of the given node, starting from the root, and using the given string to join nodes. In this case we are building the path given by the `code` of the records, joining them with a slash.

It shouldn't be a surprise that we can use `LEVEL` in the `ORDER BY` clause, as shown.

### `ORDER SIBLINGS BY`

It's often useful to get a tree sorted so that we get the nodes in order relative to their siblings. For instance, in this case we might want to get all the nodes under Italy together, sorted by `code`. This can be achieved with the useful `ORDER SIBLINGS BY` clause:

```sql
SELECT code, SYS_CONNECT_BY_PATH(code, '/')
  FROM GeoArea
 CONNECT BY PRIOR code = parentName
 START WITH parentName IS NULL
 ORDER SIBLINGS BY code;
```

which returns:

```
World       /World
Asia        /World/Asia
China       /World/Asia/China
Beijing     /World/Asia/China/Beijing
Europe      /World/Europe
Germany     /World/Europe/Germany
Berlin      /World/Europe/Germany/Berlin
Hamburg     /World/Europe/Germany/Hamburg
Stuttgart   /World/Europe/Germany/Stuttgart
Italy       /World/Europe/Italy
Milan       /World/Europe/Italy/Milan
Rome        /World/Europe/Italy/Rome
Turin       /World/Europe/Italy/Turin
```

### A bottom-up example

For completeness, let's see an example of a `CONNECT BY` query that starts from the leaves and goes up in the tree:

```sql
CREATE TABLE Employees
(
    name        VARCHAR2(100),
    manager     VARCHAR2(100)
);

INSERT INTO Employees VALUES ('Mark', 'Alex');
INSERT INTO Employees VALUES ('Alex', 'Eric');
INSERT INTO Employees VALUES ('Tony', 'Alex');
INSERT INTO Employees VALUES ('Eric', NULL);

SELECT name, LEVEL
  FROM Employees
  CONNECT BY PRIOR manager = name
  START WITH name = 'Mark';
```

The `SELECT `query starts with `Mark` and returns all the employees that are its manager, recursively.

```
Mark    1
Alex    2
Eric    3
```

### Conclusions

The `CONNECT BY` construct, while Oracle-specific, can be an excellent way to simplify complex queries. Furthermore, it tends to have excellent performances (similarly to [window functions]({% ref "2014-11-12-introduction-to-sql-window-functions.markdown" %}) or [`GROUP BY CUBE`]({% ref "2014-12-16-sql-group-by-on-steroids.markdown" %})), given that it is a first-class tool.
