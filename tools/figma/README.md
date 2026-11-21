# Figma yardımcı araçları (uygulamanın parçası değil)

Figma'nın ücretsiz planında görsel dışa aktarma (images API) çok sınırlı. Bu yüzden:

1. Dosya verisi vektör yollarıyla bir kez indirilir:
   `node fetch.mjs data "/v1/files/<FILE_KEY>?geometry=paths" file-geo.json`
   (Git Bash'te `MSYS_NO_PATHCONV=1` gerekir.)
2. Orijinal fotoğraflar: `node fetch.mjs data "/v1/files/<FILE_KEY>/images" fills.json`, ardından URL'leri indir.
3. İkon / illüstrasyon → SVG (API'ye gitmeden, yerelde):
   `node --max-old-space-size=4096 fig2svg.mjs data/file-geo.json <çıktı-klasörü> ad=nodeId ...`
   Metin katmanları çizilmez (metinler kodda yazılır).
4. Katman ağacını incelemek: `node tree.mjs data/file-geo.json <nodeId> [derinlik]`

Erişim anahtarı `%USERPROFILE%\figma-token.txt` dosyasında durur; asla projeye kopyalanmaz.
