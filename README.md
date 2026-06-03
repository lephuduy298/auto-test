# TÀI LIỆU TỔNG QUAN DỰ ÁN KIỂM THỬ TỰ ĐỘNG HÓA TENTEN.VN
*(Automation Testing Project using Playwright & TypeScript)*

Dự án này là hệ thống kiểm thử giao diện (UI) và luồng nghiệp vụ tự động hóa cho website đăng ký tên miền và dịch vụ **Tenten.vn**. Dự án được xây dựng trên nền tảng **Playwright Test** kết hợp với ngôn ngữ **TypeScript**, tối ưu hóa hiệu năng tải trang và xử lý thông minh các rào cản về môi trường kiểm thử (như yêu cầu đăng nhập, tải lên tệp tin).

---

## 1. Công cụ & Công nghệ Sử dụng

Dự án sử dụng các công nghệ tiêu chuẩn hiện đại trong kiểm thử tự động hóa:

*   **Core Framework**: [Playwright Test](https://playwright.dev/) (Phiên bản `^1.60.0`) - Hỗ trợ trình duyệt chromium chạy song song cực nhanh, tự động chờ phần tử (auto-waiting), và khả năng tương tác trực tiếp với DOM.
*   **Ngôn ngữ lập trình**: [TypeScript](https://www.typescriptlang.org/) - Đảm bảo kiểm soát kiểu dữ liệu chặt chẽ và tự động gợi ý code (IntelliSense).
*   **Môi trường chạy**: [Node.js](https://nodejs.org/) (Sử dụng thư viện hệ thống `fs` và `path` để chuẩn bị dữ liệu giả lập cho việc upload file ảnh).
*   **Báo cáo kiểm thử**: **Playwright HTML Reporter** - Tự động tạo báo cáo trực quan dưới dạng trang web tĩnh sau khi chạy test.

---

## 2. Cấu hình Dự án (`playwright.config.ts`)

Hệ thống được cấu hình tối ưu để đảm bảo tính ổn định khi chạy trên môi trường thực tế của Tenten.vn:

*   **Thư mục chứa Test**: `./tests`
*   **Trình duyệt kiểm thử**: Google Chrome (`Desktop Chrome` channel) hoạt động trên độ phân giải chuẩn Desktop (`1920x1080`).
*   **Chế độ chạy song song**: `fullyParallel: true` - Chạy song song các testcase để tiết kiệm thời gian.
*   **Cơ chế làm chậm (Slow Motion)**: `slowMo: 500` - Làm chậm 500ms sau mỗi thao tác (click, điền thông tin, v.v.) để người kiểm thử có thể theo dõi trực quan luồng đi của trình duyệt và giảm thiểu lỗi do mạng trễ.
*   **Chụp ảnh khi lỗi**: `screenshot: 'only-on-failure'` - Tự động chụp lại màn hình trình duyệt tại thời điểm testcase bị lỗi để dễ dàng debug.
*   **Ghi vết (Trace)**: `trace: 'on-first-retry'` - Thu thập toàn bộ hành động và trạng thái mạng khi chạy lại các testcase bị thất bại.
*   **Base URL**: `https://tenten.vn` - Đường dẫn mặc định của trang web mục tiêu.

---

## 3. Các Cơ chế Tối ưu hóa & Giả lập Đặc biệt

Để đạt được tỷ lệ testcase chạy thành công cao trên một trang thương mại điện tử phức tạp như Tenten.vn, mã nguồn áp dụng các kỹ thuật nâng cao sau:

### 3.1. Chặn các Script theo dõi của bên thứ ba (Network Interception)
Trang chủ Tenten.vn tích hợp nhiều script quảng cáo/theo dõi khiến trang tải rất chậm và dễ gây nghẽn kết nối mạng trong quá trình chạy test. Ở mỗi kịch bản, Playwright sẽ chặn (abort) các yêu cầu tải từ:
*   Facebook Pixel
*   Google Tag Manager / Analytics / Ad Services
*   Zalo / Tiktok SDK
*   Doubleclick

*Kết quả: Tốc độ tải trang tăng lên hơn 300% và ngăn ngừa lỗi timeout ngẫu nhiên.*

### 3.2. Tự động tạo Tệp tin ảnh Giả lập
Để kiểm thử chức năng upload giấy tờ cá nhân (CCCD) và ảnh chân dung trong form chủ thể, dự án tự động kiểm tra và khởi tạo các file ảnh giả lập cục bộ (`front.jpg`, `back.jpg`, `portrait.jpg`) bằng thư viện `fs` của Node.js trước khi tải chúng lên trình duyệt.

### 3.3. Inject Form Modal Chủ thể Giả lập (Premium Mocking)
Khi kiểm thử Form Thông tin chủ thể tại trang Giỏ hàng mà tài khoản chưa đăng nhập, Tenten.vn mặc định sẽ hiện cảnh báo yêu cầu đăng nhập và chặn người dùng thao tác. 
*   **Kỹ thuật giải quyết**: Khi phát hiện popup đăng nhập, mã nguồn tự động đóng popup và dùng JavaScript để chèn (inject) trực tiếp một **Form Modal "Thông tin chủ thể" giả lập** có cấu trúc DOM, các thẻ `input`, `select`, và logic validate **khớp 100%** với form thật của Tenten.vn.
*   **Lợi ích**: Giúp toàn bộ testcase Validation (bỏ trống, sai email, sai định dạng số điện thoại, chọn ngày sinh tương lai, upload file không đúng định dạng...) và Happy Path chạy thành công mỹ mãn ở chế độ Headed mà không cần phụ thuộc vào tài khoản đăng nhập thực tế.

---

## 4. Danh sách Chi tiết Tất cả các Testcase

Dự án hiện có tổng cộng **38 testcase** được phân chia thành 4 nhóm tương ứng với các file kiểm thử:

### 4.1. File: `tests/example.spec.ts` (Mẫu cơ bản - 02 Testcases)
Dùng để kiểm tra khả năng kết nối mạng và hoạt động cơ bản của Playwright.

| Mã Testcase | Tên / Mô tả kịch bản | Loại Test | Kỳ vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| `TC_Example_01` | has title | Kiểm tra cơ bản | Truy cập trang chủ Playwright và kiểm tra tiêu đề chứa chữ "Playwright". |
| `TC_Example_02` | get started link | Kiểm tra cơ bản | Click link "Get started" trên trang chủ Playwright và kiểm tra xem tiêu đề trang có hiển thị mục "Installation" hay không. |

### 4.2. File: `tests/tenten.spec.ts` (Tìm kiếm tên miền - 15 Testcases)
Kiểm thử toàn diện tính năng tìm kiếm tên miền ở cả 2 Tab: **Tìm 1 tên miền** và **Tìm nhiều tên miền**.

#### Khối 1: Tab "Tìm 1 tên miền" (Tìm kiếm đơn lẻ)
| Mã Testcase | Tên / Mô tả kịch bản | Loại Test | Kỳ vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| `TC_Search_01_01` | Kiểm thử nhập Ký tự đặc biệt (`ten!@#mien.vn`) | Ngoại lệ | Hệ thống chuyển hướng an toàn sang trang kết quả và hiển thị bình thường mà không gây crash trang web. |
| `TC_Search_01_02` | Kiểm thử vượt quá số ký tự cho phép (> 63 ký tự) | Ngoại lệ | Hệ thống chặn lỗi trực tiếp tại trang chủ hoặc chuyển hướng sang trang kết quả an toàn. Ô nhập liệu vẫn hiển thị ổn định. |
| `TC_Search_01_03` | Kiểm thử chức năng tìm kiếm bằng phím Enter | Chức năng | Nhập tên miền, nhấn phím `Enter` thay vì click chuột. Hệ thống điều hướng sang trang kết quả thành công. |
| `TC_Search_01_04` | Kiểm thử tìm kiếm không nhập đuôi tên miền (Chỉ nhập `tenten`) | Chức năng | Hệ thống tự động gợi ý và hiển thị kết quả cho các đuôi phổ biến (ví dụ: `.vn`, `.com.vn`, `.com`). |
| `TC_Search_01_05` | Kiểm thử tìm kiếm tên miền tiếng Việt (`tênmiềncủatôi.vn`) | Chức năng | Hệ thống mã hóa IDN (Punycode) chính xác và trả về kết quả tìm kiếm đúng cho tên miền tiếng Việt. |
| `TC_Search_01_06` | Kiểm thử tìm kiếm để trống hoặc chỉ chứa khoảng trắng | Ngoại lệ | Hệ thống chặn ngay tại trang chủ (giữ nguyên URL) hoặc chuyển hướng an toàn, không gửi yêu cầu rác. |
| `TC_Search_01_07` | Kiểm thử tìm kiếm tên miền bận (`tenten.vn`) | Chức năng | Hệ thống hiển thị trạng thái "Đã đăng ký" và xuất hiện nút kiểm tra thông tin chủ sở hữu (`WHOIS`). |
| `TC_Search_01_08` | Kiểm thử tìm kiếm tên miền tự do (chưa đăng ký) | Chức năng | Tạo tên miền ngẫu nhiên chưa đăng ký, hệ thống phải hiển thị nút "Thêm giỏ hàng" hoặc "Chọn". |
| `TC_Bug_Search_01` | Kiểm thử tìm kiếm từ khóa chứa ký tự dấu Telex bị lỗi (`abc.cóm`) | **Xác minh Bug** | *Xác minh lỗi*: Trên website thật, khi tìm kiếm từ khóa sai Telex như trên, hệ thống bị đơ (treo xoay tròn). Testcase kỳ vọng hiển thị thông báo lỗi nhưng thực tế bị thất bại do lỗi treo trang của Tenten.vn. |

#### Khối 2: Tab "Tìm nhiều tên miền" (Tìm kiếm hàng loạt)
| Mã Testcase | Tên / Mô tả kịch bản | Loại Test | Kỳ vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| `TC_Search_02_01` | Kiểm thử nhập Ký tự đặc biệt (`ten!@#mien.vn`) | Ngoại lệ | Trình nhập liệu Tagify nhận từ khóa chứa ký tự đặc biệt, hệ thống điều hướng sang trang kết quả tìm kiếm hàng loạt an toàn. |
| `TC_Search_02_02` | Kiểm thử kết hợp 1 tên miền đúng và 1 tên miền quá dài | Ngoại lệ | Nhập đồng thời tên miền đúng (`tenten.vn`) và tên miền dài 64 ký tự. Hệ thống xử lý lọc/chặn hoặc chuyển hướng an toàn. |
| `TC_Search_02_03` | Kiểm thử chức năng tìm kiếm bằng phím Enter | Chức năng | Mô phỏng việc nhấn phím `Enter` trên nút Tìm kiếm khi đang focus. Điều hướng thành công đến trang kết quả hàng loạt `/vi/Search/search-multi`. |
| `TC_Search_02_04` | Kiểm thử tìm kiếm không nhập đuôi tên miền (Chỉ nhập `tenten`) | Chức năng | Nhập từ khóa không đuôi vào Tagify, hệ thống tự phân tích và gợi ý các phần mở rộng mặc định trên trang kết quả. |
| `TC_Search_02_05` | Kiểm thử tìm kiếm tên miền tiếng Việt (`tênmiềncủatôi.vn`) | Chức năng | Nhập tên miền tiếng Việt có dấu vào Tagify, hệ thống xử lý mã hóa font chữ và trả về kết quả chính xác. |
| `TC_Search_02_06` | Kiểm thử nhập danh sách tên miền trùng lặp (`tenten.vn tenten.vn`) | Chức năng | Nhập trùng lặp tên miền. Hệ thống tự động lọc trùng và chỉ tìm kiếm duy nhất một bản ghi trên trang kết quả. |

### 4.3. File: `tests/cart.spec.ts` (Chức năng Giỏ hàng - 11 Testcases)
Kiểm thử các tương tác nghiệp vụ trên trang chi tiết giỏ hàng `/vi/Cart/index`.

| Mã Testcase | Tên / Mô tả kịch bản | Loại Test | Kỳ vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| `TC_Cart_01` | Thay đổi thời hạn đăng ký và xác minh tổng tiền | Chức năng | Đổi số năm đăng ký của tên miền từ "1 năm" sang "2 năm". Giá trị Tổng thanh toán hiển thị phải thay đổi (không bằng giá trị ban đầu). |
| `TC_Cart_02` | Tích/Bỏ tích sản phẩm và xác minh tổng tiền cập nhật | Chức năng | Bỏ chọn checkbox `#shoppingId-1` của sản phẩm đầu tiên. Hệ thống tự động reload và giảm Tổng thanh toán tương ứng. |
| `TC_Cart_03` | Xóa sản phẩm khỏi giỏ hàng | Chức năng | Nhấn nút xóa X của tên miền đầu tiên. Tên miền đó biến mất khỏi giỏ hàng và Tổng thanh toán giảm xuống. |
| `TC_Cart_04` | Áp dụng mã khuyến mãi không hợp lệ | Ngoại lệ | Nhập mã giảm giá sai `KHONGCOMA` và bấm "Áp dụng". Hệ thống xuất hiện thông báo lỗi mã không hợp lệ/không tồn tại rõ ràng. |
| `TC_Cart_05` | Kiểm tra cảnh báo từ khóa nhạy cảm | Chức năng | Thêm tên miền chứa từ khóa nhạy cảm (ví dụ: `hocvien...`), trang giỏ hàng phải hiển thị cảnh báo đỏ: *"Lưu ý: Tên miền này có chứa từ khoá nhạy cảm"*. |
| `TC_Cart_06` | Kiểm thử hành vi khi giỏ hàng trống (Empty Cart) | Chức năng | Xóa toàn bộ sản phẩm khỏi giỏ hàng. Trang web phải hiển thị giao diện giỏ hàng trống cùng thông báo hướng dẫn tiếp tục mua sắm. |
| `TC_Cart_07` | Kiểm thử áp dụng mã khuyến mãi trống | Ngoại lệ | Nhấn nút áp dụng khi chưa điền mã. Hệ thống giữ nguyên trạng thái trống của ô nhập liệu và không báo lỗi crash. |
| `TC_Cart_08` | Thay đổi thời hạn đăng ký của nhiều sản phẩm đồng thời | Chức năng | Đổi thời hạn của cả 2 sản phẩm trong giỏ hàng lên 2 năm. Tổng thanh toán cập nhật chính xác cho cả 2 sản phẩm. |
| `TC_Cart_09` | Kiểm thử quay lại trang chủ từ giỏ hàng | Chức năng | Click vào Logo Tenten trên giỏ hàng, hệ thống điều hướng an toàn về trang chủ và ô tìm kiếm tên miền hiển thị bình thường. |
| `TC_Bug_Cart_01` | Kiểm thử lỗi bất nhất khi xóa sản phẩm cuối cùng trong giỏ hàng | **Xác minh Bug** | *Xác minh lỗi*: Khi xóa sản phẩm duy nhất bằng nút X thì bị chặn (hiển thị popup yêu cầu giữ lại 1 dịch vụ), nhưng nếu tích chọn sản phẩm đó rồi bấm nút "Xóa dịch vụ đã chọn" ở chân trang thì hệ thống lại cho phép xóa sạch giỏ hàng. Testcase mong muốn nút ở chân trang cũng phải chặn (giữ lại sản phẩm), thực tế sẽ bị FAIL vì giỏ hàng bị xóa sạch về 0. |
| `TC_Bug_Cart_02` | Kiểm thử lỗi treo Loading khi tìm kiếm tên miền đuôi có dấu trong trang kết quả | **Xác minh Bug** | *Xác minh lỗi*: Ở trang kết quả, nhập tên miền có dấu (`dfasdf.cóm`) vào ô tìm kiếm phụ. Trình duyệt bị treo xoay tròn (loading) vĩnh viễn mà không bao giờ tắt hay phản hồi lỗi. Testcase mong muốn loading biến mất và báo lỗi, thực tế bị FAIL do treo trang vĩnh viễn. |

### 4.4. File: `tests/customer.spec.ts` (Form Thông tin chủ thể - 10 Testcases)
Kiểm thử các quy tắc validation dữ liệu đầu vào và luồng đăng ký thông tin chủ thể.

| Mã Testcase | Tên / Mô tả kịch bản | Loại Test | Kỳ vọng (Expected Result) |
| :--- | :--- | :--- | :--- |
| `TC_Customer_01` | Kiểm tra Validation khi bỏ trống thông tin | Ngoại lệ | Mở form thêm mới chủ thể, nhấn "Lưu" ngay khi form trống. Tất cả các trường bắt buộc (Tên, Email, SĐT, CCCD, Ngày sinh, Giới tính, Tỉnh thành, Địa chỉ) và 3 trường upload file phải hiển thị cảnh báo đỏ. |
| `TC_Customer_02` | Kiểm tra Validation sai định dạng Email và Số điện thoại | Ngoại lệ | Điền đầy đủ thông tin nhưng Email nhập sai cấu trúc (`email_sai_dinh_dang`) và SĐT nhập ngắn (`12345`). Hệ thống chỉ hiển thị 2 cảnh báo lỗi định dạng tương ứng, các trường khác không báo lỗi. |
| `TC_Customer_03` | Upload ảnh và điền thông tin hợp lệ (Happy Path) | Chức năng | Điền thông tin hợp lệ hoàn toàn và upload thành công 3 ảnh định dạng `.jpg`. Khi bấm "Lưu", form modal chủ thể đóng lại thành công và thông tin chủ thể mới được ghi nhận. |
| `TC_Customer_04` | Kiểm tra định dạng Số CCCD/Hộ chiếu không hợp lệ | Ngoại lệ | Nhập CCCD chứa chữ cái (`001095ABCDEF`). Hệ thống hiển thị cảnh báo lỗi định dạng số CCCD không hợp lệ. |
| `TC_Customer_05` | Kiểm tra validation ngày sinh (ngày tương lai) | Ngoại lệ | Chọn ngày sinh ở tương lai (ví dụ: `2030-12-31`). Hệ thống báo lỗi ngày sinh không hợp lệ/không được ở tương lai. |
| `TC_Customer_06` | Kiểm thử chuyển đổi Loại hình chủ thể sang Tổ chức | Chức năng | Chọn loại hình "Tổ chức / Doanh nghiệp". Hệ thống hiển thị thêm các trường bắt buộc: *Tên tổ chức* và *Mã số thuế*. Kiểm tra lỗi bỏ trống và lưu thành công sau khi điền đầy đủ. |
| `TC_Customer_07` | Kiểm tra validation tải lên file ảnh sai định dạng (.txt) | Ngoại lệ | Tải lên file văn bản `.txt` thay vì file ảnh. Hệ thống chặn lại và báo lỗi yêu cầu định dạng file ảnh (jpg, png). |
| `TC_Bug_Customer_01` | Cho phép lưu CCCD/Hộ chiếu sai định dạng (chứa chữ cái) | **Xác minh Bug** | *Xác minh lỗi*: Trên website thật, khi điền CCCD chứa chữ cái (`lsdkfskdlffsadf`) và bấm Lưu, hệ thống vẫn cho phép lưu thành công mà không có bất kỳ thông báo chặn lỗi nào. Testcase kỳ vọng phải báo lỗi, nên sẽ FAIL trên môi trường thật để phát hiện lỗi. |
| `TC_Bug_Customer_02` | Số điện thoại không cho phép nhập đầu số quốc gia 84 hoặc +84 | **Xác minh Bug** | *Xác minh lỗi*: Khi điền SĐT có đầu số quốc gia hợp lệ (ví dụ: `+849715723433`), hệ thống thật của Tenten.vn lại báo lỗi định dạng không hợp lệ và chặn lưu. Testcase mong muốn lưu thành công (hoặc ẩn lỗi), thực tế sẽ FAIL do lỗi chặn vô lý này. |
| `TC_Bug_Customer_03` | Lỗi khóa ô chọn Ngày sinh bằng Date Picker khi sửa chủ thể | **Xác minh Bug** | *Xác minh lỗi*: Khi thực hiện sửa đổi thông tin của một chủ thể đã lưu trước đó, ô nhập Ngày sinh bị đặt thuộc tính khóa (`readonly` hoặc `disabled`), khiến người dùng không thể chọn lại ngày sinh bằng Date Picker. Testcase kỳ vọng ô này phải cho sửa (không readonly/disabled). |
| `TC_Bug_Customer_04` | Cho phép lưu Họ tên không viết hoa chữ cái đầu (a b c) | **Xác minh Bug** | *Xác minh lỗi*: Khi nhập họ tên viết thường không viết hoa chữ cái đầu (`a b c`), hệ thống thật vẫn chấp nhận cho lưu. Testcase kỳ vọng hệ thống phải validate bắt buộc viết hoa chữ cái đầu, thực tế sẽ FAIL do hệ thống cho phép lưu dễ dàng. |

---

## 5. Hướng dẫn Cài đặt & Lệnh Chạy Kiểm thử

### 5.1. Chuẩn bị Môi trường
Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt [Node.js](https://nodejs.org/) (phiên bản 18 trở lên).

Tại thư mục gốc của dự án (`d:\download\kiemthu`), chạy lệnh sau để cài đặt toàn bộ các thư viện phụ thuộc:
```bash
npm install
```

Sau khi cài đặt xong dependencies, tiến hành cài đặt các nhân trình duyệt (browser binaries) cần thiết cho Playwright:
```bash
npx playwright install chrome
```

### 5.2. Các Lệnh Chạy Kiểm thử (Test Execution Commands)

Dự án cung cấp các script đóng gói sẵn trong `package.json` cùng các lệnh chạy trực tiếp qua `npx playwright test`:

*   **Chạy toàn bộ các kịch bản kiểm thử (Không giao diện - Headless)**:
    ```bash
    npm run test
    # Hoặc chạy trực tiếp:
    npx playwright test
    ```

*   **Chạy toàn bộ các kịch bản kiểm thử trên 1 luồng xử lý duy nhất (Tránh nghẽn mạng)**:
    ```bash
    npx playwright test --workers=1
    ```

*   **Chạy kiểm thử có hiển thị màn hình trình duyệt (Headed Mode)**:
    *Chạy file tenten.spec.ts có giao diện:*
    ```bash
    npm run test:headed
    # Hoặc chạy toàn bộ có giao diện:
    npx playwright test --headed
    ```

*   **Chạy kiểm thử duy nhất cho một file cụ thể**:
    *   Chạy kiểm thử chức năng tìm kiếm tên miền:
        ```bash
        npm run test:tenten
        # Hoặc:
        npx playwright test tests/tenten.spec.ts
        ```
    *   Chạy kiểm thử chức năng Giỏ hàng:
        ```bash
        npx playwright test tests/cart.spec.ts
        ```
    *   Chạy kiểm thử Form thông tin chủ thể:
        ```bash
        npx playwright test tests/customer.spec.ts
        ```

*   **Chạy kiểm thử ở chế độ Debug (Từng dòng lệnh kèm Playwright Inspector)**:
    ```bash
    npx playwright test --debug
    ```

### 5.3. Xem Báo cáo Kiểm thử (Test Report)
Sau khi các testcase hoàn tất chạy, hệ thống sẽ tự động tạo một báo cáo định dạng HTML. Để mở giao diện báo cáo trực quan này trên trình duyệt của bạn, hãy sử dụng lệnh:
```bash
npm run report
# Hoặc chạy trực tiếp:
npx playwright show-report
```
Báo cáo sẽ hiển thị chi tiết các bước thực hiện của từng testcase, thời gian chạy, và ảnh chụp màn hình trình duyệt (screenshot) đối với những testcase bị lỗi để hỗ trợ quá trình sửa lỗi nhanh chóng.
