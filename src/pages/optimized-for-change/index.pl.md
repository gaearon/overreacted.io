---
title: Dostosowane do zmian
date: '2018-12-12'
spoiler: Co tworzy dobre API?
---

Co tworzy dobre API?

Design *dobrego* API jest łatwy do zapamiętania i jednoznaczny. Zachęca do tworzenia czytelnego, poprawnego i wydajnego kodu oraz pomaga programistom wpaść w [wir sukcesów](https://blog.codinghorror.com/falling-into-the-pit-of-success/).

Nazywam te trzy aspekty designu "pierwszorzędowymi", ponieważ są one pierwszymi elementami, na których programista zazwyczaj się skupia. Można pójść na kompromis z niektórymi z nich, zrobić ustępstwa, ale zawsze się o nich myśli.

Jednak, jeśli nie wysyłasz łazika na Marsa, to twój kod prawdopodobnie za jakiś czas się zmieni. Również kod użytkowników API ulegnie zmianie.

Najlepsi twórcy API, których znam nie poprzestają na aspektach "pierwszorzędowych", takich jak czytelność. Poświęcają tyle samo, jeśli nie więcej wysiłku na to co nazywam "drugorzędowymi" aspektami designu API: **jak kod korzystający z tego API będzie się zmieniać z czasem.**

Mała zmiana w wymaganiach może sprawić, że nawet najbardziej dopracowany kod się rozpadnie.

*Dobre* API to przewidują. Przewidują, że będziesz chciał przenieść fragment kodu. Skopiować i wkleić jego część. Zmienić jego nazwę. Ujednolicić szczególne przypadki w ogólną abstrakcję wielokrotnego użytku (helper). Rozwinąć abstrakcyjne rozwiązanie ponownie do szczególnych przypadków. Obejść problem (dodać hack). Zoptymalizować wąskie gardło (bottleneck). Wyrzucić część kodu i zacząć od nowa. Zrobić błąd. Nawigować między przyczyną a efektem. Naprawić błąd. Ocenić poprawkę.

Dobre API nie tylko pozwalają wpaść w wir sukcesów, ale pomagają w nim *pozostać*.

Są dostosowane do wprowadzania zmian.