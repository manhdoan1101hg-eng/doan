import { RobotPartInfo } from '../types/jetbot';

export const ROBOT_PARTS: Record<string, RobotPartInfo> = {
  rplidar_a1: {
    id: 'rplidar_a1',
    name: 'Cảm biến 2D LiDAR 360° RPLiDAR A1M8',
    englishName: 'Slamtec RPLiDAR A1M8 360° Laser Scanner',
    category: 'Cảm biến',
    description:
      'Cảm biến quét laser 2D 360 độ sử dụng công nghệ đo đạc quang học tam giác (Laser Triangulation). Được gắn trên đỉnh cao nhất của JetBot để quét bản đồ môi trường thời gian thực, lập bản đồ SLAM (Gmapping/Cartographer) và tự động tránh vật cản đa hướng.',
    specs: [
      { label: 'Tần số quét (Scan Rate)', value: '10 Hz (600 RPM)' },
      { label: 'Tốc độ lấy mẫu', value: '8000 điểm/giây (8K sample rate)' },
      { label: 'Khoảng cách đo', value: '0.15m – 12.0m' },
      { label: 'Độ phân giải góc', value: '≤ 1° tại 10Hz' },
      { label: 'Bước sóng laser', value: '785 nm (Class 1 Eye Safe)' },
      { label: 'Giao tiếp dữ liệu', value: 'UART Serial / USB qua chip CP2102' },
      { label: 'Điện áp định mức', value: '5.0V DC (Dòng khởi động 600mA)' },
    ],
    rosTopic: '/scan',
    rosMessageType: 'sensor_msgs/LaserScan',
    realPhotoEvidence:
      'Nhìn thấy rõ ở Ảnh 3 (chụp từ trên xuống) và Ảnh 2: Tháp quay tròn đen có nắp dập nổi chữ "RPLIDAR", 2 khe thấu kính phát/thu tia laser đỏ, và đế hình giọt nước.',
    photoIndex: 2,
    highlightColor: '#ef4444',
    keyFeatures: [
      'Quay liên tục 360 độ với động cơ kéo riêng biệt',
      'Định vị và xây dựng bản đồ đồng thời (2D SLAM)',
      'Hỗ trợ gói ROS rplidar_ros chuẩn quốc tế',
      'Tích hợp thuật toán lọc nhiễu khoảng cách',
    ],
  },

  lidar_belt_motor: {
    id: 'lidar_belt_motor',
    name: 'Động cơ kéo & Dây curoa cao su RPLiDAR',
    englishName: 'RPLiDAR DC Drive Motor & Rubber Timing Belt',
    category: 'Truyền động & Cơ khí',
    description:
      'Cụm truyền động phụ độc lập của cảm biến RPLiDAR A1, gồm một motor DC vỏ kim loại mạ bạc, puly đồng thau và dây đai cao su đen truyền lực quay lên tháp laser. Cơ cấu dây đai hở giúp bảo vệ động cơ chống kẹt khi có va chạm.',
    specs: [
      { label: 'Loại động cơ', value: 'DC Brushed Motor vỏ nhôm mạ bạc' },
      { label: 'Cơ cấu truyền động', value: 'Dây curoa cao su đàn hồi (O-ring timing belt)' },
      { label: 'Tỉ số truyền puly', value: 'Khoảng 1:3.2' },
      { label: 'Điều khiển tốc độ', value: 'Tín hiệu PWM điều tốc từ bo mạch radar' },
      { label: 'Vị trí lắp đặt', value: 'Phần đuôi thon của đế giọt nước RPLiDAR' },
    ],
    rosTopic: '/rplidarNode/motor_pwm',
    rosMessageType: 'std_msgs/UInt16',
    realPhotoEvidence:
      'Quan sát đặc biệt rõ ở Ảnh 3 (từ trên xuống) và Ảnh 4, 5: Thấy rõ vỏ motor kim loại màu bạc hình trụ và vòng dây curoa cao su màu đen nối sang trục quay tháp radar.',
    photoIndex: 2,
    highlightColor: '#f97316',
    keyFeatures: [
      'Vỏ kim loại chống nhiễu từ trường cho máy tính',
      'Dây curoa hấp thụ rung động, bảo vệ thấu kính quang học',
      'Dễ tháo lắp và bảo dưỡng trong thực tế',
    ],
  },

  jetson_nano: {
    id: 'jetson_nano',
    name: 'Máy tính nhúng NVIDIA Jetson Nano 4GB (B01)',
    englishName: 'NVIDIA Jetson Nano Developer Kit B01 (4GB LPDDR4)',
    category: 'Xử lý & Tính toán',
    description:
      'Bộ não trung tâm điều khiển toàn bộ robot JetBot. Được trang bị kiến trúc NVIDIA Maxwell 128 lõi CUDA, cho phép chạy trực tiếp các mạng nơ-ron học sâu (Deep Neural Networks) như SSD-MobileNet, YOLOv8-nano, ResNet-18 cho bài toán bám làn đường, nhận diện biển báo và tự hành.',
    specs: [
      { label: 'GPU', value: 'NVIDIA Maxwell™ 128 nhân CUDA (0.5 TFLOPS FP16)' },
      { label: 'CPU', value: 'Quad-core ARM® Cortex®-A57 MPCore @ 1.43 GHz' },
      { label: 'RAM', value: '4 GB 64-bit LPDDR4 25.6 GB/s' },
      { label: 'Lưu trữ hệ điều hành', value: 'MicroSD Card 64GB UHS-I (JetPack 4.6.1 / Ubuntu 18.04 LTS)' },
      { label: 'Cổng giao tiếp I/O', value: '4x USB 3.0 Type-A, Gigabit Ethernet RJ45, HDMI 2.0, DP, Micro-USB' },
      { label: 'Header phần cứng', value: '40-pin GPIO (I2C, SPI, UART, PWM), 2x MIPI-CSI Camera' },
      { label: 'Công suất tiêu thụ', value: '5W (5V/2A) hoặc 10W (5V/4A MAXN mode)' },
    ],
    rosTopic: '/jetbot/system_status',
    rosMessageType: 'diagnostic_msgs/DiagnosticArray',
    realPhotoEvidence:
      'Quan sát rõ ở Ảnh 1, 4 và 5: Tầng mạch màu đen với 4 cổng USB 3.0 xếp chồng có lưỡi xanh dương, cổng mạng RJ45 kim loại, cổng HDMI và khe cắm thẻ nhớ ở mặt sau.',
    photoIndex: 3,
    highlightColor: '#10b981',
    keyFeatures: [
      'Tăng tốc tính toán AI trên phần cứng CUDA và TensorRT',
      'Chạy đồng thời ROS Melodic/Noetic Master Node',
      'Xử lý hình ảnh trực tiếp từ camera MIPI CSI với độ trễ cực thấp',
    ],
  },

  cooling_fan: {
    id: 'cooling_fan',
    name: 'Quạt tản nhiệt 40mm & Khối Heatsink rãnh nhôm',
    englishName: 'Active 40x40mm 5V Cooling Fan & Aluminum Finned Heatsink',
    category: 'Xử lý & Tính toán',
    description:
      'Hệ thống giải nhiệt chủ động cho chip NVIDIA Tegra SoC. Khối heatsink bằng nhôm phay rãnh màu đen anodized kết hợp quạt 40x40x10mm chạy liên tục, giúp Jetson Nano luôn duy trì nhiệt độ dưới 55°C ngay cả khi suy luận AI liên tục.',
    specs: [
      { label: 'Kích thước quạt', value: '40 x 40 x 10 mm' },
      { label: 'Điện áp hoạt động', value: '5V DC (Đấu dây đỏ/đen vào Header quạt 4-pin)' },
      { label: 'Số cánh quạt', value: '7 cánh khí động học uốn cong' },
      { label: 'Cố định cơ khí', value: '4 ốc vít kim loại màu bạc bắt tại 4 góc' },
      { label: 'Vật liệu heatsink', value: 'Hợp kim nhôm đùn phay rãnh anodized đen mờ' },
    ],
    rosTopic: '/jetbot/thermal/soc',
    rosMessageType: 'sensor_msgs/Temperature',
    realPhotoEvidence:
      'Ảnh 1, 2 và 4: Quạt vuông màu đen gắn 4 ốc bạc trên đỉnh phiến tản nhiệt heatsink, có 2 sợi dây điện xoắn đỏ/đen chạy xuống giắc cắm trên bo mạch.',
    photoIndex: 0,
    highlightColor: '#38bdf8',
    keyFeatures: [
      'Làm mát đối lưu cưỡng bức tối đa hóa xung nhịp CPU/GPU',
      'Ngăn chặn hiện tượng tụt xung (Thermal Throttling) khi chạy ROS',
    ],
  },

  csi_camera: {
    id: 'csi_camera',
    name: 'Camera CSI Sony IMX219 & Giá đỡ nhôm Anodized xanh',
    englishName: 'Sony IMX219 8MP CSI Camera & Custom Green Aluminum Bracket',
    category: 'Cảm biến',
    description:
      'Mắt thần thị giác máy tính của JetBot. Sử dụng cảm biến Sony IMX219 8 Megapixel góc siêu rộng (FOV 160° Fish-eye), kết nối trực tiếp vào giao thức phần cứng MIPI-CSI2 của Jetson Nano. Cụm camera được gắn trên khung nhôm chữ L anodized màu xanh lá cây đồng bộ với tấm đế, có núm xoay khía bạc để điều chỉnh góc chúc/ngẩng thủ công.',
    specs: [
      { label: 'Cảm biến ảnh', value: 'Sony Exmor R IMX219 CMOS 1/4 inch' },
      { label: 'Độ phân giải', value: '3280 x 2464 (8 Megapixel), quay 720p@120fps / 1080p@30fps' },
      { label: 'Góc nhìn (FOV)', value: '160° đường chéo (Ống kính Fish-eye góc rộng)' },
      { label: 'Khẩu độ (Aperture)', value: 'F/2.35' },
      { label: 'Giá đỡ cơ khí', value: 'Nhôm tấm Anodized xanh lá cây ánh kim, ốc khía knurled bạc' },
      { label: 'Góc ngẩng điều chỉnh', value: 'Từ -20° (chúc xuống đường) đến +45°' },
    ],
    rosTopic: '/jetbot/camera/raw',
    rosMessageType: 'sensor_msgs/Image',
    realPhotoEvidence:
      'Nhìn rõ tuyệt đối ở Ảnh 2: Khung kim loại màu xanh lá cây bắt 2 ốc bạc vào tấm đế, khớp xoay có ốc siết khía bạc bên hông, ống kính mắt cá hình trụ đen mờ.',
    photoIndex: 1,
    highlightColor: '#22c55e',
    keyFeatures: [
      'Giao tiếp phần cứng phần cứng MIPI-CSI không tốn tài nguyên USB',
      'Được tăng tốc giải mã bằng NVIDIA GStreamer và NVMM',
      'Hỗ trợ theo dõi làn đường, bám theo vật thể, phát hiện người đi bộ',
    ],
  },

  camera_ribbon: {
    id: 'camera_ribbon',
    name: 'Cáp dẹp FFC CSI 15-pin uốn vòm cong cao',
    englishName: '15-Pin Flexible Flat Cable (FFC) with AWM Markings',
    category: 'Cảm biến',
    description:
      'Dây cáp bẹ dẹp dẻo (FFC) màu trắng 15 chân kết nối tín hiệu tốc độ cao chuẩn MIPI CSI-2 từ cụm camera phía trước vòng ngược lên trên và cắm vào đầu nối CSI trên bo mạch Jetson Nano. Cáp có đoạn đầu bọc gia cường màu xanh dương và in chìm các thông số kỹ thuật tiêu chuẩn.',
    specs: [
      { label: 'Số chân tín hiệu', value: '15 chân (Pitch 1.0mm)' },
      { label: 'Tiêu chuẩn dây dẫn', value: 'AWM 20706 105C 60V VW-1' },
      { label: 'Chiều dài', value: 'Khoảng 15 cm, uốn thành vòm parabol tự nhiên' },
      { label: 'Đầu gia cường', value: 'Tấm nhựa polyimide màu xanh dương ở hai đầu cắm' },
    ],
    rosTopic: '/jetbot/camera/camera_info',
    rosMessageType: 'sensor_msgs/CameraInfo',
    realPhotoEvidence:
      'Xuất hiện rõ nét ở Ảnh 2 và Ảnh 4: Dải cáp bẹ dẹp màu trắng uốn vòm cao vút qua khung camera, trên thân cáp in rõ các ký tự xanh lá cây "AWM 20706 105C 60V VW-1".',
    photoIndex: 1,
    highlightColor: '#06b6d4',
    keyFeatures: [
      'Độ mềm dẻo cao cho phép camera gập ngẩng linh hoạt',
      'Tốc độ truyền dữ liệu vi sai lên đến hàng Gbps cho video HD không giật',
    ],
  },

  blue_wheels: {
    id: 'blue_wheels',
    name: 'Bánh xe thể thao 12 nan mạ Crom xanh & Lốp gai',
    englishName: '12-Spoke Chrome Royal Blue Wheels & High-Grip Rubber Tires',
    category: 'Truyền động & Cơ khí',
    description:
      'Cặp bánh xe chủ động hai bên tạo nên diện mạo thể thao đặc trưng nhất của JetBot. Vành bánh xe mạ crom bóng màu xanh hoàng gia (Electric / Royal Blue) với 12 nan hoa hướng tâm, lắp trên lốp cao su gai nổi all-terrain bám đường vượt trội.',
    specs: [
      { label: 'Đường kính ngoài', value: '65 mm (cả lốp cao su)' },
      { label: 'Bề rộng lốp', value: '26 mm' },
      { label: 'Vành đĩa mâm', value: 'Nhựa đúc mạ điện chân không Chrome Royal Blue 12 chấu' },
      { label: 'Bu-lông trục trung tâm', value: 'Ốc ren M3 kim loại mạ bạc chống trượt' },
      { label: 'Khớp nối trục motor', value: 'Khớp nối đồng thau lục giác cố định bằng ốc chí' },
      { label: 'Hệ số ma sát lốp (μ)', value: '0.85 trên sàn gạch, 0.95 trên thảm' },
    ],
    rosTopic: '/cmd_vel & /jetbot/wheel_ticks',
    rosMessageType: 'geometry_msgs/Twist',
    realPhotoEvidence:
      'Chi tiết nổi bật nhất tại Ảnh 1 và Ảnh 4: Mâm bánh xe ánh kim màu xanh dương cực sáng với 12 nan turbine tỏa tròn, lốp cao su đen có vân gai gờ vuông.',
    photoIndex: 0,
    highlightColor: '#2563eb',
    keyFeatures: [
      'Khả năng truyền lực vi sai chính xác tuyệt đối',
      'Độ bám cao hạn chế tối đa sai số trượt (wheel slip odometry)',
      'Thẩm mỹ cao cấp như xe thể thao đua thu nhỏ',
    ],
  },

  chassis_base: {
    id: 'chassis_base',
    name: 'Khung gầm nhôm tròn Anodized xanh lá cây',
    englishName: 'Circular Emerald Green Anodized Aluminum Chassis Baseplate',
    category: 'Khung gầm & Cấu trúc',
    description:
      'Khung gầm chính chịu lực toàn bộ robot, được cắt CNC chính xác từ nhôm tấm hàng không dày 2.5mm, sau đó nhuộm Anodized bề mặt màu xanh lá cây ánh kim (Emerald Green). Đế có dạng đĩa tròn bo cung và được khoét 2 hốc chữ nhật thụt vào để chứa vừa vặn 2 bánh xe chủ động.',
    specs: [
      { label: 'Đường kính ngoài', value: '224 mm' },
      { label: 'Độ dày tấm nhôm', value: '2.5 mm mài vát cạnh CNC' },
      { label: 'Xử lý bề mặt', value: 'Hard Anodized Emerald Green ánh kim chống xước' },
      { label: 'Hốc lõm bánh xe', value: '2 hốc chữ nhật kích thước 38 x 62 mm đối xứng' },
      { label: 'Lỗ liên kết', value: 'Khoan ren chuẩn M3 bắt cột trụ đồng và bracket camera' },
    ],
    rosTopic: '/tf [base_link -> base_footprint]',
    rosMessageType: 'tf2_msgs/TFMessage',
    realPhotoEvidence:
      'Thể hiện ở toàn bộ 5 bức ảnh, đặc biệt rõ ở Ảnh 3 (chụp từ trên): Đĩa nhôm màu xanh lá cây đậm ánh kim loại sáng bóng, ôm trọn kết cấu robot với 2 rãnh bánh xe.',
    photoIndex: 2,
    highlightColor: '#10b981',
    keyFeatures: [
      'Kết cấu đĩa tròn giúp robot xoay tại chỗ không bị vướng mắc góc tường',
      'Trọng tâm thấp giúp robot vận hành ổn định không bị lật khi phanh gấp',
    ],
  },

  waveshare_board: {
    id: 'waveshare_board',
    name: 'Bo mạch mở rộng Waveshare JetBot Expansion Board',
    englishName: 'Waveshare JetBot Motor Driver & Power Management PCB',
    category: 'Nguồn & Mở rộng',
    description:
      'Tầng mạch nằm ngay trên tấm nhôm xanh. Chịu trách nhiệm quản lý nguồn điện từ bộ pin 3S, sạc cân bằng cell, công tắc gạt bật/tắt toàn hệ thống, giắc cắm DC barrel 12.6V, và tích hợp IC cầu H điều khiển 2 động cơ DC độc lập qua giao thức I2C.',
    specs: [
      { label: 'Mạch điều khiển động cơ', value: 'IC điều khiển Dual H-Bridge PCA9685 + TB6612FNG' },
      { label: 'Giao thức kết nối Jetson', value: 'Bus I2C (địa chỉ 0x60)' },
      { label: 'Mạch quản lý nguồn', value: 'IC đo áp dòng INA219 hiển thị % pin qua I2C' },
      { label: 'Cổng sạc & Nguồn ngoài', value: 'Jack DC 5.5 x 2.1mm (sạc 12.6V 2A)' },
      { label: 'Công tắc nguồn', value: 'Công tắc gạt trượt cơ học (Slide Switch) ở cạnh hông' },
      { label: 'Nút bấm trên bo', value: 'Nút Reset và nút chức năng người dùng Key1/Key2' },
    ],
    rosTopic: '/jetbot/battery_state',
    rosMessageType: 'sensor_msgs/BatteryState',
    realPhotoEvidence:
      'Thấy ở Ảnh 1, 4 và 5: Tầng mạch PCB màu đen mờ, có in logo "ws" trắng, công tắc gạt bằng kim loại nhô ra ở mép trái và jack DC cắm sạc ở mép phải.',
    photoIndex: 3,
    highlightColor: '#6366f1',
    keyFeatures: [
      'Bảo vệ quá dòng, quá áp và tự ngắt khi pin yếu',
      'Điều chế độ rộng xung PWM tần số cao giúp động cơ chạy êm ái',
    ],
  },

  wifi_antennas: {
    id: 'wifi_antennas',
    name: 'Cặp ăng-ten WiFi lưỡng cực kép & Đai ốc đồng RP-SMA',
    englishName: 'Dual High-Gain Dipole WiFi Antennas with Brass RP-SMA Mounts',
    category: 'Nguồn & Mở rộng',
    description:
      'Hai ăng-ten đa hướng công suất cao gắn đối xứng ở đuôi tấm nhôm xanh theo góc mở chữ V. Kết nối qua đầu nối chuẩn RP-SMA bằng đai ốc đồng thau vàng óng với cáp đồng trục siêu mảnh (coaxial pigtail) dẫn vào card mạng Intel Wireless AC-8265 M.2 nằm dưới Jetson Nano.',
    specs: [
      { label: 'Băng tần hỗ trợ', value: 'Dual-band 2.4 GHz (3 dBi) & 5.0 GHz (5 dBi)' },
      { label: 'Loại ăng-ten', value: 'Dipole Omnidirectional vỏ nhựa đen có khớp gập 90°' },
      { label: 'Chuẩn chân đế', value: 'RP-SMA đực, siết bằng đai ốc đồng thau vàng óng' },
      { label: 'Dây dẫn tín hiệu', value: 'Cáp RG-178 đồng trục đen có đầu bấm IPEX MHF4' },
      { label: 'Góc xòe hình học', value: 'Góc chữ V mở 30° sang hai bên' },
    ],
    rosTopic: '/wifi/signal_strength',
    rosMessageType: 'diagnostic_msgs/DiagnosticStatus',
    realPhotoEvidence:
      'Ảnh 1, 3, 4, 5: Cặp ăng-ten đen đứng sừng sững ở đuôi xe, chân đế bắt chặt vào mặt tấm nhôm xanh bằng vòng đai ốc lục giác bằng đồng thau màu vàng bóng loáng.',
    photoIndex: 4,
    highlightColor: '#eab308',
    keyFeatures: [
      'Đảm bảo tầm xa điều khiển từ xa qua mạng WiFi không bị rớt mạng',
      'Độ trễ thấp khi truyền stream hình ảnh camera và điểm quét laser về máy tính trạm (ROS Workstation)',
    ],
  },

  caster_wheel: {
    id: 'caster_wheel',
    name: 'Bánh xe dẫn hướng Caster bằng thép dập mạ kẽm',
    englishName: 'Heavy-Duty Zinc-Plated Swivel Caster Wheel Assembly',
    category: 'Truyền động & Cơ khí',
    description:
      'Bánh xe tự do xoay 360 độ đặt dưới gầm trước/sau của robot, tạo thành cấu hình kiềng 3 chân (differential drive with caster). Càng thép dập mạ kẽm có vòng bi bi thép xoay trơn tru, giúp robot điều hướng nhẹ nhàng mà không tạo lực cản khi quay vi sai.',
    specs: [
      { label: 'Đường kính con lăn', value: '25 mm' },
      { label: 'Vật liệu càng kẹp', value: 'Thép carbon dập nguội mạ kẽm (Zinc Plated Steel)' },
      { label: 'Vật liệu bánh lăn', value: 'Polyurethane chống ồn chống trầy sàn nhà' },
      { label: 'Khả năng xoay', value: 'Xoay tự do 360° quanh trục đứng' },
      { label: 'Vị trí lắp', value: 'Tấm đế dưới, bắt bằng 2 ốc tán M3' },
    ],
    rosTopic: '/jetbot/caster/angle',
    rosMessageType: 'std_msgs/Float32',
    realPhotoEvidence:
      'Thấy rất rõ ở góc dưới của Ảnh 2 và Ảnh 5: Càng kim loại sáng màu thép đỡ bánh xe con lăn màu xám nằm ngay dưới mép tấm đế màu xanh.',
    photoIndex: 4,
    highlightColor: '#94a3b8',
    keyFeatures: [
      'Chịu tải trọng dồn về phía trước khi phanh',
      'Không dùng động cơ, tự động tự lựa theo hướng di chuyển của 2 bánh chính',
    ],
  },

  rainbow_wires: {
    id: 'rainbow_wires',
    name: 'Bó dây bẹ cầu vồng Jump Wire 40-pin GPIO',
    englishName: 'Rainbow Ribbon Jumper Wire Harness for GPIO Expansion',
    category: 'Nguồn & Mở rộng',
    description:
      'Chùm dây nối mềm nhiều màu sắc (cam, vàng, xanh lá, xanh dương, tím, đỏ) uốn cong thành hình cung cầu vồng cao vút ở sườn xe. Bó dây kết nối các chân GPIO, I2C và ngắt tín hiệu từ cổng 40-pin của Jetson Nano sang breadboard và các cảm biến mở rộng.',
    specs: [
      { label: 'Loại dây nối', value: 'Dây nối DuPont 28 AWG 1P-1P Female-to-Male' },
      { label: 'Màu sắc thứ tự', value: 'Bảng màu chuẩn quốc tế: Cam, Vàng, Xanh lá, Xanh dương, Tím, Đỏ' },
      { label: 'Độ uốn vòm', value: 'Uốn cong tự nhiên cao khoảng 75mm phía trên heatsink' },
      { label: 'Tác vụ kết nối', value: 'Tín hiệu ngắt nút nhấn GPIO 18, bus I2C cho màn hình LED TM1637' },
    ],
    rosTopic: '/jetbot/gpio/pins',
    rosMessageType: 'std_msgs/Header',
    realPhotoEvidence:
      'Điểm nhấn trực quan cực kỳ ấn tượng ở Ảnh 1: Búi dây 6 màu sặc sỡ uốn cong vòng lên không trung rồi cắm xuống bo mạch thử nghiệm (breadboard).',
    photoIndex: 0,
    highlightColor: '#ec4899',
    keyFeatures: [
      'Cho phép sinh viên và kỹ sư dễ dàng câu dây thử nghiệm cảm biến mới',
      'Nhận diện màu sắc chuẩn xác giúp tránh cắm nhầm nguồn và mass',
    ],
  },

  breadboard_module: {
    id: 'breadboard_module',
    name: 'Mini Breadboard & Nút bấm ngắt phần cứng GPIO',
    englishName: 'Mini Breadboard with Tactile Pushbutton & LEDs',
    category: 'Nguồn & Mở rộng',
    description:
      'Bo mạch cắm thử nghiệm mini màu trắng gắn ở tầng mở rộng, trên đó cắm sẵn một nút bấm cơ học tactile màu đỏ nối với chân GPIO 18 của Jetson Nano và 2 đèn LED hiển thị tín hiệu. Khi người dùng bấm nút, robot nhận tín hiệu ngắt phần cứng tức thì.',
    specs: [
      { label: 'Số điểm cắm (Tie-points)', value: '170 lỗ cắm tiếp xúc lá đồng' },
      { label: 'Nút bấm gắn sẵn', value: 'Nút tactile switch 6x6mm màu đỏ tiếp điểm kim loại' },
      { label: 'Chân ngắt GPIO kết nối', value: 'GPIO Pin 18 (Jetson Nano Header Pin 12)' },
      { label: 'Trạng thái kéo', value: 'Điện trở kéo lên nội (Pull-up Resistor) 10kΩ' },
      { label: 'Đèn LED cắm kèm', value: '2 LED 3mm chỉ thị trạng thái hoạt động' },
    ],
    rosTopic: '/jetbot/gpio_button',
    rosMessageType: 'std_msgs/Bool',
    realPhotoEvidence:
      'Quan sát tại Ảnh 1: Bo mạch cắm lỗ màu trắng gắn các linh kiện chân cắm và đầu dây cầu vồng ghim vào ngay cạnh quạt tản nhiệt.',
    photoIndex: 0,
    highlightColor: '#f43f5e',
    keyFeatures: [
      'Cho phép kiểm tra nhanh phản hồi ngắt phần cứng',
      'Tương tác trực tiếp trên giao diện 3D (bấm nút để kích hoạt)',
    ],
  },

  tm1637_display: {
    id: 'tm1637_display',
    name: 'Module màn hình LED 7 đoạn 4 số TM1637',
    englishName: 'TM1637 4-Digit 7-Segment Display Module',
    category: 'Nguồn & Mở rộng',
    description:
      'Module hiển thị số màu đỏ gồm 4 led 7 đoạn điều khiển qua IC TM1637 với 2 chân tín hiệu (CLK, DIO). Trong tài liệu JetBot ROS, màn hình này dùng để hiển thị địa chỉ IP WiFi của robot (ví dụ: 192.168.x.x) hoặc mã trạng thái lỗi.',
    specs: [
      { label: 'IC điều khiển', value: 'Titan Micro TM1637 2-wire serial bus' },
      { label: 'Số ký tự hiển thị', value: '4 ký tự số 7 đoạn kích thước 0.36 inch' },
      { label: 'Màu sắc hiển thị', value: 'Đỏ sáng rực rỡ có dấu 2 chấm ở giữa' },
      { label: 'Điện áp cấp', value: '3.3V – 5.0V DC' },
      { label: 'Tác vụ hiển thị mặc định', value: 'Năm "2026", địa chỉ IP, hoặc dòng chữ "PUSH"' },
    ],
    rosTopic: '/jetbot/display/text',
    rosMessageType: 'std_msgs/String',
    realPhotoEvidence:
      'Được mô tả trong tài liệu cẩm nang đi kèm và vị trí lắp bên hông sườn xe, kết nối trực tiếp với 2 chân CLK và DIO của Jetson Nano.',
    photoIndex: 0,
    highlightColor: '#ef4444',
    keyFeatures: [
      'Giúp người dùng biết ngay địa chỉ IP để SSH vào Jetson Nano mà không cần cắm màn hình',
      'Đổi số tức thời khi bấm nút hoặc nhận lệnh ROS',
    ],
  },

  tt_motors: {
    id: 'tt_motors',
    name: 'Động cơ giảm tốc DC TT Motor & Khớp nối đồng thau',
    englishName: 'Dual Yellow DC TT Gearmotors & Brass Hex Shaft Couplers',
    category: 'Truyền động & Cơ khí',
    description:
      'Cặp động cơ giảm tốc DC màu vàng tiêu chuẩn lắp đối xứng dưới gầm xe, truyền động độc lập cho 2 bánh xe trái và phải. Trục ra của hộp giảm tốc được nối chắc chắn với mâm bánh xe bằng khớp nối lục giác bằng đồng thau cố định bằng ốc vít.',
    specs: [
      { label: 'Tỉ số giảm tốc', value: '1:48 hộp số bánh răng kim loại / nylon' },
      { label: 'Điện áp định mức', value: '3V – 6V DC' },
      { label: 'Tốc độ không tải', value: '200 vòng/phút @ 6V' },
      { label: 'Mô-men xoắn định mức', value: '0.8 kg·cm' },
      { label: 'Khớp nối trục', value: 'Đồng thau lục giác chuẩn M4 siết ốc định vị' },
    ],
    rosTopic: '/cmd_vel',
    rosMessageType: 'geometry_msgs/Twist',
    realPhotoEvidence:
      'Nằm bên dưới tấm đế xanh lá cây, nối trực tiếp với đĩa mâm màu xanh dương qua khớp nối đồng (thấy rõ ở Ảnh 1 & 4).',
    photoIndex: 0,
    highlightColor: '#eab308',
    keyFeatures: [
      'Dẫn động vi sai độc lập giúp robot quay tròn tại chỗ bán kính 0cm',
      'Độ bền cao và dễ thay thế phụ tùng',
    ],
  },
};
