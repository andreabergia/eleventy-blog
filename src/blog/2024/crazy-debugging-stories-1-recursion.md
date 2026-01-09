---
date: 2024-08-17T11:55:00+02:00
tags:
  - debugging
series: ["Crazy debugging stories"]
title: Crazy debugging stories - Recursion
---

{% postSeries %}

Welcome to the first post of my new miniseries, where I'll be sharing some of the most intricate and entertaining bug investigations I've done throughout my career. I hope you find these stories enjoyable!

# Recursion

Over a decade ago, I used to work in a large and crazy C++ code base. The system had a feature that allowed our customers to search for a record based on a _referred_ field's value. For example, if we had an `incident` table, you could search by an attribute of the incident's `assignee` (which referred to a record of `user`).

We had a report from a customer that, when they tried to use that feature, the webapp froze for a while and then errored with the message "application not available". A quick look at the logs told us that the backend process crashed with a with segmentation fault (`SIGSEGV`). If I remember correctly, the server was, at the time, running HP-UX on [Itanium](https://en.wikipedia.org/wiki/Itanium) - so luckily we had a [core](https://en.wikipedia.org/wiki/Core_dump) file.

After some time to get all the credentials and instructions to access that weird machine, I started investigating the core file with `gdb`. Apparently, the process was crashing in a function that looked something like this:

```cpp#
string buildSearchSql(Transaction &tx, ...) {
    SearchParams params;
    params.tx = tx;
    // ...
}
```

The function would build the search criteria from the HTTP request into a SQL query. If the customer used the referred field search feature to build something like `find me all the incident where assignee is in (find all the users whose manager is :param)`, the function would do a recursive call - the outer call would be to build the query for the `incident` table, and the inner for `user`.

The debugger pointed at line 2 of that function as the point of the crash, which looked impossible - how could a variable declaration crash the process?! So my initial assumption was that the core dump was corrupted due to some invalid memory access, and I started to investigate that function and the callers for memory problems. However, after going at that for a while and not finding anything, I went back to the original line and I started thinking of all that could possibly be happening. You know, when you can't explain what you are seeing, you go back and question your basic assumptions. 🙂

After a while, I realized that the core file was not lying - the process actually _was_ crashing because of a variable declaration. It turned out that `sizeof(SearchParams)` was in the range of 700 kb, and that the HP-UX server was configured with a 2 MB stack size per thread. When the customer was executing a search like the one above on `incident` and `user`, i.e. two levels of recursions, that would work. But, once they went a level deeper in the search recursion (say, some condition on a field referred by `user`, e.g. `user.departement.country = :country`), the stack would blow up because we'd have three recursive calls - and thus three variables of ~700kb allocated on the stack - exceeding the 2 MB stack size!

If I remember correctly, the fix I did at the time was simply to move that variable from the stack to the heap. But this bug's investigation was both surprising and a lot of fun.
