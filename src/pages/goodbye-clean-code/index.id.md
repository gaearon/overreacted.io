---
title: 'Selamat Tinggal, Clean Code'
date: '2020-01-11'
spoiler: Biarkan clean code membimbingmu, dan hempaskan.
---

Pada malam itu...

Temenku baru saja cek sebuah *code* yang abis mereka garap sepanjang minggu.
Kami sedang membuat sebuah *canvas* untuk *graphics editor*, dan mereka
mengimplementasikan fitur untuk me-*resize* bentuk dari persegi panjang dan
oval dengan cara men-*drag* ujung dari benda tersebut.

*Code*-nya jalan sih.

Tapi terjadi pengulangan terus-menerus. Setiap bangunan (seperti persegi
panjang atau oval) mempunyai bentuk yang berbeda, dan men-*drag*
bagian-bagian dari benda tersebut dapat memberi efek yang berbeda juga
terhadap benda tadi. Jika *user* menekan tombol *Shift*, kami juga harus
memegang proporsi dari ukuran-ukuran yang telah ditentukan. Pokoknya banyak
banget fungsi matematikanya.

*Code*-nya kaya gini, coba lihat:

```jsx
let Rectangle = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
};

let Oval = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeTop(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeBottom(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
};

let Header = {
  resizeLeft(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeRight(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },  
}

let TextBlock = {
  resizeTopLeft(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeTopRight(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeBottomLeft(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
  resizeBottomRight(position, size, preserveAspect, dx, dy) {
    // 10 baris pengulangan dari fungsi matematika
  },
};
```

Pengulangan fungsi matematika itu bener-bener menggangguku.

Itu enggak *clean*.

Kebanyakan pengulangannya ada di bagian arah. Contohnya, `Oval.resizeLeft()` mau
mirip-mirip sama `Header.resizeLeft()`. Ini dikarenakan mereka 
berdua menangani hal yang sama, yaitu *drag* *handle*-nya dari sisi kiri.

Kejadian yang sama berulang ketika berada di metoda untuk bentuk atau benda
yang sama. Contohnya `Oval.resizeLeft()` mempunyai kemiripan dengan fungsi
`Oval` yang lainnya. Ini dikarenakan mereka digunakan untuk bentuk oval tadi.
Ada juga pengulangan ketika `Rectangle`, `Header`, dan `TextBlock`
karena *text blocks* merupakan sebuah persegi panjang.

Tentu saja, aku punya ide.

Kita bisa menghilangkan semua duplikasi dari *code*-nya dengan cara kaya gini: 

```jsx
let Directions = {
  top(...) {
    // 5 baris unik dari operasi matematika
  },
  left(...) {
    // 5 baris unik dari operasi matematika
  },
  bottom(...) {
    // 5 baris unik dari operasi matematika
  },
  right(...) {
    // 5 baris unik dari operasi matematika
  },
};

let Shapes = {
  Oval(...) {
    // 5 baris unik dari operasi matematika
  },
  Rectangle(...) {
    // 5 baris unik dari operasi matematika
  },
}
```

Trus dari kegunaanya:

```jsx
let {top, bottom, left, right} = Directions;

function createHandle(directions) {
  // kode sebanyak 20 baris
}

let fourCorners = [
  createHandle([top, left]),
  createHandle([top, right]),
  createHandle([bottom, left]),
  createHandle([bottom, right]),
];
let fourSides = [
  createHandle([top]),
  createHandle([left]),
  createHandle([right]),
  createHandle([bottom]),
];
let twoSides = [
  createHandle([left]),
  createHandle([right]),
];

function createBox(shape, handles) {
  // kode sebanyak 20 baris
}

let Rectangle = createBox(Shapes.Rectangle, fourCorners);
let Oval = createBox(Shapes.Oval, fourSides);
let Header = createBox(Shapes.Rectangle, twoSides);
let TextBox = createBox(Shapes.Rectangle, fourCorners);
```

Yup, *Code*-nya sudah setengah dari total ukuran yang tadi, dan
pengulangannya hilang seutuhnya! Jadi bersih banget. Kalau kita ingin
mengganti *behavior* untuk beberapa *directions* atau bentuk benda, kita bisa
melakukanya di satu tempat daripada meng-*update* beberapa metoda di semua
tempat.

Oke, waktu sudah menunjukan dini hari (Kebawa suasana). Aku masukin bekas
*refactoring* tadi ke master dan langsung tidur, bangga betapa diriku
membenarkan *code* temanku.

## Esok Paginya

... tidak seperti yang ku bayangkan.

Bosku mengundang diriku ke dalam *one-on-one chat* dimana mereka dengan
sopan memintaku untuk mengembalikan *code* kemarin. Aku terkejut. *Code*
yang lama itu berantakan, dan punyaku bersih!

Dengan iri hati aku patuh, menghabiskan ku bertahun-tahun untuk melihat
bahwa mereka benar.

