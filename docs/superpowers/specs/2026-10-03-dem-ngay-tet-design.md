# Thiết kế: Web đếm ngày đến Tết Nguyên Đán

- **Ngày:** 2026-10-03
- **Thư mục dự án:** `D:\Cong_viec_2026\T10_2026\vuive`
- **Trạng thái:** đã thống nhất thiết kế, chờ duyệt tài liệu

## 1. Mục tiêu

Một trang web vui nhộn, mở được trên cả điện thoại lẫn máy tính và chia sẻ cho bạn bè bằng link. Trang cho biết còn bao lâu nữa đến Tết Nguyên Đán, tức mùng 1 tháng Giêng âm lịch.

**Trong phạm vi:**
- Mặc định đếm ngược đến **Tết gần nhất**.
- Có ô **chọn năm** (1900–2100) để xem Tết năm đó rơi vào ngày dương lịch nào và còn bao lâu nữa, hoặc đã qua bao lâu.
- Hiện **Can Chi + con giáp** của năm đang xem.
- **Câu nói vui ngẫu nhiên**, có chèn số ngày còn lại.
- **Pháo hoa** khi đến giao thừa, kèm nút "Bắn thử" để bắn bất cứ lúc nào.

**Ngoài phạm vi (YAGNI):** hoa mai/hoa đào rơi, nhạc nền, tài khoản người dùng, đa ngôn ngữ, PWA hay cài offline, thông báo đẩy, bảng liệt kê nhiều năm.

## 2. Công nghệ

- **Vite** (dự án JavaScript thuần, không framework) dùng để chạy thử trên máy và build ra file tĩnh.
- **Vitest** dùng để kiểm thử các hàm thuần.
- Không có thư viện chạy kèm (runtime dependency). Thuật toán âm lịch tự viết.
- Node.js v24, đã có sẵn trên máy.

## 3. Cấu trúc

```
vuive/
├── index.html
├── package.json
├── src/
│   ├── lunar.js       đổi âm lịch → dương lịch; ngày Tết của năm N (UTC+7)
│   ├── canchi.js      năm N → Can Chi + con giáp
│   ├── countdown.js   chọn năm mục tiêu, tính thời gian còn lại hoặc đã qua
│   ├── jokes.js       danh sách câu nói vui + hàm chọn ngẫu nhiên
│   ├── fireworks.js   pháo hoa vẽ trên <canvas>
│   ├── main.js        nối logic với giao diện
│   └── style.css
└── tests/
    ├── lunar.test.js
    ├── canchi.test.js
    ├── countdown.test.js
    └── jokes.test.js
```

`lunar.js`, `canchi.js`, `countdown.js` và `jokes.js` là **hàm thuần**: không đụng tới DOM và không tự đọc đồng hồ hệ thống (thời điểm hiện tại được truyền vào). Chỉ `main.js` và `fireworks.js` làm việc với trình duyệt.

## 4. Các module

### 4.1 `lunar.js`

- Dùng thuật toán đổi âm–dương lịch của Hồ Ngọc Đức (tính điểm sóc và trung khí theo thiên văn), với tham số **múi giờ = 7** (giờ Việt Nam).
- API:
  - `getTetDate(year) → { year, month, day }`: ngày dương lịch của mùng 1 tháng Giêng âm lịch năm `year`.
  - `getTetInstant(year) → number`: mốc thời gian (ms, kiểu epoch) của **00:00 giờ Việt Nam** ngày Tết, tức `Date.UTC(y, m-1, d) - 7 giờ`.
- Gặp năm ngoài khoảng 1900–2100, hàm ném `RangeError`.

### 4.2 `canchi.js`

- `getCanChi(year) → { can, chi, conGiap, emoji, ten }`
  - Can = `CAN[(year + 6) % 10]`, với CAN = Giáp, Ất, Bính, Đinh, Mậu, Kỷ, Canh, Tân, Nhâm, Quý.
  - Chi = `CHI[(year + 8) % 12]`, với CHI = Tý, Sửu, Dần, Mão, Thìn, Tỵ, Ngọ, Mùi, Thân, Dậu, Tuất, Hợi.
  - Con giáp theo kiểu Việt: Chuột, Trâu, Hổ, **Mèo**, Rồng, Rắn, Ngựa, Dê, Khỉ, Gà, Chó, Lợn. Mỗi con kèm một emoji (Mèo là 🐱, không dùng 🐰).
  - `ten` = `"${can} ${chi}"`, ví dụ "Đinh Mùi".

### 4.3 `countdown.js`

- `getDefaultYear(now) → number`: gọi Y là năm dương lịch của `now` **theo giờ Việt Nam**.
  - Nếu `now` chưa qua hết ngày mùng 1 Tết năm Y (tức `now < getTetInstant(Y) + 24 giờ`), trả về Y.
  - Ngược lại trả về Y + 1.
- `getStatus(year, now) → { state, days, hours, minutes, seconds }`
  - `state = "sap-toi"` khi `now < Tết`: các trường là thời gian **còn lại**.
  - `state = "dang-tet"` khi `Tết ≤ now < Tết + 24 giờ`: đang là mùng 1.
  - `state = "da-qua"` khi `now ≥ Tết + 24 giờ`: `days` là số ngày **đã qua**, tính từ 00:00 mùng 1.
  - Ngày = `floor(chênh lệch / 86 400 000)`. Giờ, phút, giây là phần dư.

### 4.4 `jokes.js`

