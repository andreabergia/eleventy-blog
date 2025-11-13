---
date: 2016-03-28T09:32:14Z
tags:
- java
title: Spring @Autowired and missing beans
aliases: [/spring-autowired-and-missing-beans]
---

Very often, when using [Spring](https://spring.io/)'s dependency injection, you will simply use the [`@Autowired`](http://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/beans/factory/annotation/Autowired.html) annotation on your fields, constructor or setter methods, since you _know_ there will be one and only one instance of the required bean at runtime.

However, seldom you might end up wanting to have a specific bean of a certain instance if someone has configured it in the application context, but having the possibility to use a default value otherwise. If you're using [constructor dependency injection](http://docs.spring.io/autorepo/docs/spring/current/spring-framework-reference/html/beans.html#beans-constructor-injection), you can use this trick to do it:

```java
interface MyBean {
}

class MyDefaultBean implements MyBean {
}

@Component
class MyTarget {
    private final MyBean myBean;

    /**
     * The constructor called by Spring when an object of type {@link MyBean}
     * has been explicitly configured.
     */
    @Autowired(required = false)
    public MyTarget(MyBean myBean) {
        this.myBean = myBean;
    }

    /**
     * The constructor called by Spring when no explicit {@link MyBean}
     * is configured in the application context.
     */
    private MyTarget() {
        this(new MyDefaultBean());
    }
}
```

Here we have two constructors: one which takes a `MyBean` instance and is marked with `@Autowired`. Notice that we have marked the `@Autowired` annotation as not required, using `required = false`; otherwise start-up of the application context would fail. We can also create another default constructor, not annotated and private.

The combination of these two works as we wanted: if a specific instance of `MyBean` exists in the application context, the first constructor will be called and thus that instance will be used; otherwise, the second constructor will be called and we will use an instance of `MyDefaultBean`.
