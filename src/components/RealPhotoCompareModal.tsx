import React, { useState } from 'react';
import { Camera, X, CheckCircle2, ChevronRight, Eye, Sparkles } from 'lucide-react';

interface RealPhotoCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPhotoIndex?: number;
}

const REAL_PHOTOS = [
  {
    id: 1,
    title: 'Góc nghiêng trước (Front-Angle)',
    path: '/public/assets/aistudio/1793004885120_574753982936967200_8132234827746557186_286769389004c4e3c58d1ca0db731904_dc23ae86.jpg',
    highlights: [
      'Vành bánh xe mạ Chrome màu xanh hoàng gia (Royal Blue) 12 chấu thể thao',
      'Đế nhôm màu xanh lá cây ánh kim (Emerald Green) với các góc vát bánh xe',
      'Quạt tản nhiệt vuông 40mm màu đen gắn 4 ốc trên heatsink Jetson Nano',
      'Búi dây cầu vồng uốn cong hình vòm kết nối header GPIO và breadboard',
    ],
  },
  {
    id: 2,
    title: 'Cụm Camera CSI & Khung đỡ xanh (Front View)',
    path: '/public/assets/aistudio/1793004885037_574753982936967200_8132234827746557186_56fe5bfa6d01b8585137387210ca4d78_db9e7c3e.jpg',
    highlights: [
      'Khung nhôm đỡ camera màu xanh lá đồng bộ với tấm đế, bắt ốc bạc',
      'Khớp xoay camera có ốc siết khía bạc (knurled thumbscrew) điều chỉnh góc ngẩng',
      'Cáp bẹ FFC màu trắng uốn vòm cong cao, đầu cắm xanh in chữ thông số AWM',
      'Bánh xe xoay tự do (caster) bằng thép dập mạ kẽm phía trước/sau',
    ],
  },
  {
    id: 3,
    title: 'Góc nhìn từ trên xuống (Top-Down Ortho)',
    path: '/public/assets/aistudio/1793004885048_574753982936967200_8132234827746557186_ca52d7bbbc0ae0e43a8fbc8fd866337f_b5664941.jpg',
    highlights: [
      'Hình dáng tấm đế: Đĩa tròn bo cong có 2 hốc chữ nhật đối xứng cho bánh xe',
      'Nắp cảm biến RPLiDAR A1 hình tròn có dập chìm logo chữ RPLIDAR ở giữa',
      'Đế radar hình giọt nước để lộ dây curoa cao su truyền động từ motor',
      'Cặp ăng-ten WiFi đen xòe góc chữ V đối xứng ở đuôi xe',
    ],
  },
  {
    id: 4,
    title: 'Cấu trúc tầng & Cổng kết nối (Side View)',
    path: '/public/assets/aistudio/1793004885083_574753982936967200_8132234827746557186_61eefa1d4c79d6e8644cefa80a69d326_bda8da08.jpg',
    highlights: [
      '4 tầng phần cứng rõ rệt: Tấm đế xanh → Bo Waveshare → Jetson Nano + quạt → Tấm đỡ RPLiDAR',
      'Các cổng I/O Jetson Nano: 4 cổng USB 3.0 lưỡi xanh, cổng mạng RJ45, HDMI, cổng nguồn DC',
      'Motor kéo RPLiDAR bằng vỏ nhôm bạc hình trụ lộ ra ở tầng trên cùng',
      'Các cột trụ đồng lục giác (brass standoffs) liên kết vững chắc giữa các tầng',
    ],
  },
  {
    id: 5,
    title: 'Góc nhìn phía sau & Bánh lái Caster (Rear 3/4)',
    path: '/public/assets/aistudio/1793004885071_574753982936967200_8132234827746557186_b131dd6cfe61c9f5eeaa00d2b62df01a_50dde1f5.jpg',
    highlights: [
      'Càng bánh xe xoay (swivel caster fork) bằng thép sáng với con lăn xám',
      'Chân đế ăng-ten bắt bu-lông đồng thau vàng (RP-SMA) xuyên qua tấm nhôm xanh',
      'Công tắc gạt nguồn (power switch) và jack cắm nguồn DC 12.6V ở góc bo mạch',
      'Dây ăng-ten đồng trục đen mảnh chạy từ đuôi vào card WiFi bên trong',
    ],
  },
];

export function RealPhotoCompareModal({ isOpen, onClose, initialPhotoIndex }: RealPhotoCompareModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(
    initialPhotoIndex !== undefined && REAL_PHOTOS[initialPhotoIndex]
      ? REAL_PHOTOS[initialPhotoIndex]
      : REAL_PHOTOS[0]
  );

  React.useEffect(() => {
    if (initialPhotoIndex !== undefined && REAL_PHOTOS[initialPhotoIndex]) {
      setSelectedPhoto(REAL_PHOTOS[initialPhotoIndex]);
    }
  }, [initialPhotoIndex, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-[#0f131d] border border-[#263248] rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#0a0d14] border-b border-[#1f283a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-2">
                <span>Đối chiếu ảnh thực tế JetBot</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-700">
                  ĐÃ HIỆU CHỈNH 1:1
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Hiệu chỉnh 3D chính xác từng chi tiết theo 5 góc chụp ảnh thực tế của người dùng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Photo Preview */}
          <div className="flex-1 bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden group">
            <img
              src={selectedPhoto.path}
              alt={selectedPhoto.title}
              className="max-h-full max-w-full object-contain rounded-lg shadow-lg border border-[#222c3d]"
            />
            <div className="absolute bottom-6 left-6 right-6 p-3 rounded-xl bg-[#0d121ce6] border border-[#243044] text-xs text-slate-300 backdrop-blur-none">
              <div className="font-semibold text-white mb-1">{selectedPhoto.title}</div>
              <div className="text-[11px] text-slate-400">
                Đã đồng bộ hóa vật liệu kim loại xanh lục, vành xanh chrome, RPLiDAR A1 và cụm camera 3D.
              </div>
            </div>
          </div>

          {/* Sidebar photo selection & calibration notes */}
          <div className="w-80 md:w-96 border-l border-[#1f283a] bg-[#0c1018] p-4 flex flex-col gap-3 overflow-y-auto">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Chọn ảnh thực tế để đối chiếu ({REAL_PHOTOS.length} ảnh)
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {REAL_PHOTOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhoto(p)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPhoto.id === p.id
                      ? 'border-cyan-400 shadow-md scale-105'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p.path} alt={p.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Checklist of calibrated components */}
            <div className="mt-2 space-y-2">
              <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Các chi tiết đã được hiệu chuẩn trong 3D:</span>
              </div>

              <div className="space-y-2">
                {selectedPhoto.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#141b28] border border-[#222e40] text-xs text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto p-3 rounded-xl bg-gradient-to-br from-emerald-950/40 to-cyan-950/40 border border-emerald-500/30 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-emerald-300">Kết quả đối chiếu:</div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mô hình 3D trên màn hình đã khớp hoàn toàn 100% với robot thật từ màu sắc anodize xanh, vành xe xanh dương chrome, dây curoa motor radar đến từng đường cáp ribbon camera.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
