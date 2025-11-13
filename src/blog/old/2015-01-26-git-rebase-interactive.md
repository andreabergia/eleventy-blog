---
date: 2015-01-26T19:44:55Z
tags:
- tools
title: git rebase --interactive
aliases: [/git-rebase-interactive]
---

Git has an excellent tool designed to help you reorder the commit history: _interactive rebase_. This can be excellent if you want to keep the history clean, so that it helps other programmers understand the logic behind the changes rather than the actual sequence of commits. Let's walk through an example.

### Let's write some history

Let's start by creating an empty project in a new directory:

```
$ git init .
```

Let's create a simple program with [an editor](http://www.vim.org/about.php):

```
$ gvim weather.py
```

and enter something like:

```python
import httplib

def get_weather():
    conn = httplib.HTTPConnection('api.openweathermap.org')
    conn.request('GET', '/data/2.5/weather?q=Turin,it')
    response = conn.getresponse()
    print response.read()
    response.close()

if __name__ == '__main__':
    get_weather()
```

Let's do our first commit:

```
$ git add weather.py
$ git commit -m "Fetching the weather"
```

So far so good. Now let's edit a bit our code so that it parses the received json:

```python
import httplib
import json

def print_formatted_data(data):
    weather = json.loads(data)
    print weather

def get_weather():
    conn = httplib.HTTPConnection('api.openweathermap.org')
    conn.request('GET', '/data/2.5/weather?q=Turin,it')
    response = conn.getresponse()
    data = response.read()
    print_formatted_data(data)
    response.close()

if __name__ == '__main__':
    get_weather()
```

and commit:

```
$ git add weather.py
$ git commit -m "Parsing the weather as json"
```

Next, let's make the location a parameter:

```python
import httplib
import json
import sys

def print_formatted_data(data):
    weather = json.loads(data)
    print weather

def get_city():
    if len(sys.argv) == 1:
        return 'Turin'
    return sys.argv[1]

def get_weather():
    conn = httplib.HTTPConnection('api.openweathermap.org')
    conn.request('GET', '/data/2.5/weather?q=' + get_city())
    response = conn.getresponse()
    data = response.read()
    print_formatted_data(data)
    response.close()

if __name__ == '__main__':
    get_weather()
```

and commit:

```
$ git add weather.py
$ git commit -m "Added support for command-line city"
```

Now let's print out the weather a bit better:

```python
import httplib
import json
import sys

def kelvin_to_celsius(kelvin):
    return kelvin - 273.15

def print_formatted_data(data):
    weather = json.loads(data)
    desc, temp = weather['weather'][0]['description'], weather['main']['temp']
    print "The weather is '%s'. The temperature is %d C." % (desc, kelvin_to_celsius(temp))

def get_city():
    if len(sys.argv) == 1:
        return 'Turin'
    return sys.argv[1]

def get_weather():
    conn = httplib.HTTPConnection('api.openweathermap.org')
    conn.request('GET', '/data/2.5/weather?q=' + get_city())
    response = conn.getresponse()
    data = response.read()
    print_formatted_data(data)
    response.close()

if __name__ == '__main__':
    get_weather()
```

and commit:

```
$ git add weather.py
$ git commit -m "Pretty printing of the weather"
```

A couple more changes to make the history more interesting: let's clean up a bit the default city:

```python
import httplib
import json
import sys

DEFAULT_CITY = 'Turin'

def kelvin_to_celsius(kelvin):
    return kelvin - 273.15

def print_formatted_data(data):
    weather = json.loads(data)
    desc, temp = weather['weather'][0]['description'], weather['main']['temp']
    print "The weather is '%s'. The temperature is %d C." % (desc, kelvin_to_celsius(temp))

def get_city():
    if len(sys.argv) == 1:
        return DEFAULT_CITY
    return sys.argv[1]

def get_weather():
    conn = httplib.HTTPConnection('api.openweathermap.org')
    conn.request('GET', '/data/2.5/weather?q=' + get_city())
    response = conn.getresponse()
    data = response.read()
    print_formatted_data(data)
    response.close()

if __name__ == '__main__':
    get_weather()
```

and commit:

```
$ git add weather.py
$ git commit -m "Improved the default city"
```

Finally let's add the city name in the output:

```python
import httplib
import json
import sys

DEFAULT_CITY = 'Turin'

def kelvin_to_celsius(kelvin):
    return kelvin - 273.15

def print_formatted_data(data):
    weather = json.loads(data)
    desc, temp, city = weather['weather'][0]['description'], weather['main']['temp'], weather['name']
    print "The weather in %s is '%s'. The temperature is %d C." % (city, desc, kelvin_to_celsius(temp))

def get_city():
    if len(sys.argv) == 1:
        return DEFAULT_CITY
    return sys.argv[1]

def get_weather():
    conn = httplib.HTTPConnection('api.openweathermap.org')
    conn.request('GET', '/data/2.5/weather?q=' + get_city())
    response = conn.getresponse()
    data = response.read()
    print_formatted_data(data)
    response.close()

if __name__ == '__main__':
    get_weather()
```

and commit:

```
$ git add weather.py
$ git commit -m "Added the city name in the output"
```

### Let's _rewrite_ history

Let's check what we have now:

```
$ git log
commit e8367a2c71efec55f3cc43901971deb0e2fd083e
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:21:22 2015 +0100

    Added the city name in the output

commit 1fef435f6d0b3726c936c59238d54bff0e46e0fb
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:20:39 2015 +0100

    Improved the default city

commit 3e590b822539a3fd1ebac2868a5a4fb85fda7195
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:18:36 2015 +0100

    Pretty printing of the weather

commit 33e0871aa0e5487258ed405afd64277e6aa11ecd
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:13:21 2015 +0100

    Added support for command-line city

commit 53c57e1db348a85de9cc3ec2fa56d99b963aa1f6
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:11:36 2015 +0100

    Parsing the weather as json

commit e96569c0b35ee96e3ea7173dbbe3a96585558010
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:08:59 2015 +0100

    Fetching the weather
```

Let's now suppose we want to rewrite the history: for instance the commit related to the default city could be collapsed with the one that adds the support for the city as a command-line argument, and the same can be true for the pretty printing. Also, we might want to reorder some commits, so that the pretty printing comes before the command-line argument.

Let's start:

```
$ git rebase -i --root
```

We need the `--root` argument becase we are not in a branch, and git needs to know where to start the rebase. This will open an editor with the following:

```
pick e96569c Fetching the weather
pick 53c57e1 Parsing the weather as json
pick 33e0871 Added support for command-line city
pick 3e590b8 Pretty printing of the weather
pick 1fef435 Improved the default city
pick e8367a2 Added the city name in the output

# Rebase e8367a2 onto d34f28c
#
# Commands:
#  p, pick = use commit
#  r, reword = use commit, but edit the commit message
#  e, edit = use commit, but stop for amending
#  s, squash = use commit, but meld into previous commit
#  f, fixup = like "squash", but discard this commit's log message
#  x, exec = run command (the rest of the line) using shell
#
# These lines can be re-ordered; they are executed from top to bottom.
#
# If you remove a line here THAT COMMIT WILL BE LOST.
#
# However, if you remove everything, the rebase will be aborted.
#
# Note that empty commits are commented out
```

As the (rather clear) instructions show, we can use our editor to rearrange commits, drop them, or "squash" them (collapse). So let's rewrite our history like this:

```
pick e96569c Fetching the weather
pick 53c57e1 Parsing the weather as json
pick 3e590b8 Pretty printing of the weather
squash e8367a2 Added the city name in the output
pick 33e0871 Added support for command-line city
squash 1fef435 Improved the default city
```

Git will start rewriting the history. After a very short time, the procedure will stop and an editor will open with this:

```
# This is a combination of 2 commits.
# The first commit's message is:

Pretty printing of the weather

# This is the 2nd commit message:

Added the city name in the output

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# Date:      Mon Jan 26 20:18:36 2015 +0100
#
# rebase in progress; onto d34f28c
# You are currently editing a commit while rebasing branch 'master' on 'd34f28c'.
#
# Changes to be committed:
#	modified:   weather.py
```

Git is asking us to merge the commit messages, since we asked it to squash the merges. Let's simply accept what Git is proposing and quit the editor; the same thing will happen for the other squash. If you want to avoid this, you can use `fixup`, as the git help message showed.

After the procedure terminates, we can see that the log has changed:

