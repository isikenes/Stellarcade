

# 🧩 Ürün Tasarım Gereksinimleri (PDR) - Workshop Template

## 🎯 Temel Başlıklar

* **Proje Adı:** Stellarcade
* **Tür:** Basit Blockchain Uygulaması
* **Platform:** Stellar Soroban
* **Hedef:** Basit bir arcade yarışması arayüzü + skor ve ödül kaydı tutan akıllı kontrat + testnet üzerinde entegrasyon


## 🎯 Proje Özeti: Proje, kullanıcıların kısa arcade oyunlarına katılıp skor elde ettikleri ve sıralamaya göre ödül kazandıkları bir mini uygulamadır. Frontend tarafında basit ama modern bir oyun arayüzü (örneğin skor tablosu, giriş/oyun/sonuç ekranı) oluşturulacak, backend kısmında ise Soroban üzerinde çalışan bir smart contract ile oyuncu skorları ve ödül dağıtımı testnet üzerinde kaydedilecektir.

## 🚀 Kısaca Projenizi Anlatın: Stellarcade, oyuncuların günlük mini yarışmalara katılarak Stellar tabanlı ödüller kazanabildiği bir online arcade platformudur. Uygulama, kullanıcıların oyun sonucunda elde ettiği skorları blok zincirine kaydeder ve belirli aralıklarla en yüksek skor elde eden oyunculara Stellar üzerinden ödül dağıtır. Amaç, hem eğlenceli hem de blockchain işlemlerini basit şekilde gösteren bir demo oluşturmaktır.
---

## 📋 Problem Tanımı

Günümüzde oyunlarda elde edilen skorlar genellikle merkezi sistemlerde tutulmakta, bu da güven ve şeffaflık sorunlarına neden olmaktadır.
Bu proje ile:

Oyuncuların skorları blok zinciri üzerinde doğrulanabilir şekilde kaydedilecek.

Soroban smart contract aracılığıyla basit ödül mantığı (örneğin ilk 3’e XLM token ödülü) otomatikleştirilecek.

Modern ve sade bir frontend üzerinden kullanıcılar oyun oynayıp sonuçlarını gerçek zamanlı görebilecek.

Karmaşık iş mantığı olmadan, oyun skor kaydı + ödül dağıtımı + blockchain entegrasyonu temelinde çalışan, anlaşılır ve eğlenceli bir demo amaçlanmaktadır.

---

## ✅ Yapılacaklar (Sadece Bunlar)

### Frontend Geliştirme

* Basic ve modern görünümlü bir frontend geliştireceğiz
* Karmaşık yapısı olmayacak
* Örnek olarak sadece yılan oyunu olacak, yeni oyunlar daha sonra eklenecek


### Smart Contract Geliştirme

* Tek amaçlı, basit contract yazılacak
* Maksimum 3-4 fonksiyon içerecek
* Temel blockchain işlemleri (read/write)
* Minimal veri saklama
* Kolay test edilebilir fonksiyonlar

### Frontend Entegrasyonu

* Mevcut frontend'e müdahale edilmeyecek
* Sadece **JavaScript entegrasyon kodları** eklenecek
* Contract fonksiyonları frontend'e bağlanacak

### Wallet Bağlantısı

* **Freighter Wallet API** entegrasyonu
* Basit connect/disconnect işlemleri
* FreighterWalletDocs.md dosyasına bakarak bu dökümandaki bilgilerle ilerlemeni istiyorum 


---

## ❌ Yapılmayacaklar (Kesinlikle)

### Contract Tarafında

* ❌ Karmaşık iş mantığı
* ❌ Çoklu token yönetimi
* ❌ Gelişmiş access control
* ❌ Multi-signature işlemleri
* ❌ Complex state management
* ❌ Time-locked functions
* ❌ Fee calculation logic

### Frontend Tarafında

* ❌ Frontend tarafına karmaşık bir dosya yapısı yapılmayacak

---

## 🛠 Teknik Spesifikasyonlar

### Minimal Tech Stack

* **Frontend:** Next.js, Tailwind CSS, TypeScript
* **Contract:** Rust + Soroban SDK (basic)
* **Wallet:** Freighter API (sadece connect/sign)
* **Network:** Stellar Testnet

---

## 🧪 Test Senaryoları

* ✅ Contract deploy edilebiliyor mu?
* ✅ Wallet bağlantısı çalışıyor mu?
* ✅ Contract fonksiyonu çağrılabiliyor mu?
* ✅ Sonuç frontend'e dönüyor mu?
* ✅ Frontend düzgün çalışıyor mu?

---

## 📱 Copilot/Cursor'dan Vibe Coding sırasında uymasını istediğim ve check etmesi gereken adımlar

### Adım 2: Contract Yazımı 

* Basit contract template
* 3-4 fonksiyon maksimum
* Deploy et

### Adım 3: Entegrasyon

* Wallet connection
* Contract entegrasyonu
* Sonuç gösterme
---

## 🎯 Başarı Kriterleri

### Teknik Başarı

* ✅ Contract testnet'te çalışıyor
* ✅ Frontend contract entegrasyonu düzgün yapılmış
* ✅ Freighter wallet ile birlikte connect olabilme
* ✅ 3-4 fonksiyonlu basic çalışan bir contracta sahip olmak.

