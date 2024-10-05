const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public/admin')));

// Đảm bảo thư mục dữ liệu tồn tại
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// API để lấy dữ liệu tài khoản từ tệp JSON
app.get('/api/data', (req, res) => {
    fs.readFile(path.join(dataDir, 'userdata.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        res.json(JSON.parse(data));
    });
});

// API ACCOUNT
app.get('/api/account', (req, res) => {
    fs.readFile(path.join(dataDir, 'account.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        res.json(JSON.parse(data));
    });
});

// API để thêm tài khoản mới
app.post('/api/data', (req, res) => {
    const newUserData = req.body;

    fs.readFile(path.join(dataDir, 'userdata.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        const jsonData = JSON.parse(data);
        jsonData.datauser.push(newUserData);

        fs.writeFile(path.join(dataDir, 'userdata.json'), JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing file');
            }
            res.status(201).send('Data added successfully');
        });
    });
});

// API để xóa tài khoản
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);

    fs.readFile(path.join(dataDir, 'userdata.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        const jsonData = JSON.parse(data);
        const updatedData = jsonData.datauser.filter(user => user.id !== userId);

        fs.writeFile(path.join(dataDir, 'userdata.json'), JSON.stringify({ datauser: updatedData }, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing file');
            }
            res.send(`User with ID ${userId} deleted`);
        });
    });
});

// API để thay đổi vai trò của tài khoản
app.put('/api/users/:id/role', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;

    fs.readFile(path.join(dataDir, 'userdata.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        const jsonData = JSON.parse(data);
        const userIndex = jsonData.datauser.findIndex(user => user.id === userId);

        if (userIndex !== -1) {
            jsonData.datauser[userIndex].role = role;

            fs.writeFile(path.join(dataDir, 'userdata.json'), JSON.stringify(jsonData, null, 2), (err) => {
                if (err) {
                    return res.status(500).send('Error writing file');
                }
                res.send(`Role for user with ID ${userId} updated to ${role}`);
            });
        } else {
            res.status(404).send('User not found');
        }
    });
});

// API để tìm kiếm tài khoản theo ID
app.get('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);

    fs.readFile(path.join(dataDir, 'userdata.json'), 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file');
        }
        const jsonData = JSON.parse(data);
        const user = jsonData.datauser.find(user => user.id === userId);

        if (user) {
            res.json(user); // Trả về thông tin người dùng nếu tìm thấy
        } else {
            res.status(404).send('User not found'); // Nếu không tìm thấy
        }
    });
});

// Định nghĩa port
const port = process.env.PORT || 3000; // Nếu không có biến môi trường PORT thì sẽ dùng 3000

// Lắng nghe trên cổng do hosting cung cấp
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
