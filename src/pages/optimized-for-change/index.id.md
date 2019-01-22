---
title: Optimasi Untuk Perubahan
date: '2018-12-12'
spoiler: Apa yang membuat API luar biasa?
---

Apa yang membuat API luar biasa?

Sebuah API design yang *bagus* adalah yang dapat diingat dan tidak ambigu. Hal tersebut mendorong keterbacaan, kebenaran dan performa dari kode, dan membantu developer untuk masuk kedalam [lubang kesuksesan](https://blog.codinghorror.com/falling-into-the-pit-of-success/).

Saya menyebut aspek desain tersebut merupakan "urutan pertama" karena hal tersebut merupakan hal pertama yang developer fokuskan. Kamu mungkin harus berkompromi dengan salah satu dari hal-hal tersebut dan membuat pengorbanan tetapi paling tidak hal tersebut selalu ada dipikiran anda.

Lagipula, kecuali Anda mengirim penjelajah ke Mars, kode Anda mungkin akan berubah seiring waktu. Demikian juga kode konsumen API Anda.

Seorang API designer yang terbaik yang saya tau tidak berhenti hanya pada aspek pada "urutan pertama" seperti keterbacaan. Mereka juga mendedikasikan sama banyaknya, untuk upaya pada sesuatu yang saya sebut sebagai "urutan kedua" dari perancangan API:  **bagaimana kode API tersebut akan berkembang seiring waktu.**

Sedikit perubahan pada requirement dapat membuat kode yang paling elegan berantakan.

API yang *Hebat* mengantisipasi hal tersebut. Mereka mengantisipasi bahwa Anda akan memindahkan beberapa kode. Copy dan paste beberapa bagian. Mengubah nama file. Menyatukan kasus-kasus khusus kedalam helper yang lebih general. Membuka abstraksi kembali ke kasus spesifik. Menambahkan sebuah hack. Mengoptimasi bottleneck. Membuang beberapa part dan memulai lagi. Membuat kesalahan. Menavigasi antara sebab dan akibat. Memperbaiki bug. Review perbaikannya.

API yang hebat tidak hanya membiarkan Anda jatuh ke lubang kesuksesan, tetapi membantu Anda untuk tinggal disana.

Mereka dioptimasi untuk perubahan.
