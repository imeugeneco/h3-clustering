# h3-clustering
> 마지막 업데이트: 2023-08-24

현재 위도, 경도 좌표값으로 존재하는 부동산 매물의 지리공간 데이터에 h3 인덱스를 적용해서 필터링 및 클러스터링을 수행해요.<br>
전달드린 결과물은 프로덕션 데이터로 추출했지만, 이 문서는 알파 데이터 일부로 샘플 데이터셋의 모양새 등만 간단하게 서술해요.
<br>
<br>

### Sample Polygon
테스트에서 사용한 샘플 폴리곤은 **강남역을 포함하는 작은 구역**이에요.<br>
<br>
아무래도 알파 데이터가 강남역과 신논현역 인근 게시글 밀집도가 높아 샘플 폴리곤도 아래와 같이 잡았어요.<br>
샘플 폴리곤에서 벗어나는 지역은 테스트 전이라, 지역의 매물량에 따른 (그리고 줌 레벨에 따른) 해상도를 적절하게 사용해야할 것 같아요.<br>
(산악지대 같은 낮은 매물 밀집도의 지역도 테스트를 해보고 싶었는데 적절한 `resolution`과 `k`값 등을 찾는 작업은 피터에게 토스할게요...)<br>
```json
{
  "polygonArg": "37.49816335,127.02411088|37.5014358,127.0330441|37.49241499,127.02683671|37.49510531,127.03600921"
}
```
![gangnam1](https://github.com/imeugeneco/h3-clustering/assets/47231140/9c329752-94ec-4788-929f-8a26491092b3)

## Dataset
**데이터셋 추출을 위해 사용한 쿼리**
```sql
SELECT id, region_depth2_id, coord_lat, coord_lon FROM article
```

```
// sample-data/articles-all.csv
1365,340,37.478184413414,126.95672990873
1377,340,37.482538491727,126.95216518118
1379,1305,37.484866071815,126.95493825278
```
<br>

**데이터셋에 해상도별 h3 인덱스 추가하는 스크립트 실행**<br>
** 해상도는 임의로 6, 7, 9로 했는데, 적절히 조절해서 적용해주시면 될 것 같아요.
```bash
npm run process:all
```
```
// outputs/articles-processed.csv
ID,Lat,Lon,H3Index_6,H3Index_7,H3Index_9
1365,37.478184413414,126.95672990873,8630e036fffffff,8730e036dffffff,8930e036d73ffff
1377,37.482538491727,126.95216518118,8630e036fffffff,8730e036dffffff,8930e036d03ffff
1379,37.484866071815,126.95493825278,8630e036fffffff,8730e036dffffff,8930e036d17ffff
1380,37.329702260639,127.11437290308,8630e024fffffff,8730e0248ffffff,8930e02482bffff
1381,37.331111087747,127.11393272195,8630e024fffffff,8730e0248ffffff,8930e02482bffff
```


## API
구현해둔 엔드포인트는 다음과 같아요 

### POST `/filter` 
주어진 폴리곤 내 데이터 포인트를 필터링해요. 요청 본문은 `polygonArg` 문자열과 `resolution` 숫자를 포함해야 해요.

```json
// request body
{
  "resolution": 11,
  "polygonArg": "37.49816335,127.02411088|37.5014358,127.0330441|37.49241499,127.02683671|37.49510531,127.03600921"
}
```

```json
// response
{
    "count": 244,
    "articles": [
        {
            "id": 1383,
            "coords": [
                37.497295939571,
                127.02961902596
            ],
            "h3Index": {
                "6": "8630e1ca7ffffff",
                "7": "8730e1ca2ffffff",
                "9": "8930e1ca2abffff"
            }
        },
        {
            "id": 1384,
            "coords": [
                37.495417109124,
                127.03320108332
            ],
            "h3Index": {
                "6": "8630e1ca7ffffff",
                "7": "8730e1ca2ffffff",
                "9": "8930e1ca233ffff"
            }
        },
        {
            "id": 2046,
            "coords": [
                37.497252881891,
                127.0295773935
            ],
            "h3Index": {
                "6": "8630e1ca7ffffff",
                "7": "8730e1ca2ffffff",
                "9": "8930e1ca2abffff"
            }  
        },
```
<br>

### POST `/filter/cluster` 
주어진 폴리곤 내 데이터 포인트를 필터링하고, 필터링된 데이터를 클러스터링해요. 요청 본문은 `polygonArg` 문자열과 `resolution` 숫자를 포함해야 해요.<br>
> 주어진 폴리곤 (혹은 줌 레벨 등)에 따른 resolution 값 조절이 필요해요.

```json
// request body
{
  "resolution": 11,
  "polygonArg": "37.49816335,127.02411088|37.5014358,127.0330441|37.49241499,127.02683671|37.49510531,127.03600921"
}
```
```json
// response
{
    "count": 24,
    "clusters": [
        {
            "type": "Cluster",
            "h3Index": "8b30e1ca2ab5fff",
            "centerCoords": [
                37.497461925384954,
                127.02976409500404
            ],
            "label": 0,
            "count": 118,
            "articles": [
                {
                    "id": 1383,
                    "coords": [
                        37.497461925384954,
                        127.02976409500404
                    ]
                },
                {
                    "id": 10155,
                    "coords": [
                        37.497461925384954,
                        127.02976409500404
                    ]
                },
                {
                    "id": 10159,
                    "coords": [
                        37.497461925384954,
                        127.02976409500404
                    ]
                },
```



## Links
* [h3 - Docs](https://h3geo.org)
* [h3 - Github](https://github.com/uber/h3)
* [h3 viewer](https://wolf-h3-viewer.glitch.me)
* [gridDisk](https://h3geo.org/docs/api/traversal/)
* [Google Earth (교보타워)](https://earth.google.com/web/search/37%2e5037208,127%2e0240967/@37.5037208,127.0240967,17.0117859a,817.4012616d,35y,0h,45t,0r/data=CloaMBIqGVAoVex5wEJAIUKc4syKwV9AKhYzNy41MDM3MjA4LDEyNy4wMjQwOTY3GAIgASImCiQJU4hOMtbAQkARrJi1iLW_QkAZEGdxRwfCX0AhDMG8HybBX0AoAg)
* [카카오맵](https://map.kakao.com/#)
