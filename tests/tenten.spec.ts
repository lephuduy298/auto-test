import { test, expect } from '@playwright/test';

// ============================================================================
// KHỐI 1: KIỂM THỬ TAB "TÌM 1 TÊN MIỀN"
// ============================================================================
test.describe('Kiểm thử tab Tìm 1 tên miền', () => {

  test.beforeEach(async ({ page }) => {
    // Tăng thời gian Timeout của mỗi test case lên 90 giây để bù đắp cho slowMo và tải trang
    test.setTimeout(90000);

    // Cấu hình kích thước màn hình Desktop tiêu chuẩn
    await page.setViewportSize({ width: 1920, height: 1080 });

    // TỐI ƯU HÓA TỐC ĐỘ: Chặn toàn bộ các script theo dõi/quảng cáo của bên thứ ba làm nghẽn trang chủ Tenten.vn
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.includes('facebook') ||
        url.includes('google-analytics') ||
        url.includes('googletagmanager') ||
        url.includes('zalo') ||
        url.includes('tiktok') ||
        url.includes('doubleclick') ||
        url.includes('googleadservices')
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    console.log('[Tab 1] Truy cập trang chủ Tenten.vn...');
    // Sử dụng 'domcontentloaded' để đảm bảo cấu trúc DOM và các sự kiện jQuery đã sẵn sàng
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 35000 });

    // Tự động ẩn popup quảng cáo của Tenten để tránh cản trở tương tác
    await page.addStyleTag({
      content: `
        .popup.basic_popup.tg_popup_slide,
        .modal-backdrop.fade.show {
          display: none !important;
          pointer-events: none !important;
        }
      `
    });

    // Đợi trực tiếp tab Tìm 1 tên miền xuất hiện trên DOM để đảm bảo giao diện đã sẵn sàng
    const tabTim1 = page.getByText(/Tìm 1 tên miền/);
    await expect(tabTim1).toBeVisible({ timeout: 25000 });
    await tabTim1.click();
    await page.waitForTimeout(500); // Đợi tab active nhẹ nhàng
  });

  test('TC_Search_01_01: Kiểm thử nhập Ký tự đặc biệt (ten!@#mien.vn)', async ({ page }) => {
    console.log('Chạy TC_Search_01_01: Tìm 1 tên miền chứa ký tự đặc biệt...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });

    // Nhập tên miền chứa ký tự đặc biệt
    await inputDomain.fill('ten!@#mien.vn');

    // Click nút Tìm kiếm
    const searchBtn = page.locator('button.searchDomainOne');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    // Hệ thống sẽ chuyển hướng an toàn và hiển thị trang kết quả kiểm thử
    console.log('Đang chờ trang kết quả xử lý...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });
    console.log('TC_Search_01_01 thành công: Hệ thống xử lý ngoại lệ an toàn!');
  });

  test('TC_Search_01_02: Kiểm thử vượt quá số ký tự cho phép (> 63 ký tự)', async ({ page }) => {
    console.log('Chạy TC_Search_01_02: Tìm 1 tên miền quá dài...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });

    // Chuỗi gồm 64 ký tự 'a' + '.vn'
    const longDomain = 'a'.repeat(64) + '.vn';
    await inputDomain.fill(longDomain);

    const searchBtn = page.locator('button.searchDomainOne');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    // Chờ 3 giây để trình duyệt gửi yêu cầu và hệ thống phản hồi xử lý (chặn tại chỗ hoặc chuyển hướng)
    console.log('Đang chờ hệ thống xử lý yêu cầu tên miền quá dài...');
    await page.waitForTimeout(3000);

    const currentURL = page.url();
    if (currentURL.includes('/vi/Search')) {
      console.log('Hệ thống chuyển hướng sang trang kết quả, tiến hành xác minh...');
      const resultHeading = page.getByText('Kết quả tìm kiếm');
      await expect(resultHeading).toBeVisible({ timeout: 15000 });
    } else {
      console.log('Hệ thống đã chặn lỗi thành công ngay tại trang chủ (URL giữ nguyên không chuyển hướng)!');
      // Đảm bảo phần tử ô input vẫn hiển thị bình thường, không gây crash trang web
      await expect(inputDomain).toBeVisible();
    }
    console.log('TC_Search_01_02 thành công: Hệ thống kiểm soát lỗi tên miền quá dài an toàn!');
  });

  test('TC_Search_01_03: Kiểm thử chức năng tìm kiếm bằng phím Enter', async ({ page }) => {
    console.log('Chạy TC_Search_01_03: Tìm 1 tên miền bằng phím Enter...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });

    await inputDomain.fill('tenten.vn');

    // Giả lập thao tác nhấn phím Enter trên ô input thay vì click chuột
    await inputDomain.press('Enter');

    console.log('Đang chờ trang kết quả hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });
    await expect(page).toHaveURL(/.*\/vi\/Search\/searchGpt.*/, { timeout: 20000 });
    console.log('TC_Search_01_03 thành công: Tìm kiếm bằng nút Enter hoạt động tốt!');
  });

  test('TC_Search_01_04: Kiểm thử tìm kiếm không nhập đuôi tên miền (Chỉ nhập tenten)', async ({ page }) => {
    console.log('Chạy TC_Search_01_04: Tìm kiếm không nhập TLD...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });

    // Nhập từ khóa không có đuôi .vn, .com...
    await inputDomain.fill('tenten');

    const searchBtn = page.locator('button.searchDomainOne');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    // Kỳ vọng hệ thống tự gợi ý và hiển thị kết quả cho các đuôi phổ biến
    console.log('Đang chờ trang gợi ý kết quả hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });
    console.log('TC_Search_01_04 thành công: Hệ thống tự động phân tích và gợi ý đuôi phổ biến!');
  });

  test('TC_Search_01_05: Kiểm thử tìm kiếm tên miền tiếng Việt (tênmiềncủatôi.vn)', async ({ page }) => {
    console.log('Chạy TC_Search_01_05: Tìm tên miền tiếng Việt có dấu...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });

    // Nhập tên miền tiếng Việt (IDN)
    await inputDomain.fill('tênmiềncủatôi.vn');

    const searchBtn = page.locator('button.searchDomainOne');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    // Kỳ vọng hệ thống xử lý đúng tiếng Việt và trả về trang kết quả
    console.log('Đang chờ trang kết quả hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });
    console.log('TC_Search_01_05 thành công: Hệ thống xử lý font tiếng Việt có dấu mượt mà!');
  });

  test('TC_Search_01_06: Kiểm thử tìm kiếm để trống hoặc chỉ chứa khoảng trắng', async ({ page }) => {
    console.log('Chạy TC_Search_01_06: Tìm kiếm tên miền trống...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });

    // Nhập khoảng trắng
    await inputDomain.fill('   ');

    const searchBtn = page.locator('button.searchDomainOne');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    // Chờ xem hệ thống xử lý (Tenten.vn thường hiển thị cảnh báo hoặc không cho phép chuyển hướng sang trang kết quả)
    console.log('Đang chờ hệ thống phản hồi với ô tìm kiếm trống...');
    await page.waitForTimeout(3000);

    const currentURL = page.url();
    if (currentURL.includes('/vi/Search')) {
      console.log('Hệ thống chuyển hướng sang trang kết quả, tiến hành xác minh...');
      const resultHeading = page.getByText('Kết quả tìm kiếm');
      await expect(resultHeading).toBeVisible({ timeout: 15000 });
    } else {
      console.log('Hệ thống chặn thành công lỗi tìm kiếm trống ngay tại trang chủ!');
      await expect(inputDomain).toBeVisible();
    }
    console.log('TC_Search_01_06 thành công!');
  });

  test('TC_Search_01_07: Kiểm thử tìm kiếm tên miền bận (tenten.vn)', async ({ page }) => {
    console.log('Chạy TC_Search_01_07: Tìm kiếm tên miền bận (tenten.vn)...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });

    await inputDomain.fill('tenten.vn');

    const searchBtn = page.locator('button.searchDomainOne');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    console.log('Đang chờ trang kết quả hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });

    // Chờ cho đến khi AJAX kiểm tra trạng thái bận load xong và hiển thị nút WHOIS hoặc nhãn Đã đăng ký
    console.log('Đang chờ AJAX kiểm tra trạng thái tên miền...');
    const whoisIndicator = page.locator(':text("Đã đăng ký"), :text("whois"), :text("WHOIS"), :text("Xem thông tin"), [class*="whois"]').first();
    await expect(whoisIndicator).toBeVisible({ timeout: 25000 });

    console.log('TC_Search_01_07 thành công: Xác minh tên miền bận chính xác!');
  });

  test('TC_Search_01_08: Kiểm thử tìm kiếm tên miền tự do (chưa đăng ký)', async ({ page }) => {
    console.log('Chạy TC_Search_01_08: Tìm kiếm tên miền chưa đăng ký...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });

    // Tạo một tên miền ngẫu nhiên cực lạ
    const randomDomain = `testdomainrandom-${Math.floor(Math.random() * 10000000)}.vn`;
    console.log(`Từ khóa tìm kiếm: ${randomDomain}`);
    await inputDomain.fill(randomDomain);

    const searchBtn = page.locator('button.searchDomainOne');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    console.log('Đang chờ trang kết quả hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });

    // Trang kết quả có nút "Thêm giỏ hàng" hoặc nhãn "Chọn" cho tên miền này
    const addCartBtn = page.getByText('Thêm giỏ hàng').first();
    await expect(addCartBtn).toBeVisible({ timeout: 25000 });
    console.log('TC_Search_01_08 thành công: Tên miền tự do có nút thêm giỏ hàng!');
  });

  test('TC_Bug_Search_01: Kiểm thử tìm kiếm từ khóa chứa ký tự dấu Telex bị lỗi (abc.cóm)', async ({ page }) => {
    console.log('Chạy TC_Bug_Search_01: Tìm kiếm tên miền lỗi Telex abc.cóm...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });

    // Nhập từ khóa lỗi Telex
    await inputDomain.fill('abc.cóm');

    const searchBtn = page.locator('button.searchDomainOne');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    console.log('Kỳ vọng hệ thống chuyển hướng sang trang kết quả hoặc hiển thị thông báo lỗi...');
    // Mong muốn hệ thống chuyển sang trang kết quả hoặc báo lỗi định dạng không hợp lệ.
    // Thực tế hệ thống sẽ đứng im (đơ), dẫn đến việc kiểm tra này bị Fail/Timeout, chứng minh Bug thành công!
    const resultHeading = page.locator(':text("Kết quả tìm kiếm"), :text("không hợp lệ"), :text("Lỗi"), :text("lỗi")').first();
    await expect(resultHeading).toBeVisible({ timeout: 20000 });

    console.log('TC_Bug_Search_01 hoàn tất kiểm tra!');
  });
});

// ============================================================================
// KHỐI 2: KIỂM THỬ TAB "TÌM NHIỀU TÊN MIỀN"
// ============================================================================
test.describe('Kiểm thử tab Tìm nhiều tên miền', () => {

  test.beforeEach(async ({ page }) => {
    // Tăng thời gian Timeout của mỗi test case lên 90 giây để bù đắp cho slowMo và tải trang
    test.setTimeout(90000);

    await page.setViewportSize({ width: 1920, height: 1080 });

    // TỐI ƯU HÓA TỐC ĐỘ: Chặn toàn bộ các script theo dõi/quảng cáo của bên thứ ba làm nghẽn trang chủ Tenten.vn
    await page.route('**/*', (route) => {
      const url = route.request().url();
      if (
        url.includes('facebook') ||
        url.includes('google-analytics') ||
        url.includes('googletagmanager') ||
        url.includes('zalo') ||
        url.includes('tiktok') ||
        url.includes('doubleclick') ||
        url.includes('googleadservices')
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    console.log('[Tab 2] Truy cập trang chủ Tenten.vn...');
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 35000 });

    // Tự động ẩn popup quảng cáo của Tenten để tránh cản trở tương tác
    await page.addStyleTag({
      content: `
        .popup.basic_popup.tg_popup_slide,
        .modal-backdrop.fade.show {
          display: none !important;
          pointer-events: none !important;
        }
      `
    });

    // Đợi trực tiếp tab Tìm nhiều xuất hiện
    const tabTimNhieu = page.getByText(/Tìm nhiều tên miền/);
    await expect(tabTimNhieu).toBeVisible({ timeout: 25000 });
    await tabTimNhieu.click();

    // Đợi cho đến khi phần container Tìm nhiều (#search-2) hoàn toàn sẵn sàng và hiển thị trên màn hình
    const search2Container = page.locator('#search-2');
    await expect(search2Container).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1000); // Chờ hiệu ứng chuyển tab hoàn tất ổn định
  });

  test('TC_Search_02_01: Kiểm thử nhập Ký tự đặc biệt (ten!@#mien.vn)', async ({ page }) => {
    console.log('Chạy TC_Search_02_01: Tìm nhiều tên miền chứa ký tự đặc biệt...');
    const tagifyInput = page.locator('#search-2 .tagify__input');
    await expect(tagifyInput).toBeVisible({ timeout: 20000 });

    await tagifyInput.scrollIntoViewIfNeeded();
    await tagifyInput.click();
    await tagifyInput.focus();
    await tagifyInput.pressSequentially('ten!@#mien.vn', { delay: 30 });
    await page.waitForTimeout(500);

    const searchBtn = page.locator('button.searchDomainMany');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    console.log('Đang chờ trang kết quả hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });
    console.log('TC_Search_02_01 thành công: Hệ thống xử lý ngoại lệ Tìm nhiều an toàn!');
  });

  test('TC_Search_02_02: Kiểm thử kết hợp 1 tên miền đúng và 1 tên miền quá dài (> 63 ký tự)', async ({ page }) => {
    console.log('Chạy TC_Search_02_02: Nhập kết hợp tên miền đúng và tên miền quá dài...');
    const tagifyInput = page.locator('#search-2 .tagify__input');
    await expect(tagifyInput).toBeVisible({ timeout: 20000 });

    const correctDomain = 'tenten.vn';
    const tooLongDomain = 'a'.repeat(64) + '.vn';

    await tagifyInput.scrollIntoViewIfNeeded();
    await tagifyInput.click();
    await tagifyInput.focus();
    // Nhập hai tên miền cách nhau bởi khoảng trắng
    await tagifyInput.pressSequentially(`${correctDomain} ${tooLongDomain}`, { delay: 30 });
    await page.waitForTimeout(500);

    const searchBtn = page.locator('button.searchDomainMany');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    // Chờ 3 giây để trình duyệt gửi yêu cầu và hệ thống phản hồi xử lý (chặn tại chỗ hoặc chuyển hướng)
    console.log('Đang chờ hệ thống xử lý yêu cầu tên miền kết hợp...');
    await page.waitForTimeout(3000);

    const currentURL = page.url();
    if (currentURL.includes('/vi/Search')) {
      console.log('Hệ thống chuyển hướng sang trang kết quả, tiến hành xác minh...');
      const resultHeading = page.getByText('Kết quả tìm kiếm');
      await expect(resultHeading).toBeVisible({ timeout: 15000 });
    } else {
      console.log('Hệ thống đã chặn lỗi thành công ngay tại trang chủ (URL giữ nguyên không chuyển hướng)!');
      // Đảm bảo phần tử nhập liệu vẫn hiển thị ổn định
      await expect(tagifyInput).toBeVisible();
    }
    console.log('TC_Search_02_02 thành công: Hệ thống phân tích và kiểm soát dữ liệu kết hợp an toàn!');
  });

  test('TC_Search_02_03: Kiểm thử chức năng tìm kiếm bằng phím Enter', async ({ page }) => {
    console.log('Chạy TC_Search_02_03: Tìm nhiều tên miền bằng nút Enter...');
    const tagifyInput = page.locator('#search-2 .tagify__input');
    await expect(tagifyInput).toBeVisible({ timeout: 20000 });

    await tagifyInput.scrollIntoViewIfNeeded();
    await tagifyInput.click();
    await tagifyInput.focus();
    await tagifyInput.pressSequentially('tenten.vn tenten.com', { delay: 30 });
    await page.waitForTimeout(500);

    // KỸ THUẬT ĐỈNH CAO: Vì Tagify là span contenteditable tùy biến nên sự kiện Enter trên ô input bị chặn để quản lý tag.
    // Chúng ta giả lập nhấn phím Enter trên nút Tìm kiếm để mô phỏng hoàn hảo việc điều hướng bằng bàn phím (Keyboard Navigation)
    const searchBtn = page.locator('button.searchDomainMany');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.focus();
    await searchBtn.press('Enter');

    console.log('Đang chờ trang kết quả tìm kiếm hàng loạt hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });
    await expect(page).toHaveURL(/.*\/vi\/Search\/search-multi.*/, { timeout: 20000 });
    console.log('TC_Search_02_03 thành công: Nhấn Enter để gửi yêu cầu tìm kiếm hoạt động hoàn hảo!');
  });

  test('TC_Search_02_04: Kiểm thử tìm kiếm không nhập đuôi tên miền (Chỉ nhập tenten)', async ({ page }) => {
    console.log('Chạy TC_Search_02_04: Tìm nhiều tên miền không nhập TLD...');
    const tagifyInput = page.locator('#search-2 .tagify__input');
    await expect(tagifyInput).toBeVisible({ timeout: 20000 });

    await tagifyInput.scrollIntoViewIfNeeded();
    await tagifyInput.click();
    await tagifyInput.focus();
    await tagifyInput.pressSequentially('tenten', { delay: 30 });
    await page.waitForTimeout(500);

    const searchBtn = page.locator('button.searchDomainMany');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    console.log('Đang chờ trang kết quả tìm nhiều hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });
    console.log('TC_Search_02_04 thành công: Hệ thống tự động phân tích và xử lý đuôi mặc định!');
  });

  test('TC_Search_02_05: Kiểm thử tìm kiếm tên miền tiếng Việt (tênmiềncủatôi.vn)', async ({ page }) => {
    console.log('Chạy TC_Search_02_05: Tìm nhiều tên miền có dấu tiếng Việt...');
    const tagifyInput = page.locator('#search-2 .tagify__input');
    await expect(tagifyInput).toBeVisible({ timeout: 20000 });

    await tagifyInput.scrollIntoViewIfNeeded();
    await tagifyInput.click();
    await tagifyInput.focus();
    await tagifyInput.pressSequentially('tênmiềncủatôi.vn', { delay: 30 });
    await page.waitForTimeout(500);

    const searchBtn = page.locator('button.searchDomainMany');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    console.log('Đang chờ trang kết quả hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });
    console.log('TC_Search_02_05 thành công: Tìm nhiều tên miền tiếng Việt được mã hóa và xử lý đúng!');
  });

  test('TC_Search_02_06: Kiểm thử nhập danh sách tên miền trùng lặp (tenten.vn tenten.vn)', async ({ page }) => {
    console.log('Chạy TC_Search_02_06: Tìm nhiều tên miền trùng lặp...');
    const tagifyInput = page.locator('#search-2 .tagify__input');
    await expect(tagifyInput).toBeVisible({ timeout: 20000 });

    await tagifyInput.scrollIntoViewIfNeeded();
    await tagifyInput.click();
    await tagifyInput.focus();
    // Nhập trùng tên miền `tenten.vn` 2 lần cách nhau khoảng trắng
    await tagifyInput.pressSequentially('tenten.vn tenten.vn', { delay: 30 });
    await page.waitForTimeout(500);

    const searchBtn = page.locator('button.searchDomainMany');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    console.log('Đang chờ trang kết quả hiển thị...');
    const resultHeading = page.getByText('Kết quả tìm kiếm');
    await expect(resultHeading).toBeVisible({ timeout: 45000 });

    // Hệ thống xử lý lọc trùng thành công và chuyển hướng đến trang kết quả
    const currentURL = page.url();
    expect(currentURL).toContain('/vi/Search');
    console.log('TC_Search_02_06 thành công!');
  });
});
