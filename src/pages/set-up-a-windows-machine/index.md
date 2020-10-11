---
title: How to setup a Windows PC to be secure and useful
date: '2019-01-30'
spoiler: My guide to the intial config of a Windows machine.
---

I've been setting up quite a few Windows PCs lately. I wrote this down for my reference in a Google Doc but I figured
others could get use out of it, so here it is, published.

This guide goes through a lot of stuff from DNS config to aesthetic to important security stuff. This is stuff that I
find useful. Freel free to use this wholesale or not at all. Reach out to me if you have questions with the contact info
at [benc.io](https://benc.io).

# Clean install?

A lot of people will tell you that you absolutely need a clean install of Windows. I think the reality is a bit more
nuanced. I wouldn't do a clean reinstall if you have Windows 10 Pro (be careful: a nontrivial number of manufacturers
will give you a Pro license but only have Home installed on your machine, forcing you to upgrade yourself. I suspect
it's because they don't actually have to pay Microsoft for the more expensive license unless you actually upgrade) or if
you're have a highend laptop (particularly the Surface line). That said, default to a clean install. Pro tip: mute your
PC before clean installing unless you want nightmares of Cortana coming to life.

On the other hand, if you don't clean install, you'll have to manually get rid of Candy Crush and some of the other crap
that Microsoft dumps on you. Even on Pro. In 2019. Yay.

# BIOS Stuff

This stuff sucks but it's important. Just get it over with. From [decentsecurity.com](https://decentsecurity.com):

