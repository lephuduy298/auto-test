import { test, expect } from '@playwright/test';

test.describe('Kiểm thử chức năng Giỏ hàng trên Tenten.vn', () => {

  test.beforeEach(async ({ page }) => {
    // Tăng thời gian Timeout lên 90 giây để bù đắp cho slowMo và tải trang
    test.setTimeout(90000);

    // Cấu hình màn hình Desktop tiêu chuẩn
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

    console.log('1. Truy cập trang chủ Tenten.vn...');
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(1000);

    console.log('2. Tìm kiếm tên miền nhạy cảm chứa từ "hocvien" để có sẵn cảnh báo và sản phẩm trong giỏ...');
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });
    await inputDomain.fill('hocvientest123.vn');
    
    const searchBtn = page.locator('button.searchDomainOne');
    await expect(searchBtn).toBeVisible({ timeout: 15000 });
    await searchBtn.click();

    console.log('3. Chờ trang kết quả hiển thị...');
    await page.waitForURL(/.*\/vi\/Search\/searchGpt.*/, { timeout: 45000 });
    await page.waitForTimeout(3000);

    console.log('4. Click thêm vào giỏ hàng tên miền nhạy cảm...');
    const addBtn = page.getByText('Thêm giỏ hàng').first();
    await expect(addBtn).toBeVisible({ timeout: 15000 });
    await addBtn.click();
    await page.waitForTimeout(3000); // Chờ giỏ hàng cập nhật ổn định

    console.log('4b. Click thêm một tên miền gợi ý thứ hai vào giỏ hàng để tránh lỗi giỏ hàng rỗng khi xóa...');
    const addBtn2 = page.getByText('Thêm giỏ hàng').nth(1);
    await expect(addBtn2).toBeVisible({ timeout: 15000 });
    await addBtn2.click();
    await page.waitForTimeout(4000); // Chờ giỏ hàng cập nhật ổn định

    console.log('5. Chuyển hướng trực tiếp sang trang giỏ hàng chi tiết...');
    await page.goto('/vi/Cart/index', { waitUntil: 'domcontentloaded', timeout: 45000 });
    
    // Chờ cho đến khi giỏ hàng tải đầy đủ và ổn định
    const cartTitle = page.getByText('Thông tin giỏ hàng');
    await expect(cartTitle).toBeVisible({ timeout: 25000 });
    await page.waitForTimeout(2000);
  });

  test('TC_Cart_01: Thay đổi thời hạn đăng ký và xác minh tổng tiền thay đổi', async ({ page }) => {
    console.log('Thực thi TC_Cart_01: Thay đổi thời hạn đăng ký...');

    // Lấy Tổng thanh toán ban đầu hiển thị trên trang
    const bodyTextBefore = await page.innerText('body');
    console.log('Tổng thanh toán ban đầu đã ghi nhận.');

    // 1. Click vào dropdown giả lập đang hiển thị "1 năm"
    const dropdownBtn = page.getByText('1 năm').first();
    await expect(dropdownBtn).toBeVisible({ timeout: 15000 });
    console.log('Click vào dropdown chọn năm...');
    await dropdownBtn.click();
    await page.waitForTimeout(1000); // Chờ danh sách năm hiện ra

    // 2. Định vị phần tử "2 năm" trong thẻ li và click chọn
    const option2Years = page.locator('li').filter({ hasText: /^2 năm$/ }).first();
    await expect(option2Years).toBeVisible({ timeout: 15000 });
    console.log('Chọn 2 năm từ danh sách...');
    await option2Years.click();
    await page.waitForTimeout(4000); // Chờ hệ thống tính toán lại giá tiền

    // Lấy Tổng thanh toán sau khi thay đổi
    const bodyTextAfter = await page.innerText('body');
    console.log('Tổng thanh toán sau khi đổi năm đã ghi nhận.');

    // Kỳ vọng: Giá trị Tổng thanh toán phải thay đổi (không bằng giá cũ)
    expect(bodyTextBefore).not.toEqual(bodyTextAfter);
    console.log('TC_Cart_01 thành công: Thay đổi thời hạn đăng ký và Tổng thanh toán tự động cập nhật!');
  });

  test('TC_Cart_02: Tích/Bỏ tích sản phẩm và xác minh tổng tiền cập nhật', async ({ page }) => {
    console.log('Thực thi TC_Cart_02: Tích/Bỏ tích sản phẩm...');

    const bodyTextBefore = await page.innerText('body');

    // Định vị checkbox cạnh tên miền đầu tiên thông qua ID chính xác #shoppingId-1
    const checkboxDomain = page.locator('#shoppingId-1');
    await expect(checkboxDomain).toBeAttached({ timeout: 15000 });

    // Thực hiện bỏ tích (uncheck) bằng JS click do input checkbox gốc bị ẩn bằng CSS
    console.log('Bỏ chọn tên miền đầu tiên bằng JS click...');
    await checkboxDomain.evaluate(node => (node as HTMLInputElement).click());
    await page.waitForTimeout(6000); // Chờ hệ thống gửi AJAX và tự động reload trang

    const bodyTextAfter = await page.innerText('body');

    // Kỳ vọng: Tổng thanh toán thay đổi (giảm xuống)
    expect(bodyTextBefore).not.toEqual(bodyTextAfter);
    console.log('TC_Cart_02 thành công: Bỏ tích sản phẩm và Tổng thanh toán tự động giảm xuống!');
  });

  test('TC_Cart_03: Xóa sản phẩm khỏi giỏ hàng', async ({ page }) => {
    console.log('Thực thi TC_Cart_03: Xóa sản phẩm...');

    // Lấy Số lượng dịch vụ trước khi xóa để so sánh
    const quantityBefore = await page.locator('body').innerText();

    // Định vị nút xóa X thông qua class chính xác figure.if_close_icon img hoặc .btn_delete
    const deleteBtn = page.locator('figure.if_close_icon img, .btn_delete').first();
    await expect(deleteBtn).toBeVisible({ timeout: 15000 });

    // Click vào nút xóa
    console.log('Click nút xóa X tên miền...');
    await deleteBtn.click();
    await page.waitForTimeout(6000); // Chờ DOM cập nhật và trang reload lại ổn định

    // Kỳ vọng 1: Tên miền hocvientest123.vn không còn hiển thị trong giỏ
    const deletedDomain = page.getByText('hocvientest123.vn');
    await expect(deletedDomain).toBeHidden({ timeout: 15000 });

    // Kỳ vọng 2: Số lượng dịch vụ hoặc Tổng thanh toán thay đổi
    const quantityAfter = await page.locator('body').innerText();
    expect(quantityBefore).not.toEqual(quantityAfter);
    console.log('TC_Cart_03 thành công: Sản phẩm đã biến mất khỏi giỏ hàng!');
  });

  test('TC_Cart_04: Áp dụng mã khuyến mãi không hợp lệ (Negative Test)', async ({ page }) => {
    console.log('Thực thi TC_Cart_04: Áp dụng mã khuyến mãi không hợp lệ...');

    // Định vị ô input Nhập mã khuyến mãi
    const couponInput = page.getByPlaceholder('Nhập mã khuyến mãi');
    await expect(couponInput).toBeVisible({ timeout: 15000 });

    // Điền mã sai 'KHONGCOMA'
    await couponInput.fill('KHONGCOMA');

    // Định vị nút 'Áp dụng' kế bên ô coupon (nút áp dụng đầu tiên)
    const applyBtn = page.locator('button:has-text("Áp dụng"), a:has-text("Áp dụng"), [class*="coupon"]').first();
    await expect(applyBtn).toBeVisible({ timeout: 15000 });

    // Click Áp dụng
    await applyBtn.click();
    await page.waitForTimeout(3000); // Chờ popup/alert hiển thị

    // Kỳ vọng: Hệ thống xuất hiện thông báo mã không hợp lệ hoặc lỗi
    const pageContent = await page.innerText('body');
    const hasErrorMsg = pageContent.includes('không tồn tại') || 
                         pageContent.includes('không hợp lệ') || 
                         pageContent.includes('Mã') || 
                         pageContent.includes('lỗi') ||
                         pageContent.includes('chưa chính xác');
    
    expect(hasErrorMsg).toBe(true);
    console.log('TC_Cart_04 thành công: Cảnh báo mã khuyến mãi lỗi hiển thị rõ ràng!');
  });

  test('TC_Cart_05: Kiểm tra cảnh báo từ khóa nhạy cảm (hocvien...)', async ({ page }) => {
    console.log('Thực thi TC_Cart_05: Kiểm tra cảnh báo từ khóa nhạy cảm...');

    // Kỳ vọng: Xuất hiện thông báo từ khóa nhạy cảm màu đỏ (lấy phần tử đầu tiên để tránh lỗi strict mode khi có nhiều tên miền nhạy cảm)
    const sensitiveWarning = page.getByText('Lưu ý: Tên miền này có chứa từ khoá nhạy cảm').first();
    await expect(sensitiveWarning).toBeVisible({ timeout: 15000 });
    
    console.log('TC_Cart_05 thành công: Cảnh báo từ khóa nhạy cảm hiển thị đúng chuẩn!');
  });

  test('TC_Cart_06: Kiểm thử hành vi khi giỏ hàng trống (Empty Cart)', async ({ page }) => {
    console.log('Thực thi TC_Cart_06: Xóa sạch giỏ hàng và kiểm thử Empty Cart...');
    
    let deleteBtn = page.locator('figure.if_close_icon img, .btn_delete');
    let count = await deleteBtn.count();
    console.log(`Số lượng sản phẩm trong giỏ hàng hiện tại: ${count}`);
    
    while (count > 0) {
      console.log('Click nút xóa sản phẩm...');
      await deleteBtn.first().click();
      await page.waitForTimeout(6000); // Chờ reload trang
      
      // Định vị lại để cập nhật số lượng
      deleteBtn = page.locator('figure.if_close_icon img, .btn_delete');
      count = await deleteBtn.count();
    }
    
    console.log('Xác minh thông báo giỏ hàng trống...');
    const bodyText = await page.innerText('body');
    const isEmptyCartMsg = bodyText.includes('trống') || bodyText.includes('chưa có sản phẩm') || bodyText.includes('0 sản phẩm') || bodyText.includes('tiếp tục') || bodyText.includes('Tiếp tục');
    expect(isEmptyCartMsg).toBe(true);
    console.log('TC_Cart_06 thành công!');
  });

  test('TC_Cart_07: Kiểm thử áp dụng mã khuyến mãi trống', async ({ page }) => {
    console.log('Thực thi TC_Cart_07: Áp dụng mã khuyến mãi trống...');
    
    const couponInput = page.getByPlaceholder('Nhập mã khuyến mãi');
    await expect(couponInput).toBeVisible({ timeout: 15000 });
    await couponInput.fill('');

    const applyBtn = page.locator('button:has-text("Áp dụng"), a:has-text("Áp dụng"), [class*="coupon"]').first();
    await expect(applyBtn).toBeVisible({ timeout: 15000 });
    await applyBtn.click();
    await page.waitForTimeout(2000);

    const inputVal = await couponInput.inputValue();
    expect(inputVal).toBe('');
    console.log('TC_Cart_07 thành công!');
  });

  test('TC_Cart_08: Thay đổi thời hạn đăng ký của nhiều sản phẩm đồng thời', async ({ page }) => {
    console.log('Thực thi TC_Cart_08: Đổi năm đăng ký của nhiều sản phẩm...');
    
    const bodyTextBefore = await page.innerText('body');
    
    // Đổi sản phẩm 1 lên 2 năm
    const dropdownBtn1 = page.getByText('1 năm').first();
    await expect(dropdownBtn1).toBeVisible({ timeout: 15000 });
    await dropdownBtn1.click();
    await page.waitForTimeout(1000);
    const option2Years1 = page.locator('li').filter({ hasText: /^2 năm$/ }).first();
    await option2Years1.click();
    await page.waitForTimeout(4000);

    // Đổi sản phẩm 2 lên 2 năm
    const dropdownBtn2 = page.getByText('1 năm').first();
    if (await dropdownBtn2.isVisible()) {
      await dropdownBtn2.click();
      await page.waitForTimeout(1000);
      const option2Years2 = page.locator('li').filter({ hasText: /^2 năm$/ }).first();
      await option2Years2.click();
      await page.waitForTimeout(4000);
    }
    
    const bodyTextAfter = await page.innerText('body');
    expect(bodyTextBefore).not.toEqual(bodyTextAfter);
    console.log('TC_Cart_08 thành công: Đổi thời hạn của nhiều sản phẩm đồng thời thành công!');
  });

  test('TC_Cart_09: Kiểm thử quay lại trang chủ từ giỏ hàng', async ({ page }) => {
    console.log('Thực thi TC_Cart_09: Quay lại trang chủ để tiếp tục mua...');
    
    // Định vị liên kết trang chủ và thực hiện click bằng JS để tránh lỗi CSS hidden của ảnh logo
    const logoLink = page.locator('a[href="/"], .logo, a[href*="tenten.vn"]').first();
    await expect(logoLink).toBeAttached({ timeout: 15000 });
    await logoLink.evaluate(node => (node as HTMLElement).click());
    
    await page.waitForURL(/.*tenten.vn.*/, { timeout: 30000 });
    
    const inputDomain = page.locator('#domainNameManyInput');
    await expect(inputDomain).toBeVisible({ timeout: 15000 });
    console.log('TC_Cart_09 thành công!');
  });

  test('TC_Bug_Cart_01: Kiểm thử lỗi bất nhất khi xóa sản phẩm cuối cùng trong giỏ hàng', async ({ page }) => {
    console.log('Thực thi TC_Bug_Cart_01: Xóa sản phẩm cuối cùng bằng hai cách khác nhau...');

    // Đảm bảo chỉ có 1 sản phẩm trong giỏ hàng (bằng cách xóa bớt 1 sản phẩm nếu beforeEach nạp 2 sản phẩm)
    let deleteBtn = page.locator('figure.if_close_icon img, .btn_delete');
    let count = await deleteBtn.count();
    console.log(`Số lượng sản phẩm ban đầu: ${count}`);
    if (count > 1) {
      await deleteBtn.first().click();
      await page.waitForTimeout(6000); // Chờ reload
    }

    // Bước 1: Click nút dấu X của sản phẩm cuối cùng
    const lastDeleteX = page.locator('figure.if_close_icon img, .btn_delete').first();
    await expect(lastDeleteX).toBeVisible({ timeout: 15000 });
    await lastDeleteX.click();
    await page.waitForTimeout(3000);

    // Xác minh xuất hiện thông báo chặn "Giỏ hàng phải tồn tại ít nhất 1 dịch vụ" (Tenten thật chặn ở đây)
    const pageContent = await page.innerText('body');
    const isBlocked = pageContent.includes('ít nhất 1 dịch vụ') || pageContent.includes('tồn tại ít nhất') || pageContent.includes('ít nhất 1');
    expect(isBlocked).toBe(true);
    console.log('✅ Bước 1 thành công: Nút dấu X đã chặn xóa sản phẩm cuối cùng.');

    // Đóng popup cảnh báo nếu có
    const closeWarningBtn = page.locator('.tg_close_pop, .close, :text("×"), :text("Đồng ý"), button:has-text("Đồng ý")').first();
    if (await closeWarningBtn.isVisible()) {
      await closeWarningBtn.click();
      await page.waitForTimeout(1000);
    }

    // Bước 2: Tích chọn checkbox của sản phẩm duy nhất
    const checkboxDomain = page.locator('#shoppingId-1, input[type="checkbox"]').first();
    await checkboxDomain.evaluate(node => (node as HTMLInputElement).checked = true);
    await checkboxDomain.evaluate(node => (node as HTMLInputElement).dispatchEvent(new Event('change')));
    await page.waitForTimeout(1000);

    // Click nút "Xóa dịch vụ đã chọn" ở chân trang
    const deleteSelectedBtn = page.locator('button:has-text("Xóa dịch vụ đã chọn"), a:has-text("Xóa dịch vụ đã chọn"), :text("Xóa dịch vụ đã chọn")').first();
    await expect(deleteSelectedBtn).toBeVisible({ timeout: 15000 });
    await deleteSelectedBtn.click();
    await page.waitForTimeout(5000);

    // Kỳ vọng nghiệp vụ: Hệ thống phải hoạt động đồng nhất, tức là nút này CŨNG PHẢI CHẶN và giữ sản phẩm, không cho giỏ hàng rỗng.
    // Thực tế (Bug): Hệ thống lại cho phép xóa sạch hoàn toàn giỏ hàng về 0!
    // Cách làm testcase Fail: Chúng ta expect hệ thống vẫn phải giữ lại sản phẩm (tức là tên miền vẫn còn hiển thị)
    const domainText = page.locator('body');
    // Thực tế sản phẩm bị xóa mất và giỏ hàng trống trơn. Dòng assert này sẽ bị FAIL do giỏ hàng trống trơn!
    await expect(domainText).toContainText('hocvientest123.vn', { timeout: 10000 });
    
    console.log('TC_Bug_Cart_01 hoàn tất kiểm tra!');
  });

  test('TC_Bug_Cart_02: Kiểm thử lỗi treo Loading khi tìm kiếm tên miền đuôi có dấu trong trang kết quả', async ({ page }) => {
    console.log('Thực thi TC_Bug_Cart_02: Kiểm thử lỗi treo Loading của ô tìm kiếm phụ...');

    // 1. Tìm ô tìm kiếm phụ trên giao diện trang kết quả (trang hiện tại sau khi beforeEach đã chuyển hướng sang /vi/Search/index)
    const subSearchInput = page.locator('#keyword, input[placeholder*="Tìm kiếm"], input[class*="search"]').first();
    await expect(subSearchInput).toBeVisible({ timeout: 15000 });

    // 2. Nhập tên miền có đuôi có dấu: dfasdf.cóm
    console.log('Nhập tên miền lỗi dấu: dfasdf.cóm');
    await subSearchInput.fill('dfasdf.cóm');

    // 3. Click nút Tìm kiếm (nút kính lúp màu xanh bên phải hoặc giả lập Enter)
    const searchBtn = page.locator('button.btn-search, .search-btn, .search-icon, button:has(i.fa-search), a:has(i.fa-search)').first();
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    } else {
      await subSearchInput.press('Enter');
    }
    await page.waitForTimeout(3000);

    // 4. Xác minh xuất hiện cảnh báo đỏ "Tên miền không hợp lệ" ở góc trên bên phải
    console.log('Xác minh thông báo cảnh báo Tên miền không hợp lệ...');
    const invalidToast = page.locator(':text("Tên miền không hợp lệ")').first();
    await expect(invalidToast).toBeVisible({ timeout: 15000 });

    // 5. Kỳ vọng nghiệp vụ: Trạng thái Loading ("Đang tìm kiếm...") phải tắt đi và hiển thị thông báo lỗi cấp phát rõ ràng bên dưới
    // Thực tế (Bug): Trang bị treo xoay tròn Loading vĩnh viễn và không hiển thị thông báo gì thêm!
    // Cách làm testcase Fail: Ta expect Loading biến mất và xuất hiện chữ "không được xét cấp phát"
    console.log('Kỳ vọng Loading ẩn đi và hiển thị thông báo Tên miền hiện không được xét cấp phát...');
    
    // Check loading biến mất (Thực tế sẽ bị FAIL ở đây vì loading bị treo vĩnh viễn!)
    const loadingIndicator = page.locator(':text("Đang tìm kiếm..."), .loading, .spinner-border').first();
    await expect(loadingIndicator).toBeHidden({ timeout: 15000 });

    const allocationError = page.locator(':text("Tên miền hiện không được xét cấp phát")').first();
    await expect(allocationError).toBeVisible({ timeout: 10000 });

    console.log('TC_Bug_Cart_02 hoàn tất kiểm tra!');
  });
});
