---
date: 2025-01-08T22:00:00+01:00
tags:
  - debugging
series: ["Crazy debugging stories"]
title: Crazy debugging stories - Quota
---


Welcome to a new post in my miniseries about some crazy bugs I've had to investigate and debug throughout my career.

# Quota

This story is from about three years ago, at a [previous job](https://www.list-group.com/). I was involved in doing a [lift-and-shift migration](https://www.ibm.com/think/topics/lift-and-shift) from on-prem to Google Cloud of a bespoke system we had built for a [large insurance company](https://www.generali.it/).

The application was a very complicated and interesting distributed system, designed by some former colleagues, that I maintained at the time. It was used to implement part of a custom model for [Solvency II compliance](https://en.wikipedia.org/wiki/Solvency_II), i.e. the EU rules that govern how much money insurances need to keep aside as a liquidity buffer, created after the 2008 financial crisis by the European regulators.

The system was basically a _big_ Montecarlo simulator - it would estimate the value of financial portfolios against a large number of scenarios (hundreds of thousands), do a lot of statistics and _very_ complex aggregation rules, and produce a ton of reports. It processed a pretty big amount of data - a typical run would use some 200 CPUs and 1.5 TB of RAM for roughly twenty minutes to generate dozens of gigabytes of reports if I remember correctly. Most of the CPU and memory would be spent on the aggregation phase, though, which contained a lot of business logic.

One of the key steps was to evaluate the performances of the various portfolios in the stochastic scenarios, i.e. generate the Montecarlo data. This was implemented in a Java microservices that would execute the following steps:

- it would write various input files representing the input risk factors. Each file would basically be a large array of double, containing the values of a risk factor for each scenario, so they would be of the order of a few MBs (8 bytes times the number of scenarios);
- it would fork to another process that would evaluate the values of a given portfolio on each scenario and then write the results to another file;
- the microservice would then read the file generated, clean everything up, and return the results.

This approach is a bit unusual and there were good reasons why it was chosen at the time, but that's not the point of the post, so I won't go into more details than this. The relevant part is that this whole write/fork/read cycle would happen some 20,000 times in a typical run, on a dedicated virtual machine.

After some weeks of playing with [Terraform](https://www.terraform.io/) and [Azure Pipelines](https://azure.microsoft.com/en-us/products/devops/pipelines), we had a clean installation up and running in the cloud environment. We started with a simple test run, which was designed to exercise all code paths in the business logic but also execute in a short time frame (roughly one minute), and it worked fine: all the reports matched, and the run completed about 20% faster than on the on-premise machines. So, we were quite happy.

The next tests surprised us, though. The performances dropped completely - rather than taking around twenty minutes, it would take about a couple of hours. We were puzzled and we started investigating.

Our application logs weren't particularly helpful, so we ended up building some dashboards using the Google Cloud monitoring tools. What we saw was surprising - after about a minute of execution, we had a significant drop in performance: network traffic between nodes, CPU usage, and I/O. So, what was the reason? Hint: check the post title. ☺️

What we discovered was that the part responsible for the slowdown was actually disk I/O of the portfolio performance evaluation microservice. That process was running on a dedicated VM, and apparently, we had configured it with HDDs rather than SSDs. However, what became apparent to us was that we were hitting SSD level of performance _for the first minute_ or so, and then some quota system came into effect and slowed down the I/O. In the cloud, disks are not really physical disks attached to the VMs, but generally some sort of network drives - apparently Google Cloud's, at the time, allowed for some burst before enforcing the contractual [IOPS](https://en.wikipedia.org/wiki/IOPS) limit.

The fix was simple: regenerate the VM with an SSD disk. After doing that, performances stayed consistent and fast - and we had again a happy customer. But, to me, it was interesting how an abstraction and implementation detail of the cloud provider ended up leaking to the application level in such a visible way.
