---
title: VandyHacks' Process for Handling Board Applications
date: '2018-01-31'
spoiler: How VandyHacks handles 100 interviews with 10 people.
---

Every year, the VandyHacks team has about 30 awesome people from different background work on 5 nominally disjoint teams
to put together a kickass event. Last year, we received about 40 applications and we took about 20 of them. This year,
we've received 57 applications (as of this writing) and we're expecting more.

Since we're between events, these 56 applications are managed by 10 people (the directors and presidents) - two of whom
are abroad this semester. Managing all those applicants is no easy task and we use a variety of tools to get it done.
Here they are.

## Typeform

Everyone loves Typeform because it's super pretty - that's why we picked it. You can see our application
[here](https://interview.vandyhacks.org) That said, Typeform can be a **huge** pain on the survey administrator size.
Its view of results is annoying and its feature to push results to a Google Sheet will only apply to future entries
(which means that if you try to enable it after abut 20 applications, it's basically useless). It's frustrating that the
best way to access your results is probably by building your own Google Sheets integration with their API.

That said, the survey looks pretty and it offers a direct push of emails to MailChimp, the software that we use for
sending out batched email campaigns. All in all, we tolerate its function and love its form (get it?).

## MailChimp

Typeform automatically pushes email to a MailChimp list with all our applicants. I didn't realize this till we had the
bulk of our applicants but it's possible to trigger an email when they get added to the list. That meant, we could have
sent our emails to applicants without ever logging in to MailChimp.

As it was, I logged onto Mailchimp every day and replicated the same campaign to all new members of the list. It was 4
clicks each day which was no big deal.

## Calendly

Calendly is a great service that allows you to post available times and have the users sign up for slots. This is what
we used to manage our interview times. We left 4PM to 9PM available everyday (more or less) and let users sign up for
their interviews there.

Calendly is pretty and provides powerful administrator tools but my biggest pet peeve is its system to reschedule. We
had a situation where we had to push an interview back 15 minutes. I thought it'd be easy to do but Calendly showed that
time slot as having a conflict. It turns out that the conflict was with the person we were trying to reschedule -
Calendly didn't realize that when you're changing the interview time of someone, their original time is no longer
occupied.

## Webhooks and Slack

After applicants signed up for interviews, we needed an easy way for our internal board members to sign up to interview.
I have a bit of experienced developing [Slackbots](https://github.com/bencooper222/hibp-bot) and an uncomplicated
process like this is perfect for Slackbots. Since this is just a one way input - the bot only needs to post not "read",
we were even able to just use plain webhooks instead.

The basic flow of the bot is in this handy infographic:

![The VH application process.](https://blogassets.benc.io/2018/01/vandyhacks_application_infographic-minify.png)

A few notes on this process:

- Calendly charges for usage of its webhooks[^1].
- The Lambda function is written with the Serverless framework (because that's what I'm familiar with). You can find the
  code [here](https://github.com/bencooper222/calendly-slack-push-notifications).
- You can see below what the bot looks like for someone who cancels and then selects a new time. You can see the
  reactions too - those are our board members saying that they're free to do this interview.

![Example Slackbot interaction.](https://blogassets.benc.io/2018/01/example-interview-bot-interaction-min.png)

After that, the reactions are (manually 😢) put into a spreadsheet by me and interviews are allocated.

## What works and what sucks

Unsurprisingly, the best parts of this process are the ones that happen automatically: Typeform -> MailChimp and
Calendly -> Slack. The worst parts are the ones that involve human (read: my) involvement to make it work.

I ran the logistics of a similar interview process for IMSA's StudCo during my senior year of high school. We couldn't
spend money and I was no where near my current level of coding competency. That process was centered around each
applicant having a code name (one of my closer friend's code name was "snugglyLlama4846"). That gave relative anonymity
to each applicant (when we read an application or read an interviewer's notes on an interview, we had no idea who it
was) for internal evaluation purposes but also gave them anonymity when they signed up for interviews on a spreadsheet
(the replacement for Calendly).

That process was more efficient (in terms of work done by humans) but that wasn't a result of the technical choices; it
was a result of that process not being rolling. Constantly sending emails, copying over reactions and scheduling board
members is not a fun thing to do but in a rolling process, it has to be repeated every day.

## The Holy Grail

If we had the time, we could have automated this entire process. The applicant filling out the Typeform could trigger
Mailchimp sending them an email with the Calendly link. Them filling out the Calendly link could trigger the message
being sent into Slack, _and then_, board members reacting could have the Slackbot inputting their volunteering into the
Google Sheet. The Slackbot could even allocate interview times for us in an evenhanded way.

Header image credit to [Janet Fang](https://www.flickr.com/photos/janetcfang/).

[^1]: They [say](https://developer.calendly.com/) that they don't. It's a lie 😕.
