---
title: Gələcəyə planlanmış
date: '2018-12-12'
spoiler: Bir API nələr yaxşı edir?
---

Bir API nələr yaxşı edir?

*Yaxşı* API dizaynı yaddaqalan və tamdır. O oxunaqlı, düzgün, və performant koda təşviq edir və inkişafetdiricilərə [uğur çuxuruna](https://blog.codinghorror.com/falling-into-the-pit-of-success/) düşməyə kömək edər.

Mən bu dizayn aspektlərini “birinci sıra” adlandırıram, çünki onları bir kitabxana inkişafetdircisinin ilkin olaraq fokunslanmağa meyl etdiyi şeylərdir. Siz onların bəzilərində kompromisə gedə bilərsiniz və bazarlıq edə bilərsiniz, amma onlar hər zaman sizin ağlınızdadırlar.

Lakin, siz Mars bir rover göndərmədiyiniz halda, sizin kod zamanla dəyişəcək. Və beləcə API istifadəçilərinin də kodu dəyişəcək.

Tanıdığım ən yaxşı API dizaynerlərini bir xüsusiyyət birləşdirir, onlar oxunarlıq kimi “birinci sıra” aspektlərində dayanmırlar. Onlar həm də ”ikinci sıra” aspektləri üzərində də çox vaxt keçirirlər. Başqa sözlə **bu API istifadə edəcək kod zamanla necə dəyişəcək üzərində düşünürlər.**

Tələblərdə olan cüzi bir dəyişiklik ən eleqant kodu darmadağın edə bilər.

*Yaxşı* APIlar bunları əvvəlcədən görə bilər. Onlar təxmin edirlər ki, siz gələcəkdə kodu dəyişəcəksiniz. Bəzi hissələrini copy-paste edəcəksiniz. Adını dəyişəcəksiniz. Bəzi xüsusi halları birləşdirib daha ümumiləşdirilmiş yenidənistifadəediləbilən köməkçilər yaradacaqsınız. Müəyyən abstraksiyaları spesifik hallar üçün tətbiq edəcəksiniz. Darboğazları optimizasiya edəcəksiniz. Bəzən elə olacaq ki, bir hissəni bütövlüklə qırağa atıb, o hissəni yenidən yazacaqsınız. Səhv edəcəksiniz. Səbəb və təsir arasında keçidlər edəcəksiniz. Bug fiks edəcəksiniz. Fiksə baxış keçirəcəksiniz.

Yaxşı APIlar təkcə uğur çuxuruna düşməyinizi təmin etməyəcək, həm də sizin orada *qalmağınıza* kömək edəcək.


Onlar dəyişiklik üçün planlaşdırılıb.

