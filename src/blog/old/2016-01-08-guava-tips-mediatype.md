---
date: 2016-01-08T18:13:22Z
tags:
- java
- guava
title: 'Guava tips: MediaType'
aliases: [/guava-tips-mediatype]
---

The [MediaType](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html) class in [Guava](https://github.com/google/guava) is a useful abstraction of [MIME types](http://en.wikipedia.org/wiki/Internet_media_type), also known as "media type" or "content type". It has a lot of predefined constants for the most common types, and it allows you to create new instances specifying either a precise type or a wildcard, using "*".

Furthermore, it has the concept of "charset", which makes it very useful when using it in web applications.

Finally, it has an overridden [toString](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#toString()) method which is compliant with the [RFC 2045](https://www.ietf.org/rfc/rfc2045.txt).

For instance:

```java
assertEquals(MediaType.JPEG, MediaType.create("image", "jpeg"));
assertEquals("image/jpeg", MediaType.JPEG.toString());
assertEquals("text/plain; charset=utf-8", MediaType.PLAIN_TEXT_UTF_8.toString());
```

The various predefined media types include:

- [APPLICATION\_BINARY](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#APPLICATION_BINARY)
- [APPLICATION\_XML\_UTF\_8](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#APPLICATION_XML_UTF_8)
- [JSON\_UTF\_8](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#JSON_UTF_8)
- [PROTOBUF](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#PROTOBUF)
- [CSV\_UTF\_8](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#CSV_UTF_8)
- [CSS\_UTF\_8](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#CSS_UTF_8)
- [JAVASCRIPT\_UTF\_8](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#JAVASCRIPT_UTF_8)
- [PLAIN\_TEXT\_UTF\_8](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#PLAIN_TEXT_UTF_8)
- [HTML\_UTF\_8](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#HTML_UTF_8)
- [GIF](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#GIF)
- [JPEG](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#JPEG)
- [PNG](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#PNG)
- [SVG\_UTF\_8](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#SVG_UTF_8)
- [MICROSOFT\_EXCEL](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#MICROSOFT_EXCEL)
- [MICROSOFT\_POWERPOINT](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#MICROSOFT_POWERPOINT)
- [MICROSOFT\_WORD](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#MICROSOFT_WORD)
- [PDF](http://docs.guava-libraries.googlecode.com/git/javadoc/com/google/common/net/MediaType.html#PDF)