- Khoảng 20 câu mẫu chứa chỗ trống `{ngay}`, ví dụ "Còn {ngay} ngày nữa là được lì xì, ráng ngoan nha!".
- `pickJoke(days, random = Math.random, exclude?) → string`: thay `{ngay}` bằng số ngày và tránh lặp lại đúng câu vừa hiện.
- Câu nói vui chỉ hiện ở trạng thái `sap-toi`.

### 4.5 `fireworks.js`

- `launchFireworks(canvas, durationMs = 5000)`: vẽ pháo hoa bằng các hạt sáng trên canvas phủ toàn màn hình, dùng `requestAnimationFrame`. Hết thời gian thì xóa canvas.
- Canvas có `pointer-events: none` nên không chặn thao tác bấm.
- Nếu người dùng bật `prefers-reduced-motion`, chỉ hiện lời chúc mà không bắn pháo hoa.

### 4.6 `main.js`

- Lúc mở trang: `year = getDefaultYear(Date.now())`, vẽ giao diện, rồi `setInterval` mỗi 1 giây để cập nhật.
- **Mỗi lần cập nhật:** gọi `getStatus` và vẽ lại. Nếu trạng thái vừa chuyển từ `sap-toi` sang `dang-tet` thì bắn pháo hoa và hiện "🎉 Chúc Mừng Năm Mới!".
- **Mở trang đúng ngày mùng 1:** bắn pháo hoa một lần.
- **Đổi năm:** dùng nút ◀ ▶ hoặc ô nhập số. Năm hợp lệ thì tính lại ngày Tết, Can Chi và câu nói vui. Năm không hợp lệ thì hiện "Chỉ xem được từ 1900 đến 2100 thôi nha 😅", giữ nguyên năm cũ.

## 5. Giao diện

Thiết kế cho điện thoại trước. Tông màu đỏ son + vàng kim. Khoảng cách hai bên tối thiểu 16 px, không bị cuộn ngang.

```
     Còn bao lâu nữa đến Tết?

     TẾT ĐINH MÙI 2027  🐐
     Thứ Bảy, 06/02/2027

  [126 Ngày] [08 Giờ] [15 Phút] [42 Giây]

  "Còn 126 ngày nữa là được lì xì, ráng ngoan nha!"   [Câu khác 🔄]

     Năm:  [◀]  2027  [▶]

          [ Bắn thử 🎆 ]
```

- **`sap-toi`:** hiện 4 ô đếm ngược và câu nói vui.
- **`dang-tet`:** thay 4 ô bằng "🎉 Hôm nay là Tết! Chúc Mừng Năm Mới!".
- **`da-qua`:** thay 4 ô bằng "Tết {Can Chi} {năm} đã qua {N} ngày rồi 😅".
- Ngày dương lịch hiện kèm thứ trong tuần, ví dụ "Thứ Bảy, 06/02/2027".

## 6. Kiểm thử

### 6.1 Kiểm thử tự động (Vitest)

`lunar.test.js` đối chiếu ngày Tết Việt Nam:

| Năm | Ngày Tết | Ghi chú |
|---|---|---|
| 1985 | 21/02 | Khác Trung Quốc (20/02): kiểm tra đúng múi giờ UTC+7 |
| 2000 | 05/02 | |
| 2007 | 17/02 | Khác Trung Quốc (18/02): kiểm tra đúng múi giờ UTC+7 |
| 2020 | 25/01 | |
| 2023 | 22/01 | |
| 2024 | 10/02 | |
| 2025 | 29/01 | |
| 2026 | 17/02 | |
| 2027 | 06/02 | |
| 2028 | 26/01 | |
| 2029 | 13/02 | |
| 2030 | 03/02 | |

Ngoài bảng trên, `lunar.test.js` còn kiểm tra `getTetInstant(2027)` bằng `Date.UTC(2027, 1, 5, 17)`, và năm 1899 hoặc 2101 ném `RangeError`.

`canchi.test.js`:
- 2026 ra Bính Ngọ 🐴, 2027 ra Đinh Mùi 🐐, 2024 ra Giáp Thìn 🐲, 2023 ra Quý Mão (Mèo 🐱), 1900 ra Canh Tý.

`countdown.test.js`:
- Lúc 2026-10-03 00:00 giờ Việt Nam: `getDefaultYear` trả về 2027, `getStatus(2027)` ra `sap-toi` với 126 ngày.
- Thời điểm cách Tết 1 giây: `sap-toi`, 0 ngày 0 giờ 0 phút 1 giây.
- Đúng thời điểm Tết, và Tết + 23 giờ 59 phút: `dang-tet`.
- Tết + 24 giờ: `da-qua`. Lúc đó `getDefaultYear` đã chuyển sang năm sau.
- Lúc 2026-10-03 00:00 giờ Việt Nam: `getStatus(2024)` ra `da-qua` với 966 ngày.

`jokes.test.js`:
- Kết quả chứa số ngày, không còn sót `{ngay}`, và không trả về đúng câu bị loại trừ.

### 6.2 Kiểm tra tay

- Chạy `npm run dev`, mở trang trong trình duyệt tích hợp và xem ở khổ điện thoại (375 px) lẫn máy tính.
- Thử đổi năm: năm tương lai, năm đã qua, năm không hợp lệ.
- Thử "Câu khác" và "Bắn thử".

## 7. Build và đăng lên mạng

- `npm run build` tạo thư mục `dist/` gồm các file tĩnh.
- Đăng lên Vercel hoặc GitHub Pages là **bước riêng ở cuối, phải hỏi người dùng trước** vì việc này đưa trang lên Internet công khai.