```
$ git log --patch
commit 49f066ca816af4bca8812a82d60d0eeba8361e2f
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:13:21 2015 +0100

    Added support for command-line city

    Improved the default city

diff --git a/weather.py b/weather.py
index 0cf0ab1..7c0efdd 100644
--- a/weather.py
+++ b/weather.py
@@ -1,5 +1,8 @@
 import httplib
 import json
+import sys
+
+DEFAULT_CITY = 'Turin'

 def kelvin_to_celsius(kelvin):
     return kelvin - 273.15
@@ -9,9 +12,14 @@ def print_formatted_data(data):
     desc, temp, city = weather['weather'][0]['description'], weather['main']['temp'], weather['name']
     print "The weather in %s is '%s'. The temperature is %d C." % (city, desc, kelvin_to_celsius(temp))

+def get_city():
+    if len(sys.argv) == 1:
+        return DEFAULT_CITY
+    return sys.argv[1]
+
 def get_weather():
     conn = httplib.HTTPConnection('api.openweathermap.org')
-    conn.request('GET', '/data/2.5/weather?q=Turin,it')
+    conn.request('GET', '/data/2.5/weather?q=' + get_city())
     response = conn.getresponse()
     data = response.read()
     print_formatted_data(data)

commit 9533ae35e1b1d8c5f94f311ee61f743fd766f3f3
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:18:36 2015 +0100

    Pretty printing of the weather

    Added the city name in the output

diff --git a/weather.py b/weather.py
index c974b91..0cf0ab1 100644
--- a/weather.py
+++ b/weather.py
@@ -1,9 +1,13 @@
 import httplib
 import json

+def kelvin_to_celsius(kelvin):
+    return kelvin - 273.15
+
 def print_formatted_data(data):
     weather = json.loads(data)
-    print weather
+    desc, temp, city = weather['weather'][0]['description'], weather['main']['temp'], weather['name']
+    print "The weather in %s is '%s'. The temperature is %d C." % (city, desc, kelvin_to_celsius(temp))

 def get_weather():
     conn = httplib.HTTPConnection('api.openweathermap.org')

commit a549259a00a58b4d6087ac5e803d33d30bcda5a2
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:11:36 2015 +0100

    Parsing the weather as json

diff --git a/weather.py b/weather.py
index 8ef6db5..c974b91 100644
--- a/weather.py
+++ b/weather.py
@@ -1,10 +1,16 @@
 import httplib
+import json
+
+def print_formatted_data(data):
+    weather = json.loads(data)
+    print weather

 def get_weather():
     conn = httplib.HTTPConnection('api.openweathermap.org')
     conn.request('GET', '/data/2.5/weather?q=Turin,it')
     response = conn.getresponse()
-    print response.read()
+    data = response.read()
+    print_formatted_data(data)
     response.close()

 if __name__ == '__main__':

commit 3406cb6136c96f1228ee417cc19b845b2c71dd44
Author: Andrea Bergia <andreabergia@gmail.com>
Date:   Mon Jan 26 20:08:59 2015 +0100

    Fetching the weather

diff --git a/weather.py b/weather.py
new file mode 100644
index 0000000..8ef6db5
--- /dev/null
+++ b/weather.py
@@ -0,0 +1,11 @@
+import httplib
+
+def get_weather():
+    conn = httplib.HTTPConnection('api.openweathermap.org')
+    conn.request('GET', '/data/2.5/weather?q=Turin,it')
+    response = conn.getresponse()
+    print response.read()
+    response.close()
+
+if __name__ == '__main__':
+    get_weather()

```

The history is now much clearer and reflects our intent better.

### Conclusions

Interactive rebase is a very powerful tool, but the idea of rewriting the history might put off someone. Personally, I think it's a great way to make the code cleaner/ I tend to use when I've finished working on a feature branch, to reorder the commits before merging.

A few links for further details:

- [http://git-scm.com/book/en/v2/Git-Tools-Rewriting-History](http://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)
- [http://git-scm.com/book/en/v2/Git-Branching-Rebasing](http://git-scm.com/book/en/v2/Git-Branching-Rebasing)
- [http://git-scm.com/docs/git-rebase](http://git-scm.com/docs/git-rebase)
- [https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase-i](https://www.atlassian.com/git/tutorials/rewriting-history/git-rebase-i)

**PS:** Please _do not_ use this code as a basis to write an [OpenWeatherMap](http://openweathermap.org/api) client: they offer a great free service, but they ask that you keep the fecth to a minimum and cache the results, something we haven't done to keep our example simpler.