## Itu Adalah Sebuah Fase

Terobsesi dengan "*clean code*" dan menghilangkan duplikasi adalah sebuah
fase dimana kebanyakan dari kita melewatinya. Ketika kita enggak ngerasa
percaya diri sama kodingan kita, itu jadi pengen ngebuat kita bilang bahwa
sebenernya diri kita bisa, dan bangga untuk dapat diukur sejauh mana
kemampuan kita. *A set of strict lint rules, a naming schema, a file structure, a lack of duplication.*

Kamu tidak bisa menghilangkan duplikasi tersebut secara otomatis, tapi
itu bisa lebih mudah dengan latihan. Kamu nanti akan terbiasa dengan lebih atau
kurangnya dalam setiap perubahan. Sebagai hasilnya, menghilangkan
kodingan yang berulang itu seperti meng-*improve* objek hitungan dari
*code* tersebut. Buruknya, itu jadi bikin pandangan terhadap orang berbeda:
*"Aku adalah orang yang menulis code secara rapih"*. Sebuah pendapat berharga
untuk diri masing-masing.

Ketika kita sudah belajar bagaimana [abstraksi](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction) bekerja, akan membuat kita lebih ingin mengkaji hal tersebut dan membuat semua menjadi mudah ketika kita melihat kodingan yang berulang. Setelah beberapa tahun ngoding, kita melihat pengulangan terjadi *dimana-mana* -- dan berabstraksi adalah kekuatan baru kita. Jika seseorang berbicara bahwa abstraksi adalah sebuah *keutamaan*, kita harus memahaminya. Dan kita akan mulai menilai orang lain karena engga menyembah "kebersihan".

Aku mengerti mengapa "*refactoring*"-ku adalah sebuah bencana, dibagi menjadi
dua hal :

* Pertama, Aku enggak ngomong sama orang yang nulis *code* itu. Aku menulis
    ulang *code*-nya dan memasukan *code* tersebut tanpa input dari mereka.
    Meski jika *itu* adalah sebuah *improvement* (dimana aku tidak percaya itu
    lagi), ini adalah cara terburuk untuk menjalaninya. Team engineering yang
    baik adalah yang membuat kepercayaan secara konstan. Menulis ulang
    kodingan dari orang lain pada team-mu tanpa diskusi apapun dapat memberikan
    efek buruk terhadap kolaborasi *codebase* bersama antar team.

* Kedua, tidak ada yang gratis. Kodinganku menukar beberapa kebutuhan untuk
    menghilangkan duplikasi, dan itu bukanlah suatu hal yang baik. Contohnya,
    mungkin nanti kita butuh *special cases and behaviors* untuk bentuk atau
    benda yang lain. Abstraksi ku dapat menjadikan *code* tersebut
    terbelit-belit atau ribet, dimana kodingan awalnya yang "berantakan"
    kalau dirubah tidak akan menjadi masalah.

Apakah aku berbicara dan menyuruhmu untuk menulis kode yang "kotor" ? Tidak.
Disini aku menyarankan dirimu untuk berfikir jernih tentang apa yang kamu
bilang "bersih" atau "kotor". Apaka kamu mendapati perasaan untuk
memberontak? Kebaikan? Kecantikan? Elegan? Bagaimana kamu bisa yakin dirimu
dapat memberi nilai keluaran yang baik terhadap kata-kata tersebut?
Bagaimana mereka secara pasti memberi perubahan dalam kode yang ditulis dan
[diubah](/optimized-for-change/) ?

Aku yakin, bahwa diriku tidak berfikir sedalam itu dan hal itu pula. Aku lebih
berfikir bahwa bagaimana kodingan itu *seharusnya* terlihat -- tapi bukan
bagaimana itu *berevolusi* dengan team dan lainnya.

Koding merupakan sebuah perjalanan. Pikirkan seberapa jauh kamu berjalan
dari kode pertamamu dan sekarang. Kayaknya itu sebuah perjalanan yang
ceria dan menyenangkan, dari awal mengekstrak sebuah fungsi atau refaktor
sebuah class dapat membuat kode  yang terlihat ribet jadi gampang. Jika
kamu mencari kebanggaan dalam hal buatanmu, kerjalah kebersihan di
dalam kode. Lakukanlah untuk sementara.

Tapi jangan berhenti disitu. Jangan jadi orang yang fanatik terhadap *clean
code*. *Clean code* bukanlah sebuah tujuan. Itu adalah sebuah percobaan untuk
mempermudah memahami dari sistem yang ribet atau susah. Itu adalah sebuah
mekanisme perlindungan diri jika kamu belum sangat yakin terhadap
bagaimana sebuah perubahan dapat memberi efek pada *codebase* tetapi kamu
membutuhkan bantuan dalam laut kegelapan.

Biarkanlah *clean code* membimbingmu. **Dan hempaskan**.

