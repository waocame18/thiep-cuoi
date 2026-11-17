# Thiệp cưới online "Hổ con về chung một nhà"

Thiệp mời cưới một trang, dựng quanh bức tranh vẽ tay cô dâu chú rể và hai bạn hổ. Trang tĩnh thuần HTML/CSS/JS, không cần cài đặt hay build.

## Xem thử

Mở thẳng tệp `index.html` bằng trình duyệt là chạy.

- `index.html?khach=Anh%20Tuấn`: cổng và lời mời hiện tên khách "Anh Tuấn".
- `index.html?mo=1`: vào thẳng thiệp, bỏ qua màn mở cổng.

## Thay nội dung

Mọi nội dung nằm trong một tệp: [assets/js/config.js](assets/js/config.js). Những chỗ ghi "(mẫu)" là dữ liệu giữ chỗ.

| Muốn đổi | Trường trong `config.js` |
|---|---|
| Tên cô dâu, chú rể | `couple` |
| Ngày giờ chính, ngày âm lịch | `mainDate`, `lunarDate` |
| Tên bố mẹ, địa chỉ hai nhà | `invitation.families` |
| Lễ vu quy, thành hôn, tiệc cưới | `events` (dán link Google Maps vào `mapUrl`) |
| Ảnh cưới | `photos`, ảnh đặt trong `assets/photos/` |
| Số tài khoản, mã QR mừng cưới | `gift.accounts` (hoặc `gift.enabled: false` để ẩn) |
| Nhạc nền | `music.src` (để trống thì dùng giai điệu hộp nhạc có sẵn) |
| Tên người bạn vẽ tranh | `thanks.artist` |
| Tắt nhãn "Bản xem trước" | `previewMode: false` |

Tiêu đề và ảnh hiện khi chia sẻ link (Zalo, Facebook) nằm ở phần `<head>` của `index.html`. Sau khi đưa trang lên mạng, đổi `og:image` thành đường dẫn đầy đủ, ví dụ `https://ten-mien/assets/og-image.jpg`.

## Nhận xác nhận tham dự và lời chúc

Khi `rsvp.endpoint` để trống, biểu mẫu chỉ chạy thử ở chế độ xem trước và không gửi đi đâu. Để nhận về Google Sheet:

1. Tạo một Google Sheet, vào **Tiện ích mở rộng → Apps Script**, dán đoạn dưới đây.
2. **Triển khai → Tùy chọn triển khai mới → Ứng dụng web**, chạy với tư cách chính bạn, quyền truy cập "Bất kỳ ai".
3. Dán link ứng dụng web vào `rsvp.endpoint`.

```js
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].appendRow([
    new Date(), d.name, d.attend === 'yes' ? 'Sẽ đến' : 'Không đến',
    d.guests, d.side, d.message, d.invited,
  ]);
  return ContentService.createTextOutput('ok');
}

// Trả về lời chúc để hiện trong sổ lời chúc
function doGet() {
  var rows = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].getDataRange().getValues();
  var wishes = rows.filter(function (r) { return r[5]; }).reverse().slice(0, 60)
    .map(function (r) { return { name: r[1], message: r[5] }; });
  return ContentService.createTextOutput(JSON.stringify(wishes))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Lưu ý: `doGet` công khai mọi lời chúc đã gửi. Nếu muốn duyệt trước, thêm một cột "Đã duyệt" và lọc theo cột đó.

## Đưa lên mạng

Kéo thả cả thư mục lên Netlify Drop, hoặc dùng Vercel / GitHub Pages. Không cần cấu hình gì thêm.

## Cấu trúc

```
index.html            khung trang
assets/js/config.js   nội dung (chỉ sửa ở đây)
assets/js/app.js      đổ nội dung, đếm ngược, lịch, biểu mẫu, cổng mở thiệp
assets/js/music.js    nhạc nền
assets/css/style.css  giao diện
assets/art/           cặp đôi, hai bạn hổ, trái tim (tách từ bức tranh gốc, nền trong suốt)
assets/og-image.jpg   ảnh hiện khi chia sẻ link
```
