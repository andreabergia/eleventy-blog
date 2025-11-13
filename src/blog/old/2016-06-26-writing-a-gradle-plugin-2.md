---
date: 2016-06-26T17:55:28Z
tags:
- java
- gradle
title: Writing a Gradle Plugin / 2
aliases: [/writing-a-gradle-plugin-2]
---

In the [previous part]({% ref "2016-06-05-writing-a-gradle-plugin-1.markdown" %}) of this series we have started writing our own gradle plugin. Let's go on. As last time, the code can be seen at [https://github.com/andreabergia/sample-gradle-plugin/tree/b7aeccc31e6285d2fbe4dab8024d1d1cbbddf698](https://github.com/andreabergia/sample-gradle-plugin/tree/b7aeccc31e6285d2fbe4dab8024d1d1cbbddf698).

### Creating a Task class

A rather common thing to do when writing a Gradle plugin is to create a class that implements the `Task` interface. In turn, this allows users of your plugin to create tasks of your class, which will execute a Groovy (or Java) method when the task is executed. An example:

```java
class SayHiTask extends DefaultTask {
    @TaskAction
    def sayHi() {
        println "Hello from our task"
    }
}

class SamplePlugin implements Plugin<Project> {
    void apply(Project project) {
        project.task('sayHi', type: SayHiTask)
    }
}
```

Now our plugin is instantiating automatically a task, named `sayHi`, of our class. The method that will get invoked when the task is executed is the annotated with `@TaskAction`.

### Configuring the task

Now, let's say we want to configure our task; for example we want the message that is printed to be configurable. We can simply expose a property in our task, and configure it in the project that uses it:

```java
class SayHiTask extends DefaultTask {
    String message = "Hello from our task"

    @TaskAction
    def sayHi() {
        println message
    }
}

// In our build.gradle file, when using the plugin
sayHi.message = "Ho ho ho"
```

### Extension objects

Quite a few common Gradle plugins don't expose a configuration for the tasks, but rather one for the plugin. For instance, let's suppose we want to be able to configure our plugin in this rather gradle-idiomatic way:

```java
// In our build.gradle file, when using the plugin
samplePlugin {
    message "Hello"
}
```

To do this, we need to create what Gradle calls an "extension object" for our plugin, named `samplePlugin`. The type of this object can be any class; in our case it will be a simple class that will have an instance variable for the `String` to print and a `message` method, which can be invoked with a `String` argument. Let's see the code:

```java
class SamplePlugin implements Plugin<Project> {
    void apply(Project project) {
        project.extensions.create('samplePlugin', SamplePluginConfig)
        project.task('sayHi', type: SayHiTask)
    }
}

class SamplePluginConfig {
    String message = "Hello from our plugin"

    def message(s) {
        message = s as String
    }
}

class SayHiTask extends DefaultTask {
    @TaskAction
    def sayHi() {
        println project.samplePlugin.message
    }
}
```

Notice the method `SamplePluginConfig.message`. Without it, in our `build.gradle` file, when using the plugin, we would have to write:

```java
samplePlugin {
    message = "Hello"
}
```

With it, we can write

```java
samplePlugin {
    message "Hello"
}
```

There isn't really much of a difference; however, in most gradle plugins I've seen around, the second form is far more common, so I've shown you how to allow it in our plugin.

### Conclusions

In the next part, we will discuss some more useful tricks, such as instantiating many copies of a task according to the configuration given in the extension object.
