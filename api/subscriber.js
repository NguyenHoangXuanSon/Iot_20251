const mqtt = require('mqtt');
const mongoose = require('mongoose'); 

const DeviceData = require('./models/devicedata.model'); 
const Device = require('./models/device.model'); 

const host = process.env.HOST || 'localhost';
const port = process.env.MQTTPORT || 1883;

const client = mqtt.connect({
    host: host,
    port: port,
    protocol: 'mqtt',
});

client.on('connect', () => {
    console.log('MQTT Subscriber Connected');
    client.subscribe('iot/data');
});

client.on('message', async (topic, message) => {
    const msgString = message.toString();
    console.log(`Nhận tin: ${msgString}`);

    try {
        // 1. Dữ liệu nhận được: { "temp": 39, "hum": 14 }
        const data = JSON.parse(msgString);

        // 2. Tìm thiết bị DHT11 Sensor trong DB (theo tên)
        let device = await Device.findOne({ deviceName: "DHT11 Sensor" });
        
        // Nếu không tìm thấy, dùng ID fake
        let deviceId = device ? device._id : new mongoose.Types.ObjectId("64d3b1e3f1a2c3b4d5e6f7a8");

        // 3. Lưu dữ liệu vào DeviceData
        const newRecord = {
            name: "DHT11_Sensor",
            value: data, 
            deviceId: deviceId,
        };
        await DeviceData.create(newRecord);
        console.log('Đã lưu DeviceData:', newRecord);

        // 4. Cập nhật giá trị value trong bảng Device (để Tổng quan hiển thị)
        if (device) {
            await Device.findByIdAndUpdate(device._id, {
                value: data  // Lưu cả object {temp, hum}
            });
            console.log('Đã cập nhật Device value:', data);
        }

    } catch (error) {
        console.error('Lỗi lưu DB:', error.message);
    }
});

module.exports = client;