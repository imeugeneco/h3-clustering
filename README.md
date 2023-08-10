# h3-clustering
- [ ] 기존 알파 게시글에 h3 인덱스 추가 위한 스크립트
- [ ] 맵 코너 좌표로 생성한 폴리곤 내 포함된 매물 h3 인덱스로 클러스터링
- [ ] 지도뷰 테스트 위한 dummy API
- [ ] 줌 레벨 당 적절한 resolution, gridDisk `k`값 선정

#### 서버 작업 & 배포
- [ ] graphQL 스키마
- [ ] 게시글 등록 시 lat-lng 좌표로 주요 해상도의 h3 인덱스 저장
- [ ] 기존 지도뷰 API 수정/추가
- [ ] DDL 작성 & DB 수정 요청
- [ ] 알파 배포
- [ ] 프로덕션 배포

## /
```bash
npm install
```

```bash
npm run cluster:all
```

### Sample Polygon
![gangnam1](https://github.com/imeugeneco/h3-clustering/assets/47231140/9c329752-94ec-4788-929f-8a26491092b3)

## Links
* [h3](https://h3geo.org)
* [h3 viewer](https://wolf-h3-viewer.glitch.me)
* [gridDisk](https://h3geo.org/docs/api/traversal/)
* [Google Earth (교보타워)](https://earth.google.com/web/search/37%2e5037208,127%2e0240967/@37.5037208,127.0240967,17.0117859a,817.4012616d,35y,0h,45t,0r/data=CloaMBIqGVAoVex5wEJAIUKc4syKwV9AKhYzNy41MDM3MjA4LDEyNy4wMjQwOTY3GAIgASImCiQJU4hOMtbAQkARrJi1iLW_QkAZEGdxRwfCX0AhDMG8HybBX0AoAg)
* [카카오맵](https://map.kakao.com/#)
