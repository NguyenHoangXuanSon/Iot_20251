const mqtt = require('mqtt');
const mongoose = require('mongoose'); 

const DeviceData = require('./models/devicedata.model'); 

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

        // 2. Map dữ liệu vào Schema DeviceData
        const newRecord = {
            name: "DHT11_Sensor", // Đặt tên tạm
            
            // Schema của bạn 'value' là Mixed, nên ném cả cục data vào luôn
            value: data, 
            
            // Fake một ObjectId hợp lệ để vượt qua validate của Mongo
            // Sau này bạn sẽ thay dòng này bằng ID thật của thiết bị
            deviceId: new mongoose.Types.ObjectId("64d3b1e3f1a2c3b4d5e6f7a8"),
        };

        // 3. Lưu vào Database
        await DeviceData.create(newRecord);
        console.log('Đã lưu thành công:', newRecord);

    } catch (error) {
        console.error('Lỗi lưu DB:', error.message);
    }
});

module.exports = client;