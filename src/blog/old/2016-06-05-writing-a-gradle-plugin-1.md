---
date: 2016-06-05T10:03:31Z
tags:
- java
- gradle
title: Writing a Gradle Plugin / 1
aliases: [/writing-a-gradle-plugin-1]
---

In this short series, we are going to dig a bit in how one writes a gradle plugin. Our plugins won't do anything useful except some `println`; however I hope to manage to explain some concept and to save you some time in case you have to write one. The source code for this tutorial is available on github at [https://github.com/andreabergia/sample-gradle-plugin](https://github.com/andreabergia/sample-gradle-plugin).

### Our first plugin

The repository is split in two projects: `gradleplugin` and `usage`. Quite obviously, `gradleplugin` defines our plugin, while `usage` is a trivial gradle project that uses our plugin.

As explained in the [Gradle manual](https://docs.gradle.org/current/userguide/custom_plugins.html), writing a plugin can be done in various variants of the two following ways:

- including the code of the plugin in your project;
- packaging the plugin into a jar (or multiple) and publishing it.

In this tutorial we're going to take the second approach, since it's the one that leads to the best code reuse. The relevant commit is at [https://github.com/andreabergia/sample-gradle-plugin/tree/6590aeb7576f937a82ad5c738ce383ea0df92168](https://github.com/andreabergia/sample-gradle-plugin/tree/6590aeb7576f937a82ad5c738ce383ea0df92168).

Let's start by taking a look at our [plugin class](https://github.com/andreabergia/sample-gradle-plugin/blob/6590aeb7576f937a82ad5c738ce383ea0df92168/gradleplugin/src/main/groovy/com/andreabergia/sample/gradleplugin/SamplePlugin.groovy):

```java
package com.andreabergia.sample.gradleplugin

import org.gradle.api.Plugin
import org.gradle.api.Project

class SamplePlugin implements Plugin<Project> {
    void apply(Project project) {
        // Define a new task
        project.task('sample-task') << {
            println "Hello from our sample plugin!"
        }
    }
}
```

Inside the `apply` method of a `Plugin` class, you can do anything you'd write directly in a `build.gradle` file. In this case, we are defining a new task, whose job is simply to write a line to the console, using `println`.

Now let's take a look at the rest of the project. In the `src/main/resources` directory, we have created a file [`META-INF/gradle-plugins/gradle-sample.properties`](https://github.com/andreabergia/sample-gradle-plugin/blob/6590aeb7576f937a82ad5c738ce383ea0df92168/gradleplugin/src/main/resources/META-INF/gradle-plugins/gradle-sample.properties) with this content:

```
implementation-class=com.andreabergia.sample.gradleplugin.SamplePlugin
```

When we will take a look at how this plugin can be used by another project, we will be able to simply write:

```
apply plugin: 'gradle-sample'
```

and this will automatically execute our plugin class. As you probably have noticed, the name of the properties file is the string that the users of our plugin can use when calling `apply plugin`.

The [`build.gradle`](https://github.com/andreabergia/sample-gradle-plugin/blob/6590aeb7576f937a82ad5c738ce383ea0df92168/gradleplugin/build.gradle) file is pretty standard:

```
repositories {
    mavenLocal()
}

apply plugin: 'groovy'
apply plugin: 'java-gradle-plugin'

compileGroovy.options.encoding = 'UTF-8'

group = 'com.andreabergia.sample.gradleplugin'
version = '1.0.0-SNAPSHOT'

dependencies {
    compile localGroovy()
    compile gradleApi()
}

apply plugin: 'maven-publish'
publishing {
    publications {
        mavenJava(MavenPublication) {
            from components.java
        }
    }
}

task wrapper(type: Wrapper) {
    gradleVersion = '2.13'
}
```

We use the `groovy` plugin, rather than the `java` one, since writing gradle plugins in Groovy is quite common and generally a bit simpler than writing them in Java. Notice that you are _not_ required to do so; writing plugins in Java is absolutely possible and it is done in some of the standard plugins.

Since a running Gradle instance already includes a Groovy environment, we add `localGroovy()` to our project's dependencies. We also add `gradleApi()` to be able to use the Gradle's classes, such as `Project` and `Plugin`. Finally there's a simple, standard usage of the `maven-publish` plugin and the usual `wrapper` task.

### Using the plugin

Let's now take a look at how we can use this plugin. The file [`usage/build.gradle`](https://github.com/andreabergia/sample-gradle-plugin/blob/6590aeb7576f937a82ad5c738ce383ea0df92168/usage/build.gradle) shows you how that is done:

```
repositories {
    mavenLocal()
}

buildscript {
    repositories {
        mavenLocal()
    }
    dependencies {
        classpath 'com.andreabergia.sample.gradleplugin:gradleplugin:1.0.0-SNAPSHOT'
    }
}


group = 'com.andreabergia.sample.gradleplugin'
version = '1.0.0-SNAPSHOT'

apply plugin: 'gradle-sample'


task wrapper(type: Wrapper) {
    gradleVersion = '2.13'
}
```

In the `buildscript` section, we add our plugin to the `classpath`. This ensure that the call to `apply plugin` can find the plugin. As we have discussed before, gradle will use the properties file included in the plugin implementation to find the correct class to instantiate and execute.

If we now go to the `usage` directory and try to invoke our task, everything works:

```
$ ./gradlew sample-task
:sample-task
Hello from our sample plugin!

BUILD SUCCESSFUL
```

### Conclusions

For the moment we haven't done much more than what is explained on the Gradle manual, other than discussing in some details the packaging of the plugin. In the
[next part]({% ref "2016-06-26-writing-a-gradle-plugin-2.markdown" %}) we will create a proper class to execute our tasks, and we will see how we can configure it.
