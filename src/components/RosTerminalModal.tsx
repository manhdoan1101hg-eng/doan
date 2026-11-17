import React, { useState } from 'react';
import { Terminal, Copy, Check, FileCode, Play, X, ExternalLink } from 'lucide-react';

interface RosTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteRosCommand?: (cmd: string) => void;
  currentCmdVel: { linear: number; angular: number };
  closestObstacleDist: number;
}

const CODE_DOCS = [
  {
    id: 'launch',
    title: 'jetbot_bringup.launch',
    lang: 'xml',
    desc: 'Cấu hình ROS launch khởi động động cơ, RPLiDAR A1/A2, Camera CSI và TF frame',
    code: `<launch>
    <!-- 1. Node điều khiển động cơ JetBot từ lệnh /cmd_vel -->
    <node name="jetbot_driver" pkg="jetbot_ros" type="jetbot_motors_node.py" output="screen">
        <param name="linear_speed_scale" value="0.5"/>
        <param name="angular_speed_scale" value="1.0"/>
    </node>

    <!-- 2. Khởi chạy cảm biến RPLiDAR A1/A2 -->
    <node name="rplidarNode" pkg="rplidar_ros" type="rplidarNode" output="screen">
        <param name="serial_port" type="string" value="/dev/ttyUSB0"/>
        <param name="serial_baudrate" type="int" value="115200"/>
        <param name="frame_id" type="string" value="laser_frame"/>
        <param name="inverted" type="bool" value="false"/>
        <param name="angle_compensate" type="bool" value="true"/>
    </node>

    <!-- 3. Khởi chạy Camera CSI GStreamer ROS Node -->
    <node name="csi_camera" pkg="jetson_camera" type="jetson_camera_node" output="screen">
        <param name="cap_width" value="1280"/>
        <param name="cap_height" value="720"/>
        <param name="framerate" value="30"/>
        <param name="frame_id" value="camera_frame"/>
    </node>

    <!-- 4. Khai báo tọa độ khung hình (Static Transform Publisher) -->
    <node pkg="tf" type="static_transform_publisher" name="base_to_laser" 
          args="0.0 0.0 0.18 0 0 0 base_link laser_frame 100" />
          
    <node pkg="tf" type="static_transform_publisher" name="base_to_camera" 
          args="0.10 0.0 0.08 0 0 0 base_link camera_frame 100" />
</launch>`,
  },
  {
    id: 'motors',
    title: 'jetbot_motors.py',
    lang: 'python',
    desc: 'Điều khiển động cơ vi sai qua driver PCA9685 I2C / PWM (Adafruit)',
    code: `#!/usr/bin/env python3
import time
import board
import busio
from adafruit_pca9685 import PCA9685

class JetBotMotors:
    def __init__(self):
        # Khởi tạo bus I2C trên Jetson Nano (Bus 1)
        self.i2c = busio.I2C(board.SCL, board.SDA)
        self.pca = PCA9685(self.i2c)
        self.pca.frequency = 50  # Tần số 50Hz cho động cơ PWM

        # Cấu hình kênh PWM cho động cơ
        # Motor Trái: Kênh 0 (PWM), 1 (IN1), 2 (IN2)
        # Motor Phải: Kênh 5 (PWM), 3 (IN3), 4 (IN4)
        self.LEFT_PWM, self.LEFT_IN1, self.LEFT_IN2 = 0, 1, 2
        self.RIGHT_PWM, self.RIGHT_IN1, self.RIGHT_IN2 = 5, 3, 4

    def _set_motor(self, pwm_pin, in1_pin, in2_pin, speed):
        """speed từ -1.0 đến 1.0"""
        speed = max(-1.0, min(1.0, speed))
        duty_cycle = int(abs(speed) * 65535)

        if speed > 0:
            self.pca.channels[in1_pin].duty_cycle = 65535
            self.pca.channels[in2_pin].duty_cycle = 0
        elif speed < 0:
            self.pca.channels[in1_pin].duty_cycle = 0
            self.pca.channels[in2_pin].duty_cycle = 65535
        else:
            self.pca.channels[in1_pin].duty_cycle = 0
            self.pca.channels[in2_pin].duty_cycle = 0

        self.pca.channels[pwm_pin].duty_cycle = duty_cycle

    def set_speeds(self, left_speed, right_speed):
        self._set_motor(self.LEFT_PWM, self.LEFT_IN1, self.LEFT_IN2, left_speed)
        self._set_motor(self.RIGHT_PWM, self.RIGHT_IN1, self.RIGHT_IN2, right_speed)

    def stop(self):
        self.set_speeds(0, 0)`,
  },
  {
    id: 'peripheral',
    title: 'peripheral_control.py',
    lang: 'python',
    desc: 'Điều khiển màn hình LED 7 đoạn TM1637 (GPIO 23, 24) và nút ngắt (GPIO 18)',
    code: `#!/usr/bin/env python3
import RPi.GPIO as GPIO
import time

# Chân kết nối GPIO trên Jetson Nano
CLK_PIN = 23
DIO_PIN = 24
BTN_PIN = 18

class TM1637Display:
    def __init__(self, clk, dio):
        self.clk = clk
        self.dio = dio
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(self.clk, GPIO.OUT)
        GPIO.setup(self.dio, GPIO.OUT)

    def show_num(self, val):
        """Hiển thị số nguyên 4 chữ số (ví dụ: 2026)"""
        digits = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f]
        s = f"{val:04d}"
        self._start()
        self._write_byte(0x40)
        self._stop()
        self._start()
        self._write_byte(0xc0)
        for char in s:
            self._write_byte(digits[int(char)])
        self._stop()
        self._start()
        self._write_byte(0x88 + 7) # Sáng tối đa
        self._stop()

def button_callback(channel):
    print("Nút bấm trên Breadboard đã được nhấn (GPIO 18)!")`,
  },
];

