---
date: 2015-10-18T12:48:47Z
tags:
- sql
title: Order by and nulls in SQL
aliases: [/order-by-and-nulls-in-sql]
---

Now and then you will have an `ORDER BY` clause in a `SELECT` over a column which can have `NULL` values. The order where the `NULL` values will be placed depends on the DMBS; [by default](https://docs.oracle.com/cd/E11882_01/server.112/e41084/statements_10002.htm#SQLRF55368) Oracle will place `NULLs` at the end for ascending sort and at the beginning for descending sort.

However many databases (including Oracle and [PostgreSQL](http://www.postgresql.org/docs/8.3/static/queries-order.html), but excluding SQL Server, SQLite and MySQL) allow you to use the standard SQL clause `NULLS FIRST` or `NULLS LAST` to override this behavior, or for portability:

```sql
SELECT *
  FROM myTable
 ORDER BY myField NULLS FIRST
```

If your database doesn't support this clause, you can use something like this to achieve the same result:

```sql
SELECT *
  FROM myTable
 ORDER BY (CASE WHEN myField IS NULL THEN 0 ELSE 1 END), myField
```
