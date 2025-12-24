# Logo Family TodoApp

## Mô tả

Logo của Family TodoApp được thiết kế với ý tưởng kết hợp:
- **Ngôi nhà**: Đại diện cho gia đình, nơi các thành viên cùng nhau
- **Checklist**: Đại diện cho quản lý công việc, todo list
- **Trái tim**: Thể hiện tình cảm gia đình

## Các phiên bản logo

### 1. `logo.svg` (200x200px)
- Logo đầy đủ, kích thước lớn
- Sử dụng cho trang chủ, header lớn
- Màu nền trắng, phù hợp light mode

### 2. `logo-icon.svg` (64x64px)
- Logo đơn giản, kích thước nhỏ
- Sử dụng cho favicon, icon app
- Tối ưu cho kích thước nhỏ

### 3. `logo-dark.svg` (200x200px)
- Logo cho dark mode
- Màu nền tối, cửa sổ và giấy màu tối
- Sử dụng khi app ở chế độ dark

### 4. `logo-text.svg` (300x80px)
- Logo kèm text "Family TodoApp"
- Sử dụng cho header, navigation bar
- Có thể tách icon và text riêng nếu cần

## Màu sắc

- **Màu chính**: `#FF6633` (Orange)
- **Màu đậm**: `#E55A1A` (Dark Orange)
- **Màu sáng**: `#FF8533` (Light Orange)
- **Màu xanh**: `#4CAF50` (Green - cho checkmark)
- **Màu nền**: `#FFFFFF` (White) hoặc `#1F2937` (Dark Gray cho dark mode)

## Cách sử dụng

### Trong React Component

```jsx
// Logo đầy đủ
<img src="/logo.svg" alt="Family TodoApp" className="w-32 h-32" />

// Logo icon (favicon)
<img src="/logo-icon.svg" alt="Family TodoApp" className="w-8 h-8" />

// Logo với text
<img src="/logo-text.svg" alt="Family TodoApp" className="h-12" />

// Logo dark mode
<img src="/logo-dark.svg" alt="Family TodoApp" className="w-32 h-32 dark:hidden" />
```

### Trong HTML

```html
<!-- Favicon -->
<link rel="icon" type="image/svg+xml" href="/logo-icon.svg" />

<!-- Logo trong header -->
<img src="/logo.svg" alt="Family TodoApp" />
```

### Responsive

Logo có thể scale tùy ý vì là SVG:

```css
.logo {
  width: 200px;
  height: 200px;
}

@media (max-width: 768px) {
  .logo {
    width: 150px;
    height: 150px;
  }
}
```

## Tùy chỉnh

Tất cả logo đều là SVG, có thể chỉnh sửa trực tiếp:
- Thay đổi màu sắc bằng cách sửa giá trị `fill` và `stroke`
- Thay đổi kích thước bằng cách sửa `viewBox` và `width`/`height`
- Thêm/bớt chi tiết trong các thẻ `<g>` và `<path>`

## Export sang các định dạng khác

Nếu cần PNG/JPG, có thể:
1. Mở file SVG trong trình duyệt
2. Right-click → Save as Image
3. Hoặc sử dụng tool online như [CloudConvert](https://cloudconvert.com/svg-to-png)

## License

Logo này thuộc về dự án Family TodoApp và có thể sử dụng tự do trong phạm vi dự án.

