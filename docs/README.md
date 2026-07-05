# 🗺️ Bản đồ ăn chơi Việt Nam

Trang web tĩnh lưu trữ các điểm **chơi / ăn / uống** khắp Việt Nam: toạ độ, link Google Map, ảnh, video, đánh giá. Có bản đồ, tìm kiếm và bộ lọc. Ai cũng vào xem và tìm được.

## Bật trang web (GitHub Pages) — làm 1 lần
1. Vào repo trên GitHub → **Settings** → **Pages**.
2. Mục **Build and deployment** → **Source**: chọn **Deploy from a branch**.
3. **Branch**: chọn nhánh đang chứa thư mục này, **Folder**: chọn **/docs** → **Save**.
4. Chờ ~1 phút, GitHub cho link dạng `https://<tên-bạn>.github.io/baocaohanghoa/`. Đó là link chia sẻ cho mọi người.

> Gợi ý: nên merge thư mục `docs/` này vào nhánh **main** rồi bật Pages trên main cho ổn định.

## Thêm / sửa địa điểm
Mở file **`docs/data/diadiem.json`**, thêm một khối (nhớ dấu phẩy `,` ngăn cách các khối):

```json
{
  "ten": "Tên quán / điểm đến",
  "loai": "an",
  "vung": "Miền Nam",
  "tinh": "TP. Hồ Chí Minh",
  "toado": [10.7725, 106.6980],
  "googleMap": "https://maps.app.goo.gl/....",
  "danhgia": 4.6,
  "mota": "Vài dòng cảm nhận.",
  "anh": ["https://link-anh.jpg"],
  "video": "https://youtu.be/....",
  "tags": ["cà phê", "view đẹp"]
}
```

| Trường | Bắt buộc | Ghi chú |
|---|---|---|
| `ten` | ✅ | Tên hiển thị |
| `loai` | ✅ | `choi` \| `an` \| `uong` (quyết định màu ghim) |
| `vung` | ✅ | `Miền Bắc` \| `Miền Trung` \| `Miền Nam` (để bộ lọc chạy đúng) |
| `tinh` | nên có | Tỉnh/thành |
| `toado` | ✅ | `[vĩ độ, kinh độ]` — để ghim lên bản đồ |
| `googleMap` | nên có | Link Google Map; nếu bỏ trống, nút sẽ tự tạo từ `toado` |
| `danhgia` | tuỳ chọn | 0–5 |
| `mota` | tuỳ chọn | Cảm nhận |
| `anh` | tuỳ chọn | Danh sách URL ảnh |
| `video` | tuỳ chọn | Link YouTube/khác |
| `tags` | tuỳ chọn | Từ khoá, dùng cho tìm kiếm |

### Lấy toạ độ & link Google Map
- **Toạ độ**: mở Google Maps → **bấm chuột phải** vào điểm → dòng toạ độ hiện lên trên cùng, bấm để copy (dạng `10.772, 106.698`).
- **Link**: bấm nút **Chia sẻ** ở địa điểm → copy link `maps.app.goo.gl/...`.

### Ảnh & video để ở đâu?
`anh` và `video` là **đường link**, không phải file. Bạn có thể:
- Tải ảnh lên thư mục `docs/photos/` trong repo rồi trỏ `"anh": ["photos/ten-anh.jpg"]`.
- Hoặc dùng link ảnh công khai (Google Photos đã bật chia sẻ, Imgur…), link video YouTube.

Lưu file, commit — trang tự cập nhật sau ~1 phút.

## Chạy thử ở máy (tuỳ chọn)
Cần một server tĩnh (vì trình duyệt chặn `fetch` file khi mở trực tiếp):
```bash
cd docs && python3 -m http.server 8000
# mở http://localhost:8000
```

## Công nghệ
Thuần HTML/CSS/JS + [Leaflet](https://leafletjs.com/) và nền bản đồ OpenStreetMap. Không cần API key, không tốn phí.