export function RosTerminalModal({
  isOpen,
  onClose,
  onExecuteRosCommand,
  currentCmdVel,
  closestObstacleDist,
}: RosTerminalModalProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'code'>('terminal');
  const [selectedDocId, setSelectedDocId] = useState('launch');
  const [copied, setCopied] = useState(false);
  const [inputCmd, setInputCmd] = useState('');
  const [logs, setLogs] = useState<Array<{ text: string; type: 'info' | 'success' | 'warn' | 'error' }>>([
    { text: '[ROS 1 MASTER] Connected to http://jetson-nano:11311', type: 'success' },
    { text: '[SYSTEM] NVIDIA Jetson Nano Developer Kit 4GB (Tegra210) initialized.', type: 'info' },
    { text: '[SYSTEM] RPLiDAR A1/A2 bound to /dev/ttyUSB0 (Baud: 115200, 10 Hz)', type: 'info' },
    { text: '[SYSTEM] CSI-2 Camera Node mounted (1280x720@30fps -> /csi_camera/image_raw)', type: 'info' },
    { text: '[SYSTEM] PCA9685 I2C (Bus 1, 50Hz) connected to Waveshare Dual DC Driver', type: 'info' },
    { text: '[SYSTEM] TM1637 4-digit display ready on GPIO 23 (CLK), GPIO 24 (DIO)', type: 'info' },
    { text: 'Type "help" for a list of available ROS commands.', type: 'info' },
  ]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputCmd.trim();
    if (!cmd) return;

    const newLogs = [...logs, { text: `$ ${cmd}`, type: 'info' as const }];

    if (cmd === 'help') {
      newLogs.push(
        { text: 'Available commands:', type: 'info' },
        { text: '  rostopic list               - List active ROS topics', type: 'info' },
        { text: '  rostopic echo /cmd_vel      - Stream live motor velocity teleop data', type: 'info' },
        { text: '  rostopic echo /scan         - Stream RPLiDAR 360 laser scan ranges', type: 'info' },
        { text: '  roslaunch jetbot_ros jetbot_bringup.launch - Re-initialize full stack', type: 'info' },
        { text: '  python3 peripheral_control.py - Test TM1637 7-seg and GPIO button', type: 'info' },
        { text: '  clear                       - Clear terminal screen', type: 'info' }
      );
    } else if (cmd === 'clear') {
      setLogs([]);
      setInputCmd('');
      return;
    } else if (cmd === 'rostopic list') {
      newLogs.push(
        { text: '/cmd_vel [geometry_msgs/Twist]', type: 'success' },
        { text: '/scan [sensor_msgs/LaserScan]', type: 'success' },
        { text: '/csi_camera/image_raw [sensor_msgs/Image]', type: 'success' },
        { text: '/jetbot/battery_state [sensor_msgs/BatteryState]', type: 'success' },
        { text: '/jetbot/gpio18_button [std_msgs/Bool]', type: 'success' },
        { text: '/tf [tf2_msgs/TFMessage]', type: 'success' }
      );
    } else if (cmd === 'rostopic echo /cmd_vel') {
      newLogs.push({
        text: `---
linear:
  x: ${currentCmdVel.linear.toFixed(3)}
  y: 0.0
  z: 0.0
angular:
  x: 0.0
  y: 0.0
  z: ${currentCmdVel.angular.toFixed(3)}`,
        type: 'info',
      });
    } else if (cmd === 'rostopic echo /scan') {
      newLogs.push({
        text: `---
header:
  stamp: {secs: ${Math.floor(Date.now() / 1000)}, nsecs: 0}
  frame_id: "laser_frame"
angle_min: 0.0
angle_max: 6.283
angle_increment: 0.0349
range_min: 0.15
range_max: 6.0
ranges: [closest: ${closestObstacleDist.toFixed(2)}m, 180 points acquired]`,
        type: 'info',
      });
    } else if (cmd.includes('roslaunch')) {
      newLogs.push(
        { text: '... logging to /home/jetson/.ros/log/latest.log', type: 'info' },
        { text: 'started roslaunch server http://jetson-nano:44211/', type: 'info' },
        { text: '[base_to_laser] published transform: 0.0, 0.0, 0.18', type: 'success' },
        { text: '[base_to_camera] published transform: 0.10, 0.0, 0.08', type: 'success' },
        { text: 'All nodes started successfully!', type: 'success' }
      );
    } else if (cmd.includes('peripheral_control')) {
      newLogs.push(
        { text: 'Đang hiển thị số 2026 trên LED 7 đoạn TM1637...', type: 'success' },
        { text: 'Đang lắng nghe ngắt nút bấm trên GPIO 18...', type: 'info' }
      );
    } else {
      newLogs.push({
        text: `bash: ${cmd}: command not recognized. Type "help" for instructions.`,
        type: 'warn',
      });
    }

    setLogs(newLogs);
    setInputCmd('');
    if (onExecuteRosCommand) onExecuteRosCommand(cmd);
  };

  const currentDoc = CODE_DOCS.find((d) => d.id === selectedDocId) || CODE_DOCS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div className="bg-[#10141d] border border-[#2a3449] rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#222b3d] bg-[#0c0f17]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                JetBot ROS Controller & Source Code Inspector
              </h2>
              <p className="text-xs text-slate-400">
                NVIDIA Jetson Nano · RPLiDAR · Camera CSI · Waveshare I2C Motor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#182030] p-0.5 rounded-lg border border-[#2a3449]">
              <button
                onClick={() => setActiveTab('terminal')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'terminal'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ROS Terminal
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'code'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Mã nguồn Python/ROS
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'terminal' ? (
          <div className="flex-1 flex flex-col bg-[#080a0f] p-4 font-mono text-xs overflow-hidden">
            <div className="flex-1 overflow-y-auto space-y-1 pr-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`leading-relaxed whitespace-pre-wrap ${
                    log.type === 'success'
                      ? 'text-emerald-400'
                      : log.type === 'warn'
                      ? 'text-amber-400'
                      : log.type === 'error'
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {log.text}
                </div>
              ))}
            </div>

            {/* Terminal Input */}
            <form onSubmit={handleRunCommand} className="mt-3 pt-3 border-t border-[#1d2638] flex items-center gap-2">
              <span className="text-emerald-400 font-bold select-none">jetson@jetbot:~$</span>
              <input
                type="text"
                value={inputCmd}
                onChange={(e) => setInputCmd(e.target.value)}
                placeholder="type rostopic list, rostopic echo /cmd_vel, help..."
                className="flex-1 bg-transparent text-white focus:outline-none placeholder-slate-600 font-mono text-xs"
                autoFocus
              />
              <button
                type="submit"
                className="px-3 py-1 rounded bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-xs flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 text-emerald-400" /> Run
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar file list */}
            <div className="w-64 border-r border-[#222b3d] bg-[#0c0f17] p-3 flex flex-col gap-1.5">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Tài liệu mã nguồn
              </div>
              {CODE_DOCS.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`flex items-start gap-2.5 p-2 rounded-lg text-left transition-colors ${
                    selectedDocId === doc.id
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <FileCode className="w-4 h-4 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-slate-200">{doc.title}</div>
                    <div className="text-[10px] text-slate-500 truncate max-w-[170px]">{doc.desc}</div>
                  </div>
                </button>
              ))}

              <div className="mt-auto p-3 rounded-lg bg-[#141b29] border border-[#232e42] text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">Kết nối phần cứng:</div>
                <div>• Motor: Waveshare PCA9685 I2C</div>
                <div>• RPLiDAR: /dev/ttyUSB0 (115200)</div>
                <div>• TM1637: CLK=GPIO 23, DIO=GPIO 24</div>
                <div>• Nút bấm: BTN=GPIO 18</div>
              </div>
            </div>

            {/* Code view */}
            <div className="flex-1 flex flex-col bg-[#080a0f] overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#222b3d] bg-[#0f141f]">
                <div className="text-xs font-mono text-slate-300">{currentDoc.title}</div>
                <button
                  onClick={() => handleCopy(currentDoc.code)}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-[#1c2436] hover:bg-[#28354f] text-slate-300 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép mã'}</span>
                </button>
              </div>
              <pre className="flex-1 p-4 overflow-auto text-xs font-mono text-slate-300 bg-[#080a0f] leading-relaxed">
                <code>{currentDoc.code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
