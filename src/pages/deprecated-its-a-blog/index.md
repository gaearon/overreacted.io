---
title: "[Deprecated] It's a blog"
date: '2018-01-22'
spoiler: An explanation of my old blog
---

_Note: this is an explanation of my old blog site, not this one. I only include it for archival purposes._

Ever since buying benc.io in summer [2016](https://www.whois.com/whois/benc.io), I've intended to create a blog here.
This is mostly inspired by the fantastic writing I've seen across the web and also a general desire on my part to
communicate my ideas in a medium with more than 280 characters. This post will go over some of the design and technical
choices that I made when creating my blog. A future post will do the same thing but with my main personal site - found
at the [root domain](https://www.benc.io).

## Technical details

Personally, I love reading about the choices and tradeoffs that go into great products. Most every tech company has a
blog on this and, without exception, I've enjoyed every one. I thought I'd do the same for this blog even though the
choices won't be nearly as exciting.

The core blogging platform behind this site is Ghost. It was recommended by
[Troy Hunt](https://www.troyhunt.com/its-a-new-blog/) (the security researcher, for anyone who doesn't want to click
that) and, so far, I've had zero complaints. It's open source and designed specifically for blogging by a few
disillusioned ex-WordPress employees. Good advice for life: anyone who doesn't like WordPress is probably smart.

Ghost uses Markdown for creating posts: that works perfectly for me since I've had plenty of experience writing READMEs
for GitHub. Ghost stores all its data in a MySQL database and all images & other files in an AWS S3 bucket hosted in US
East 2 (Ohio).

The S3 bucket wouldn't ordinarily be necessary when using Ghost - files could just be written to local storage. However,
the blog is running on Heroku which doesn't have local storage. This decision was primarily inspired by my deep desire
to avoid NGINX and everything about it. At some point, I'll probably get to using a DigitalOcean Droplet or an AWS
LightSail instance to run my various APIs off of but for now I'm perfectly OK paying Heroku the \$7/month for the dyno
(AWS does charge me for S3 storage + ingress/egress data but it's so tiny that it's hardly worth mentioning).

I'm not wild about the idea of maintaining my own blog. Updating Ghost and worrying about whether any of the
dependencies has security flaws is not a great time. However, the managed service from Ghost costs \$19/month which is
decently pricey and not worth it for me.

The decision to self-host isn't a fun one but Cloudflare, my reverse proxy, makes it an easier one. Cloudflare provides
me an insanely big worldwide CDN. For context: at a time when neither Google nor Microsoft nor Amazon offer a single
server in Africa, Cloudflare already has 5. Ghost isn't meant to be a distributed system - it's meant to run on a single
server. The static nature of the content that it distributes means that slapping a CDN with caching in front of it is
the most effective option (I've also done that for my S3 bucket). Cloudflare also offers me DDoS protection so my dyno
isn't overwhelmed and provides some nice services like minification of HTML and JavaScript. It would offer me CSS
minification but their CSS minifier _still_ can't handle media queries in CSS files which Ghost makes use of. As a
result, I have to minify the CSS file in the source code.

## Design choices

Design is one of my favorite things to do conceptually but executing on it sucks. Getting every pixel right is hard work
but it's also important to get it right. Luckily, in the case of this blog, I had very few choices to make because of
[this](http://attila.zutrinken.com/) prebuilt theme. It's a very minimal theme which I appreciated. If people want to
contact me or learn about me, there are plenty of links on [my main site](https://benc.io). I wanted my blog to have
very few frills.

Under the hood, I made a few changes (like using Font Awesome instead of loading custom icons from Heroku - faster load
time and less bandwidth on my part) and removing a few menus that I didn't find very useful. I also changed the main
color! This did come with the tradeoff that the RSS feed for my blog isn't easily findable. RSS is basically dead
anyways but if you want it, you can find it [here](https://blog.benc.io/rss/).

### That header picture

The picture in the header is from NASA and it's a composite of many images NASA took at each location's night period. It
shows the distribution of lights in the world. This is one of my favorite images. Light is a symbol of technology and
development and we can see its distribution across the world. There's a lot of talk about income inequality and such in
liberal circles these days. This image shows it with glaring clarity and, at least to me, the imperative we have to do
something that makes the world better for many people - even the ones who don't have lights on that map. To me, this
image represents the intersection of my two main interest groups: technology and public policy.

On a techy note, the image is optimized to the best of my ability but mobile devices and the like will probably end up
downloading a larger file than they need to. CloudFlare charges for their image optimization services 🙁.

## What I plan on doing here

Over the past few years, I've become very good at writing memos and other such summaries. I've lost a lot of my
narrative writing skills and I've never been able to focus on my writing voice - it's always been about the voice that
pleases the Professor or the SAT grader. Finally, I want to share the lessons I've learned from my various experiences -
from VandyHacks President to Art of Problem Solving intern to middle class multiracial at a college considered elite.

Thanks for reading my inaugural post - I hope you read the ones that follow.
