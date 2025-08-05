---
title: "BOXS Project"
date: '2025-08-05'
description: "Pentesting Feedback loop"
slug: "boxs"
isPublish: true
technologies: ["react", "nextjs", "typescript", "llm", "mcp"]
---

# The 95th Percentile of Cybersecurity: Why We Built boxs.sh

*Or: How to stop sucking at penetration testing by actually watching your own gameplay*

## The Uncomfortable Truth About Skill

Here's what most people in cybersecurity don't want to hear: **you don't really need a lot of talent to get to the 95th percentile**. The vast majority of practitioners are making the same fundamental mistakes over and over again, completely unaware of what's holding them back.

Dan Luu's analysis of Overwatch players revealed something profound that applies directly to our field: people desperately want to improve, but they systematically avoid the one thing that would actually make them better—**observing their own performance and getting feedback**.

In cybersecurity, this problem is even worse. Unlike Overwatch, where you can easily record and review your gameplay, penetration testing has traditionally been a black box. You run commands, get results, move on. No systematic recording. No structured review. No community feedback. Just endless repetition of the same inefficient patterns.

## The Methodology Problem

Walk into any cybersecurity training and you'll see the same scene: students frantically copying commands from slides, following step-by-step tutorials, and celebrating when they get a shell. But ask them to explain their methodology, show them a recording of their session, or have them peer-review someone else's approach—and the facade crumbles.

**The brutal reality**: Most penetration testers have no idea what they're actually doing during an engagement. They can't spot their mistakes because they're not tracking what they're doing in the first place.

This isn't a talent problem. It's a **systems problem**.

## Enter boxs.sh: The Overwatch Replay System for Hackers

We built boxs.sh because we realized that cybersecurity needed what gaming has had for years: **comprehensive session recording with community-driven feedback**.

The vision is deceptively simple:

1. **Record everything**: Every command, every decision, every phase transition
2. **Structured methodology tracking**: Automatic detection of HTB's 8-phase penetration testing methodology
3. **Community feedback**: Peer review from practitioners who've walked the same path
4. **Systematic improvement**: Data-driven insights into where time is being wasted

### The Technical Architecture of Improvement

The platform implements what we call "performance archaeology"—the systematic excavation of inefficiencies in cybersecurity workflows:

- **Session Recording Infrastructure**: Complete terminal session capture with timing data
- **Phase Detection Engine**: Automatic methodology tracking using pattern recognition
- **Performance Analytics**: Real-time monitoring of command efficiency and success rates
- **Community Review System**: Structured feedback mechanisms for peer learning

But here's the crucial insight: **the technology isn't the hard part**. The hard part is getting people to actually use it.

## The Resistance to Self-Examination

Just like Overwatch players who want to improve but won't watch their replays, cybersecurity practitioners resist systematic self-analysis. The reasons are predictable:

- "I already know what I'm doing wrong"
- "Recording slows me down"  
- "I don't need feedback from others"
- "Every engagement is different"

These objections reveal the fundamental problem: **people prefer the illusion of progress over the discomfort of actual improvement**.

## The 95th Percentile Framework

Based on our analysis of thousands of penetration testing sessions, here's what separates the 95th percentile from everyone else:

### **1. Systematic Documentation**
Top performers document everything. Not just final reports, but methodology decisions, failed attempts, and timing data. They treat each engagement as a learning laboratory.

### **2. Community Integration** 
They actively seek feedback and give it to others. They understand that teaching others is the fastest way to identify gaps in their own knowledge.

### **3. Pattern Recognition**
They can spot inefficiencies in their own work and consistently improve their processes. They don't just repeat what works—they understand why it works.

### **4. Methodology Discipline**
They follow structured approaches not because they're rigid, but because structure creates space for creativity where it matters most.

## The Current Reality: 80% Complete, 100% Necessary

As of today, boxs.sh is 80% complete. We've implemented:

- ✅ **Complete session recording infrastructure**
- ✅ **HTB methodology phase detection**  
- ✅ **Performance optimization and caching**
- ✅ **Real-time analytics and monitoring**
- ✅ **Community feedback systems**

Still in progress:
- 🔧 **Security hardening** (authentication, input validation)
- 🔧 **Comprehensive testing suite**
- 🔧 **Advanced analytics features**

But here's what we've learned: **the platform is already transformative at 80% completion**. Early users report immediate improvements in their methodology adherence and time efficiency.

## The Broader Vision: Democratizing Expertise

This isn't just about penetration testing. It's about creating a systematic approach to skill development in any complex technical domain.

**The principle**: Make the invisible visible. Turn implicit knowledge into explicit feedback loops.

**The goal**: Reduce the time from novice to competent practitioner from years to months.

**The impact**: Democratize access to the kind of deliberate practice that traditionally only the most motivated individuals pursue.

## Why This Matters Now

Cybersecurity is facing a massive skill gap. Organizations need practitioners who can think systematically, work efficiently, and learn continuously. The traditional approach—throwing people into labs and hoping they figure it out—isn't scaling.

We need infrastructure for learning. We need systematic approaches to skill development. We need to treat professional development with the same rigor we apply to our technical systems.

## The Explorer's Paradox

Here's the fascinating tension at the heart of this project: **structure enables exploration**. By providing rigid frameworks for capturing and analyzing performance, we create space for creative problem-solving and innovative approaches.

The most effective explorers aren't those who wander aimlessly—they're those who map their territory systematically, learn from their mistakes, and build on what works.

## The Call to Action

If you're reading this and thinking "I already know how to improve," you're probably wrong. If you're thinking "I don't have time for this level of analysis," you're definitely missing the point.

**The uncomfortable truth**: You're probably operating at 60th percentile efficiency while thinking you're at 90th percentile. The only way to know for sure is to measure.

**The opportunity**: Getting to 95th percentile isn't about talent. It's about systematically eliminating inefficiencies and building feedback loops.

**The tool**: boxs.sh provides the infrastructure. You provide the discipline.

## What's Next

We're actively working toward 100% completion. Security hardening is the current priority, followed by comprehensive testing and advanced analytics features.

But the real work isn't in the code—it's in changing how the cybersecurity community thinks about skill development, peer learning, and systematic improvement.

**The vision**: A world where getting good at cybersecurity doesn't require years of frustrating trial and error, but weeks of focused, systematic practice with immediate feedback.

**The reality**: We're building the infrastructure. Now we need practitioners brave enough to actually use it.

---

*Want to be part of this experiment? Join the beta at [boxs.sh](https://boxs.sh) and help us prove that systematic skill development can transform how cybersecurity professionals learn and grow.*

*Or don't. Keep grinding away at the same inefficient patterns. But don't complain about the results.*

---

**Technical details**: The platform is built on Next.js with Prisma, implements real-time WebSocket communication, comprehensive caching, and performance monitoring. Full source available for review.

**Methodology**: Based on HackTheBox's 8-phase penetration testing methodology with automatic phase detection and progress tracking.

**Community**: Structured peer review system with experience-based feedback mechanisms and mentorship matching.

The infrastructure is ready. The question is: are you?