---
title: Değişim için optimize edildi
date: '2018-12-12'
spoiler: Bir API'yi harika yapan nedir?
---

Bir API'yi harika yapan nedir?

*İyi* bir API tasarımı akılda kalıcı ve açıktır. Açık, doğru ve etkili kod oluşturulmasını teşvik eder ve geliştiricilerin [başarının sınırları](https://blog.codinghorror.com/falling-into-the-pit-of-success/)nı aşmasına yardımcı olur.

Buna “birinci dereceden“ tasarım yönleri diyorum, çünkü bunlar programcının genellikle odaklandığı ilk öğelerdir. Bazılarını tehlikeye atmanız ve taviz vermeniz gerekebilir, ancak en azından onlar daima aklınızdadır.

Ancak, Mars’a bir gezici göndermiyorsanız, kodunuz muhtemelen zaman içinde değişecektir. Aynı şey, API'nızı kullanan kod için de geçerlidir.

Bildiğim en iyi API tasarımcıları okunabilirlik gibi sadece “birinci dereceden“ özelliklerden memnun değiller. "İkinci mertebeden" API tasarımı dediğim şeye daha fazla çaba harcıyorlar: **Bu API'yi kullanan kodun zaman içinde nasıl değişeceği.**

Teknik özelliklerdeki en küçük değişiklik, en şık kodu kullanılamaz hale getirebilir.

*İyi* API'ler bunu öngörür. Kodu taşıma ihtiyacınızı tahmin ederler. Bazı parçaları kopyalayıp yapıştırın. Onları yeniden adlandırın. Özel durumları, çoklu kullanım için genel bir asistanda birleştirin. 
Soyutlamayı belirli bir duruma geri döndürün. Daha fazla kod yazın... Hata yapın. Sebep ve sonuç arasında gezinin. Hatayı düzeltip, gözden geçirin.

Harika API'ler yalnızca başarının sınırlarını aşmanıza yardımcı olmakla kalmaz, aynı zamanda orada *kalmanıza* da yardımcı olur.

Değişiklik yapmak için uyarlanmışlar.
