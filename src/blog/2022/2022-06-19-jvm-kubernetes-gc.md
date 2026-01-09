---
date: 2022-06-19T09:07:28Z
tags:
  - java
  - kubernetes
title: Java's GC and Kubernetes's OOM killer
aliases: [/2022/06/java-gc-and-kubernetes]
---

Today, we are talking about something that you might not know if you are new to deploying Java applications to Kubernetes.

As you know, Java is a garbage-collected language. The GC in Java has [_a lot_ of parameters](https://sematext.com/blog/java-garbage-collection-tuning/) for tuning, and there are [multiple different algorithms](https://www.baeldung.com/jvm-garbage-collectors) you can choose from, each with a particular trade-off between latency, CPU consumption, and memory overhead.

One important thing to note is that each GC algorithm has some memory overhead. In particular, if you set the maximum heap size of your JVM to - say - 8GB, with the parameter `-Xmx8G` (also known as `-XX:MaxHeapSize`), the actual java process will occupy _more_ than eight gigabytes of ram! This is necessary for the memory structures required by the GC to do its job, for the thread's stacks, and for other JVM internal structures.

When you deploy an application to Kubernetes, you should always [specify your CPU and memory required and the limits](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/), to ensure the [Kubernetes scheduler](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/) has the most information possible for deciding the nodes to use to schedule your workload. If you are deploying a Java application and you have set a maximum JVM memory, you might think that you should set your maximum _pod_ memory to the same value, so you might do something like in your `Dockerfile`:

```dockerfile
FROM eclipse-temurin:11
RUN mkdir /opt/app
COPY japp.jar /opt/app
CMD ["java", "-Xmx8G", "-jar", "/opt/app/japp.jar"]
```

and in your Kubernetes deployment:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: japp
  labels:
    app: japp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: japp
  template:
    metadata:
      labels:
        app: japp
    spec:
      containers:
      - name: japp
        image: japp-image:0.42.0
      resources:
        requests:
          memory: "8Gi"
          cpu: "1"
        limits:
          memory: "8Gi"
```

This will *not* work well. Depending on your workload, the Java process might end up using _more_ than the 8GB you have set as the maximum VM memory, as we have discussed above. If this happens, the [Linux OOM killer](https://www.kernel.org/doc/gorman/html/understand/understand016.html) will terminate your pod and you will see restarts in your logs, but not much more information than that.

It is therefore very important to set a _higher_ limit in Kubernetes than for your JVM. Anecdotally, we have found that with Java 17 and the [default GC algorithm](https://www.dynatrace.com/news/blog/understanding-g1-garbage-collector-java-9/) (garbage-first, often known as G1) a 10%-15% or so additional space worked fine, although I have often seen 25% recommended. Your mileage _will_ vary, depending on your application, so be sure to measure. In the example above, you could start by setting your `request` and `limit` memory in Kubernetes to something like 9.5 - 10 GiB.

Remember that `request` is a guarantee (you will have at least that memory), but `limit` is an _obligation_ - the kernel will not let you go above that.

Conversely, if you _only_ set the memory limits in Kubernetes but do not specify the JVM limits via `-Xmx`, you are wasting resources! In Java 10 a [new feature was implemented](https://bugs.openjdk.org/browse/JDK-8146115) (and backported to 1.8, versions 8u191 and above) to automatically size the maximum memory of the virtual machine when running inside a container, but the [default limit is 25% of the maximum memory](https://blog.softwaremill.com/docker-support-in-new-java-8-finally-fd595df0ca54). As an example: if you set your limit in Kubernetes to 8GiB, your JVM would automatically tune itself to a maximum heap size of 2GiB, which is probably not what you want and would leave you wasting considerable resources. In addition to the preceding links, here is another good [article](https://medium.com/marionete/managing-java-heap-size-in-kubernetes-3807159e2438) on the topic.

I hope this article can save you some headaches, if you are just starting out with Java on Kubernetes!