> From the boot of your computer, press the setup hotkey. It may be F1, F2, F8, F10, Del, or something else to get into
> SETUP mode.
>
> In the BIOS:
>
> - Set a setup password. Make it simple, this is only to prevent malicious modification by someone in front of the
>   computer or by a program trying to corrupt it.
> - Change boot to/prioritize UEFI. Disable everything except UEFI DVD, UEFI HDD, and USB UEFI if you plan on using a
>   USB stick to install Windows. Enable the TPM (if available) and SecureBoot (if available) options. This is super
>   important.
> - Disable 1394 (FireWire) and ExpressCard/PCMCIA (if you're on a laptop) as a layer to further mitigate DMA attacks.
>   This isn't as important anymore, but if you don't use them you might as well turn it off.
> - If you want, and if the computer offers it, you can enable a System and HDD password. We will be using BitLocker to
>   protect the disk, but this is an extra layer you can add if you want. I don't.
> - If you don't use webcam or microphone, you may be able to turn them off in the BIOS
> - Save settings and shut down.

One thing I'd add is that you shouldn't fuck with anything you don't understand. Fucking with things that you don't
understand is how computers go haywire.

# Some more boring stuff

- Keep updating Windows 10 until it tells you that you don't have more updates to install.
- Make sure autoupdate is on. Not updating your computer is how you get fucked. It's important.
- Set UAC to full (instructions
  [here](https://www.tenforums.com/tutorials/3577-change-user-account-control-uac-settings-windows-10-a.html). UAC is
  that window that opens when you do stuff asking "are you sure you want to...?" or "do you want to trust...?". Yes,
  it's annoying but it's an incredibly powerful tool to prevent bad software from doing bad things. The partial level
  doesn't do anything - it's only there as a compromise because
  [people complained about Windows Vista](https://blogs.msdn.microsoft.com/oldnewthing/20160816-00/?p=94105).
- Enable device encryption. Most modern phones/tablets will offer this feature and it makes it much harder for an
  attacker with physical access to your device to steal your information. I'll just direct you to Decent Security's
  instructions for this - it's step 7 [here](https://decentsecurity.com/#/securing-your-computer/)
- You don't need an anti-virus. Windows has one (Windows Defender). Don't be stupid and disable it and you'll be fine
  - If you're actually super concerned, MalwareBytes is arguable worth it. Unless you pay, it requires you to manually
    initiate scans which is a lot of hassle. Not being stupid online will be a lot more effective. Personally, I more
    use this as an investigative tool when I think something is wrong.

## Changing your DNS

I make this an extra section because it's arcane but important. DNS is often called the phone directory of the internet.
When you type "google.com" into your browser, your computer contacts its designated DNS server. The DNS server tells
your computer where Google's server is on the internet's network and your computer then goes there. You can see how DNS
is important here - it literally has the ability to create a record of every site you've visited.

The shitty part is that many DNS services, especially in the US, do. Remember the hoopla about internet privacy in 2017?
Part of that was about the ability of ISP to monetize DNS records by selling your history (that's not the full story but
it's a large part of it). Your home WiFi will default to your ISP's DNS server. These aren't just insecure but they're
also slower than they have to be and probably less resilient to failures. Worse, unless you happen to be on the cutting
edge, DNS requests are typically sent unencrypted.

I typically change my DNS services (instructions to do so
[here](https://www.windowscentral.com/how-change-your-pcs-dns-settings-windows-10)) to the following:

- IPv4
  - Preferred: 1.0.0.1
  - Alternate: 8.8.8.8
- IPv6
  - 2606:4700:4700::1111
  - 2001:4860:4860::8888

Preferred: 1.0.0.1 Alternate: 8.8.8.8

Those are, respectively, [Cloudflare's](https://1.0.0.1/)[^1] and
[Google](https://developers.google.com/speed/public-dns/docs/using)'s DNS services[^2]. They're both super resilient to
failures, fast, and both pledge to be secure. Cisco's OpenDNS (208.67.222.222) is also a strong option compared to
Google (although I think Cloudflare is objectively a better choice) - I've just had a few bad experiences with them so
I'm cynical.

# Personalization

Go wild. Change your desktop image, sidebar, to your heart's content. The big things that I do are:

- I move the taskbar to the right and hide it. It being on the right means it takes up less screen real estate when it's
  open (about 56% as much on computers with normal displays) and it being hidden means it usually takes up 0. I also
  change the icon size on it to small just so I can fit more of them.
- Turn on Night Light. Night Light makes your computer screen go more orange-y at night. It's better for your eyes and
  possibly your circadian rhythms. Don't do color sensitive work with this on!
- [iOS] I'm pretty sure there's an Android equivalent but the ContinueOnPC app for iPhone is great. Let's you
  automatically share things that open up on your phone. Has an irritating setup process but works smoothly most of the
  time. Unfortunately, Microsoft has set it up so that no matter what your default browser is, the links open in Edge.
  Freedom!

# Install all the things

- Best software to automate this is [ninite.com](https://ninite.com/). You can check all the software you want and it'll
  download and install all of it in one awesome isntaller. I always download more than I need from here so if disk space
  is a concern, be careful. Don't get any of the security software except maybe Malwarebytes and don't get the Skype
  client - Win10 has one built in.
  - See below for thoughts on browsers.
- Download your software. This could be anything from video games to productivity software
  - Microsoft Office probably falls into this category. I always forget to install this until right before I need it.
  - I'm a big fan of [ShareX](https://getsharex.com/). It gives better screenshot functionality to Windows (although
    Microsoft might fix this soon?). I currently have mine setup to upload screenshots to
    [shared.benc.io](https://shared.benc.io) when I capture them. However, it defaults to imgur uploads which work just
    as well.

## Browsers

My first version of this guide recommended Chrome. However, Chrome (and Google writ large) have been doing a lot of
sketchy stuff lately from potentially making adblockers
[less effective](https://arstechnica.com/gadgets/2019/01/google-planning-changes-to-chrome-that-could-break-ad-blockers/)
to creating a monopolistic browser market where they control the entire web. Moreover, I've become more and more
uncomfortable with Google getting unfettered access to my entire web history.

This wouldn't matter if there was not alternative but there is: Firefox! Firefox has tremendously improved since it's
nadir. It's now faster with rendering webpages and usually faster with running Javascript. The big downside is
incompetent web developers might not design their projects for Firefox. That's why I keep Chromium as a backup (Chromium
is the open source version of Chrome - it's open source and generally more trustworthy IMO).

Anyways, in terms of setup:

- Login to your Firefox Sync account. Not having to replicate the effort of configuring theme and downloading extensions
  is amazing. On Chrome, this would be your Google account
- Install the following add-ons
  - [Highly recommended] Install uBlock Origin. This is the best adblocker. It's not a business, it's a free product and
    it doesn't fuck around with blocking ads.
  - [Highly recommended] Install HTTPS everywhere. This will ensure your connection with all sites that support it is
    secure even if the site doesn't force it to be. 100% necessary on a laptop, a very good idea on desktop.
  - [Recommended] Install Math. The biggest downside of Firefox to me has been the toolbar isn't an automatic
    calculator. This partially solves that problem.

[^1]:

  Cloudflare calls their DNS service 1.1.1.1 because, let's be honest, that's a lot cooler than 1.0.0.1. Unfortunately,
  a bunch of bad telecom equipment will unintentionally override 1.1.1.1 and there's limited evidence that AT&T is
  purposefully doing so (bolstered by AT&T's general shittiness). Fortunately, 1.0.0.1 works just as well and doesn't
  have the same issues.

[^2]: You've probably already used Google's DNS service if you've ever used Starbucks Wifi.
