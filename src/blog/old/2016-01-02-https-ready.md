---
date: 2016-01-02T20:22:36Z
title: HTTPS ready!
aliases: [/https-ready]
---

Thanks to the great service offered by [Let's Encrypt](https://letsencrypt.org/), this blog now runs on HTTPS! [Let's Encrypt](https://letsencrypt.org/about/) is a wonderful service which offers _trusted_ certificates for free to anyone running a website.

### Where does this website runs?

The domain was registered using [NameCheap](https://www.namecheap.com/?aff=93670)*, which I highly recommend: it's cheap, very simple to use and very trustworthy. The whole process for registration was extremely simple and fast.

The website itself runs on on [DigitalOcean](https://www.digitalocean.com/?refcode=1673f27d3f11)* cloud, which offers a service similar to AWS: it allows you creates a virtual machine running on their cloud, with a fixed public IP address. Furthermore, it allows you to easily create a new virtual machine starting from a rich set of predefined apps, including [Ghost](https://ghost.org/), the blog engine that powers this website. I chose it because it's extremely simple to use, and quite cheap.

### How do you configure HTTPS with Let's Encrypt?

Enabling HTTPS requires at first to get a [certificate](https://en.wikipedia.org/wiki/HTTPS), which must be emitted by a trusted authority to ensure that your websites gets the "lock" icon in the browser. [Recently](https://letsencrypt.org/2015/10/19/lets-encrypt-is-trusted.html) Let's Encrypt has received the required cross signatures to be marked as trusted by all browsers without any effort from the end user.

The DigitalOcean guys have set up [a great guide](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-14-04?refcode=1673f27d3f11)* to help you modify the Nginx configuration with a Let's Encrypt certificate, which is exactly what I needed to do for this website. All in all, all of this took me only a few minutes.

### Why HTTPS?

The real question should be "why not?"!

There's no real reason for _not_ running on HTTPS: certificates are now - finally! - available for free thanks to Let's Encrypt, which is not the only similar initiative, but it has gained a lot of traction recently, especially since it got a lot of [high profile sponsors](https://letsencrypt.org/sponsors/) such as Mozilla, Facebook, Chrome. A common objection is that HTTPS requires more CPU than pure HTTP, but there's actually [an entire website](https://istlsfastyet.com/) to dispels the myth that this matters _at all_.

Google has been calling for HTTPS everywhere [for a while now](https://www.youtube.com/watch?v=cBhZ6S0PFCY) and even [ranks lower](https://googleonlinesecurity.blogspot.it/2014/08/https-as-ranking-signal_6.html) websites that don't provide HTTPS connections. [A lot of people](https://https.cio.gov/everything/) believe that HTTP should be deprecated, and that everything should run in HTTPS - [Chrome](https://www.chromium.org/Home/chromium-security/marking-http-as-non-secure) and [Firefox](https://blog.mozilla.org/security/2015/04/30/deprecating-non-secure-http/) are even considering showing an icon marking HTTP-only connections as insecure!

There's really no excuse anymore - [grab your certificate](https://letsencrypt.readthedocs.org/en/latest/) and install it, if your website still doesn't run on HTTPS!

### Affiliate links

Note that the links to NameCheap and DigitalOcean, marked with a "*", are referral links, meaning that I will get some credit on the target websites if you end up buying something from them. If for any reason this annoys you, simply don't use those links.
