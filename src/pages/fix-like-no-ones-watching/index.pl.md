---
title: 'Napraw tak, jakby nikt się nie patrzył'
date: '2019-02-15'
spoiler: Inny rodzaj długu technicznego.
---

Niektóre długi techniczne są na wyciągnięcie ręki, ukrywając się trywialnie w widoku.

Niewystarczająco zaplanowana, czy przewidziana, struktura danych może prowadzić do nadmiernie skomplikowanego kodu. Po zmianie wymagań kod może zawierać ślady poprzednich podejść. Czasami kod jest pisany w pośpiechu lub po prostu jest niechlujny.

Tego rodzaju techniczny dług jest łatwy do wskazania i omówienia, ponieważ jest bardzo widoczny. Objawia się jako błędy, problemy z wydajnością, trudności z rozbudowaniem istniejącej funkcjonalności albo z dodaniem następnych funkcji.

Ale istnieje także inny, bardziej podstępny rodzaj technicznego długu.

Może pakiet testowy jest * trochę * powolny. Nie jest nadmiernie powolny, ale wystarczająco, żeby spowodować, że zamiast się bardziej przyglądnąć temu problemu, to zalogujesz go w liście zaległości na potem. Może nie ufasz skryptowi wdrażania, więc pomijasz to dodatkowe wydanie. Być może warstwy abstrakcji sprawiają, że zbyt trudno jest znaleźć regresję wydajności, więc pozostawiasz TODO w kodzie. Czasami testy jednostkowe są zbyt sztywne, więc odkładasz próbę intrygującego nowego pomysłu, dopóki nie dostarczysz zaplanowanych funkcji.

Żadna z tych rzeczy nie jest katastrofa. Wręcz przeciwnie, może się tobie wydawać, ze zwracanie temu uwagi to jest rozpraszająca błahostka, na którą próżno narzekać. W końcu, jeśli naprawdę by to miało znaczenie, zrobiłbyś to mimo trudności, prawda?

I te rzeczy nigdy się nie kończą. Same nie wydają się wystarczająco ważne. ** Trywialność jest ich usprawiedliwieniem. ** Niektóre z tych eksploracji mogą nie mieć znaczenia. Niektóre z nich mogą na nowo zdefiniować twój projekt.

Nigdy nie wiesz. Dlatego musisz aktywnie redukować nawet trywialne problemy, jak by los tego projektu na tym polegała, bo w pewnym znaczeniu, tak jest.

Napraw tak, jakby nikt się nie patrzył.
