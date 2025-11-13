---
date: 2022-05-28T09:08:28Z
tags:
  - sql
title: PostgreSQL and MVCC
aliases: [/2022/05/postgresql-mvcc]
---

As promised in a [previous article](/postgresql-is-awesome), let's discuss what MVCC is and why it is fundamenta to the workings of PostgreSQL. Even if you are a dev and not a DBA, I believe it is very helpful to have at least a rough understanding of how it works.

Let us start with an example. We have a very simple schema such as:

```sql
create table book (
    book_id      bigint,
    title           varchar(256)
);

insert into book (book_id, title) values
(1, 'The lord of the rings'),
(2, 'Crime and punishment'),
(3, 'The moon is a harsh mistress'),
(4, 'Pride and prejudice');
```

Imagine you are running two transactions in your database, let's call them `T1` and `T2`. In your first transactions, you run this statement:

```sql
T1=# begin transaction;
delete from book where book_id = 1;
```

In your second transaction you run

```sql
T2=# select count(*) from book;
 count
-------
     4
(1 row)
```

This is expected - the first transaction has not committed yet, so the second transaction will see what was previously written on the database. This is because the default [isolation level](https://www.postgresql.org/docs/14/transaction-iso.html) for PostgreSQL is _read committed_, which does what you would expect.

However, the if we run the same query in the first transaction, you will see that the count is three, as expected.

```sql
T1=*# select count(*) from book;
 count
-------
     3
(1 row)
```

MVCC is a core technique used by PostgreSQL (and other databases, such as Oracle) to implement the various isolation levels _without_ requiring table locks (i.e., without needing to stop all transactions, such as T2, that want to access a table that is being modified).

## Transaction id

Whenever you start a new transaction, PostgreSQL will assign a numerical, increasing ID to it. You can find it with this query:

```sql
T1=*# select txid_current();
 txid_current
--------------
          742
(1 row)
```

Each row of each table in your database will actually contains a few [hidden, system columns](https://www.postgresql.org/docs/current/ddl-system-columns.html), in particular:

- `xmin` will contain the ID of the transaction that _created_ the row;
- `xmax` will contain the ID of the transaction that _deleted_ the row, or zero if the row has not been deleted.

Let's see what happens in our case. Our T1 has the id 742, where our T2 has the id 743 in my example. If we run the following query in T2:

```sql
T2=*# select xmin, xmax, book_id from book order by book_id;
 xmin | xmax | book_id
------+------+---------
  740 |  742 |       1
  740 |    0 |       2
  740 |    0 |       3
  740 |    0 |       4
(4 rows)
```

Here we can see that the book with id 1 has been deleted by the transaction 742 (T1). However, since T1 has not committed yet, the row is still visible for T2, as we are using the isolation level _read committed_.

If we run the same query on T1, the result is different since `xmax = 742 <= txid_current()`, and thus the first row is excluded from the result set:

```sql
T1=*# select xmin, xmax, book_id from book order by book_id;
 xmin | xmax | book_id
------+------+---------
  740 |    0 |       2
  740 |    0 |       3
  740 |    0 |       4
(3 rows)
```

If T1 commits, the changes are visible to all transactions, and the row is effectivly gone. If we do this:

```sql
T1=*# commit;
COMMIT
```

we cannot see the row anymore from T2:

```sql
T2=# select xmin, xmax, book_id from book where xmax = 742 or book_id = 1;
 xmin | xmax | book_id
------+------+---------
(0 rows)
```

The row is now really gone.

## At the physical layer

However, the row might actually be still present on disk; it just will not be accessible by any transaction anymore, because no running transaction has an `id <= 742`.

PostgreSQL will not delete the row eagerly from the disk when T1 commits, for performances reasons. Rather, the row will be physically deleted a process called [vacuum](https://www.postgresql.org/docs/current/sql-vacuum.html), whose job is to go through the database and physicall remove from the pages any row which is not visible anymore, - i.e., the rows whose `xmax` is smaller than any active transaction.

You can launch vacuum manually, but PostgreSQL includes an [autovacuum daemon](https://www.postgresql.org/docs/current/routine-vacuuming.html) whose job is to reclaim the space in the background.

This is an extremely important of the PostgreSQL architecture. However, I am not a DBA and I do not enough experience to tell you what the best practices and autovacuum settings are, but I hope this brief introduction gave you an idea about how the database works underneath the hood.

## Addendum: transaction ID wraparound

As we mentioned before, the transaction ID is an increasing integer. For performances reason, this is a signed 32-bit integer - therefore, it has a limit of about 2 billion and it might wrap around, eventually, if you have an heavy load on your database or simply let it run for years. When this happens, PostgreSQL will reset it to zero. If some rows had not been vacuum-ed yet, you might end up with some deleted that suddenly re-appears in your results, due to the `xmax` rule we discussed before!

Therefore, it is fundamental that the vacuum process runs periodically. PostgreSQL will detect when there is a risk of this situation arising (because the vacuum hasn't been run in enough time) and will start to log warnings, eventually shutting down and refusing to serve new commands when it detects that vacuum is required _now_. The always-excellent [PostgreSQL documentation](https://www.postgresql.org/docs/current/routine-vacuuming.html) has a lot more details on the topic.
