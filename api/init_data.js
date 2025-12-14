const mongoose = require('mongoose');
const Room = require('./models/room.model'); 
const Device = require('./models/device.model');
const User = require('./models/user.model'); 
// 👇 Thêm dòng này (Nếu báo lỗi thì kiểm tra xem file này tên là devicetype.model.js hay type.model.js nhé)
const DeviceType = require('./models/devicetype.model'); 

// Kết nối DB
const mongoURI = "mongodb://localhost:27017/iot_project_db"; 

mongoose.connect(mongoURI).then(async () => {
    console.log("✅ Đã kết nối DB!");

    // 1. Tìm ông Admin
    const admin = await User.findOne({ email: 'admin@gmail.com' });
    if (!admin) {
        console.log("❌ Lỗi: Không tìm thấy tài khoản admin@gmail.com.");
        process.exit();
    }

    // 2. Tạo Phòng Khách
    const room = new Room({
        name: "Phòng Khách " + Math.floor(Math.random() * 100),
        description: "Phòng khách tầng 1",
        userId: admin._id 
    });
    const savedRoom = await room.save();
    console.log("🏠 Đã tạo phòng:", savedRoom.name);

    // 3. Tạo Loại Thiết Bị (BƯỚC MỚI - QUAN TRỌNG)
    // Chúng ta phải tạo "Loại" trước để lấy cái ID của nó
    let savedType;
    try {
        const type = new DeviceType({
            name: "Cảm biến nhiệt độ",
            description: "Dùng để đo thông số môi trường"
        });
        savedType = await type.save();
        console.log("🏷️ Đã tạo loại thiết bị:", savedType.name);
    } catch (err) {
        // Nếu loại này đã có rồi thì tìm lại loại cũ để lấy ID
        savedType = await DeviceType.findOne();
        console.log("🏷️ Dùng loại thiết bị cũ:", savedType.name);
    }

    // 4. Tạo Thiết bị
    const device = new Device({
        _id: "64d3b1e3f1a2c3b4d5e6f7a8", // ID khớp simulator
        deviceName: "DHT11 Sensor",      
        deviceType: savedType._id,       // <--- SỬA LỖI TẠI ĐÂY: Truyền ID chứ không truyền chuỗi "SENSOR"
        roomId: savedRoom._id,
        status: "ON"                     
    });
    
    // Xử lý lỗi trùng ID
    try {
        await device.save();
        console.log("📡 Đã tạo thiết bị:", device.deviceName);
    } catch (e) {
        if (e.code === 11000) {
            console.log("⚠️ Thiết bị ID này đã có rồi, không cần tạo lại.");
        } else {
            console.log("❌ Lỗi tạo thiết bị:", e.message);
        }
    }
    
    console.log("🎉 Xong! Giờ F5 trang web là thấy liền!");
    process.exit();
}).catch(err => {
    console.log("❌ Lỗi Chung:", err);
});