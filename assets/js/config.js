/*
 * ─────────────────────────────────────────────────────────────
 *  NỘI DUNG THIỆP CƯỚI: chỉ cần sửa tệp này
 * ─────────────────────────────────────────────────────────────
 *  Những chỗ ghi "(mẫu)" là dữ liệu giữ chỗ, hãy thay bằng thông tin thật.
 *  Giờ giấc luôn ghi theo giờ Việt Nam, kèm đuôi +07:00.
 *  Khi mọi thứ đã đúng, đổi previewMode thành false để ẩn nhãn "Bản xem trước".
 */
window.WEDDING = {
  previewMode: true,

  couple: {
    groom: {
      name: 'Thanh Hiếu',
      fullName: 'Phùng Thanh Hiếu',
      title: 'Trưởng nam',
    },
    bride: {
      name: 'Lê Linh',
      fullName: 'Lê Thị Linh',
      title: 'Thứ nữ',
    },
  },

  // Ngày giờ chính (dùng cho đếm ngược, lịch tháng và khối ngày trong lời mời).
  // Ngày 20/12/2026 lấy theo tệp kế hoạch cưới, giờ là mẫu.
  mainDate: '2026-12-20T17:30:00+07:00',
  lunarDate: 'Nhằm ngày 12 tháng 11 năm Bính Ngọ',

  // Tên khách lấy từ đường dẫn, ví dụ: index.html?khach=Anh%20Tuấn
  guest: {
    param: 'khach',
    fallback: 'bạn',
  },

  gate: {
    eyebrow: 'Thiệp mời cưới',
    guestLead: 'Thân mời',
    cta: 'Mở thiệp',
  },

  hero: {
    eyebrow: 'Trân trọng kính mời',
    tagline: 'Tụi mình về chung một nhà!',
  },

  invitation: {
    families: {
      groom: {
        label: 'Nhà trai',
        father: 'Ông (tên bố chú rể)',
        mother: 'Bà (tên mẹ chú rể)',
        address: '(Địa chỉ nhà trai)',
      },
      bride: {
        label: 'Nhà gái',
        father: 'Ông (tên bố cô dâu)',
        mother: 'Bà (tên mẹ cô dâu)',
        address: '(Địa chỉ nhà gái)',
      },
    },
    announcement: 'Trân trọng báo tin lễ thành hôn của con chúng tôi',
    // {guest} sẽ được thay bằng tên khách.
    inviteLine: 'Trân trọng kính mời {guest} tới dự bữa tiệc chung vui cùng gia đình chúng tôi',
    timeLead: 'Vào lúc',
    closing: 'Sự hiện diện của {guest} là niềm vinh hạnh của gia đình chúng tôi.',
  },

  countdown: {
    title: 'Đếm ngược tới ngày vui',
    todayMessage: 'Hôm nay là ngày vui của tụi mình rồi! Hẹn gặp bạn nhé ♥',
    pastMessage: 'Tụi mình đã về chung một nhà. Cảm ơn bạn đã chung vui ♥',
  },

  // side: 'bride' (thẻ đỏ) · 'groom' (thẻ xanh than) · 'both' (thẻ cam hổ)
  // mapUrl: dán link Google Maps chính xác. Để trống thì nút "Chỉ đường" sẽ tìm theo địa chỉ.
  events: [
    {
      id: 'vu-quy',
      side: 'bride',
      tag: 'Nhà gái',
      title: 'Lễ Vu Quy',
      start: '2026-12-20T08:00:00+07:00',
      end: '2026-12-20T09:30:00+07:00',
      venue: 'Tư gia nhà gái',
      address: '(Địa chỉ nhà gái, mẫu)',
      mapUrl: '',
    },
    {
      id: 'thanh-hon',
      side: 'groom',
      tag: 'Nhà trai',
      title: 'Lễ Thành Hôn',
      start: '2026-12-20T10:30:00+07:00',
      end: '2026-12-20T12:00:00+07:00',
      venue: 'Tư gia nhà trai',
      address: '(Địa chỉ nhà trai, mẫu)',
      mapUrl: '',
    },
    {
      id: 'tiec-cuoi',
      side: 'both',
      tag: 'Hai họ',
      title: 'Tiệc Cưới',
      start: '2026-12-20T17:30:00+07:00',
      end: '2026-12-20T21:00:00+07:00',
      timeNote: 'Đón khách 17:30 · Khai tiệc 18:30',
      venue: '(Tên nhà hàng tiệc cưới, mẫu)',
      address: '(Địa chỉ nhà hàng, mẫu)',
      mapUrl: '',
    },
  ],

  // Ảnh cưới: đặt ảnh vào thư mục assets/photos/ rồi liệt kê ở đây.
  // Ví dụ: { src: 'assets/photos/anh-1.jpg', caption: 'Ngày nắng đẹp' }
  // Để mảng trống thì mục Album tự ẩn (ở chế độ xem trước sẽ hiện khung giữ chỗ).
  photos: [],

  rsvp: {
    title: 'Bạn sẽ đến chung vui chứ?',
    intro: 'Bạn nhắn giúp tụi mình một tiếng để tụi mình chuẩn bị chu đáo nhất nhé.',
    deadline: '2026-12-10',
    maxGuests: 5,
    // Nơi nhận xác nhận và lời chúc (ví dụ link Google Apps Script, xem README).
    // Để trống: biểu mẫu chỉ chạy thử ở chế độ xem trước, không gửi đi đâu.
    endpoint: '',
  },

  wishes: {
    title: 'Sổ lời chúc',
    // Lời chúc mẫu, chỉ hiện ở chế độ xem trước.
    samples: [
      { name: 'Nhóm bạn đại học', message: 'Cuối cùng cũng tới ngày này rồi! Chúc hai bạn trăm năm hạnh phúc, cả nhóm sẽ có mặt đông đủ nha.' },
      { name: 'Chị Thu Trang', message: 'Chúc hai em mãi thương nhau như những ngày đầu, sớm có hổ con nhé!' },
      { name: 'Gia đình chú Bảy', message: 'Chúc hai cháu bách niên giai lão, luôn yêu thương và nhường nhịn nhau.' },
    ],
  },

  gift: {
    enabled: true,
    title: 'Hộp mừng cưới',
    intro: 'Sự hiện diện của bạn là món quà quý nhất với tụi mình. Nếu bạn ở xa và muốn gửi lời chúc phúc, tụi mình xin nhận bằng tất cả sự trân trọng.',
    // qr: đường dẫn ảnh mã QR, ví dụ 'assets/photos/qr-chu-re.png'. Thẻ nào chưa có số tài khoản sẽ tự ẩn khi tắt xem trước.
    accounts: [
      { side: 'groom', label: 'Mừng cưới chú rể', holder: '', bank: '', number: '', qr: '' },
      { side: 'bride', label: 'Mừng cưới cô dâu', holder: '', bank: '', number: '', qr: '' },
    ],
  },

  music: {
    enabled: true,
    // Tệp nhạc riêng, ví dụ 'assets/music/bai-hat.mp3'. Để trống thì dùng giai điệu hộp nhạc Canon in D tạo sẵn trong trình duyệt.
    src: '',
    startOnOpen: true,
    volume: 0.55,
  },

  thanks: {
    script: 'Cảm ơn bạn',
    message: 'Cảm ơn bạn đã dành thời gian đọc tấm thiệp nhỏ này. Hẹn gặp bạn trong ngày vui của tụi mình!',
    // Ghi tên người bạn đã vẽ tranh để gửi lời cảm ơn, ví dụ 'Minh Anh'. Để trống thì ghi chung chung.
    artist: '',
  },
};
