---
title: 'Kimse izlemiyormuş gibi yap.'
date: '2019-02-15'
spoiler: Teknik borcun başka türü.
---

Bazı teknik borçlar açıkça görülüyor.

Yetersiz bir veri yapısı karmaşık bir koda yol açabilir. Gereksinimler sürekli değiştiğinde, kod önceki yaklaşımların izlerini içerebilir. Bazen kod hızlı veya özensiz bir şekilde yazılmıştır.

Bu teknik borcun analizi kolaydır çünkü açıkça algılanır. Hatalar, performans problemleri ve yeni özellikler eklemede zorluklar şeklinde kendini gösterir.

Teknik borcun başka bir, sinsi biçimi var.

Belki de testler kümesi *biraz* yavaş ama sürünmek kadar yavaş değil, bir hataya bakmaktan endişelenmeyin, bunun yerine iş listesine eklemeniz yeterli. Belki deployment scriptine güvenmiyorsunuzdur, ve bu yüzden fazladan sürüm almayı atlarsınız. Belki de soyutlama katmanları performanstaki bir gerilemeyi tespit etmeyi zorlaştırmaktadır, bu yüzden kodda bir TODO bırakmış olursunuz. Bazen birim testleri çok katıdır ve planlanan özellikleri sunana kadar yeni ve ilgi çekici bir fikri denemeyi ertelersiniz.

Bunların hiçbiri belirleyici bir faktör değil. Her durumda, dikkat dağıtıcı gibi görünebilir. Şikayet etmek boşunadır. Sonuçta, eğer onlar *gerçekten* önemliyse, anlaşmazlığa rağmen bunları yapardınız, değil mi?

Ve bu nedenle hiçbiri bitmez. Kendi başlarına yeterince önemli görünmüyorlar. **Anlaşmazlık onları öldürdü.** Bu keşiflerin bazılarının herhangi bir sonucu olmayabilir. Diğerleri projenizi yeniden tanımlayabilir.

Asla bilemezsin. Bü yüzden anlaşmazlığı aktif olarak azaltmanız gerekir. Projenizin kaderi buna bağlı gibi. Çünkü öyle.

Kimse izlemiyormuş gibi yap.
