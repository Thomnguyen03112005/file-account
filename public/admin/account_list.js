// Các biến toàn cục
const accountsPerPage = 10;
let currentPage = 1;
let totalAccounts = 0;
let accountsData = [];

// Hàm gọi API để lấy danh sách tài khoản
async function fetchAccounts(page = 1) {
    try {
        const response = await fetch('data/userdata.json'); // Đường dẫn đến tệp JSON
        if (!response.ok) {
            throw new Error('Failed to fetch accounts.');
        }
        const data = await response.json();
        accountsData = data.datauser || []; // Lưu trữ dữ liệu tài khoản
        totalAccounts = accountsData.length; // Cập nhật tổng số tài khoản
        renderAccounts(page); // Render danh sách tài khoản
    } catch (error) {
        showNotification('errorNotification', error.message);
    }
}

// Hàm render danh sách tài khoản
function renderAccounts(page) {
    const startIndex = (page - 1) * accountsPerPage;
    const endIndex = Math.min(startIndex + accountsPerPage, totalAccounts);
    const accountsList = document.querySelector('.activity-data');
    accountsList.innerHTML = ''; // Xóa nội dung trước đó

    // Kiểm tra nếu không có tài khoản nào
    if (totalAccounts === 0) {
        document.getElementById('noResults').style.display = 'block';
        return;
    } else {
        document.getElementById('noResults').style.display = 'none';
    }

    // Render dữ liệu
    for (let i = startIndex; i < endIndex; i++) {
        const account = accountsData[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="accountCheckbox" data-id="${account.id}"></td>
            <td>${account.id}</td>
            <td>${account.username}</td>
            <td>${account.name}</td>
            <td>${account.password}</td>
            <td>${account.role}</td>
            <td>
                <button onclick="deleteAccount(${account.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        accountsList.appendChild(row);
    }
    updatePagination(); // Cập nhật phân trang
}

// Hàm cập nhật phân trang
function updatePagination() {
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = ''; // Xóa nội dung trước đó
    const totalPages = Math.ceil(totalAccounts / accountsPerPage);

    // Tạo các nút phân trang
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('span');
        pageButton.innerText = i;
        pageButton.classList.add('page-number');
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.onclick = () => {
            currentPage = i;
            renderAccounts(currentPage); // Gọi lại hàm render với trang đã chọn
        };
        pageNumbers.appendChild(pageButton);
    }

    // Cập nhật trạng thái nút Previous và Next
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

// Hàm tìm kiếm với debounce
function debounceSearch() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const filteredAccounts = accountsData.filter(account =>
        account.username.toLowerCase().includes(searchValue) ||
        account.name.toLowerCase().includes(searchValue) ||
        account.id.toString().includes(searchValue)
    );

    // Kiểm tra nếu không tìm thấy tài khoản
    if (filteredAccounts.length === 0) {
        document.getElementById('noResults').style.display = 'block';
    } else {
        document.getElementById('noResults').style.display = 'none';
    }

    // Render danh sách tài khoản đã lọc
    const accountsList = document.querySelector('.activity-data');
    accountsList.innerHTML = '';

    filteredAccounts.forEach(account => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" class="accountCheckbox" data-id="${account.id}"></td>
            <td>${account.id}</td>
            <td>${account.username}</td>
            <td>${account.name}</td>
            <td>${account.password}</td>
            <td>${account.role}</td>
            <td>
                <button onclick="deleteAccount(${account.id})"><i class="fas fa-trash-alt"></i></button>
            </td>
        `;
        accountsList.appendChild(row);
    });
}

// Hàm xóa tài khoản theo ID
async function deleteAccount(accountId) {
    const index = accountsData.findIndex(account => account.id === accountId);
    if (index !== -1) {
        accountsData.splice(index, 1); // Xóa tài khoản
        await updateUserData(); // Cập nhật dữ liệu
        fetchAccounts(currentPage); // Tải lại danh sách tài khoản
        showNotification('successNotification', 'Account deleted successfully!');
    } else {
        showNotification('errorNotification', 'Account not found.');
    }
}

// Hàm cập nhật dữ liệu tài khoản
async function updateUserData() {
    try {
        await fetch('data/userdata.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ datauser: accountsData }) // Gửi dữ liệu đã cập nhật
        });
    } catch (error) {
        console.error('Error updating user data:', error);
        showNotification('errorNotification', 'Failed to update account data.');
    }
}

// Hàm hiển thị thông báo
function showNotification(notificationId, message) {
    const notification = document.getElementById(notificationId);
    notification.innerText = message;
    notification.style.display = 'block'; // Hiển thị thông báo
    setTimeout(() => {
        notification.style.display = 'none'; // Ẩn thông báo sau 3 giây
    }, 3000);
}

// Gọi hàm fetchAccounts để tải danh sách tài khoản khi trang được tải
fetchAccounts();

// Thêm sự kiện lắng nghe cho nút Previous và Next
document.getElementById('prevPage').onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        renderAccounts(currentPage); // Render lại trang trước
    }
};

document.getElementById('nextPage').onclick = () => {
    const totalPages = Math.ceil(totalAccounts / accountsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderAccounts(currentPage); // Render lại trang tiếp theo
    }
};

// Thêm sự kiện tìm kiếm với debounce
document.getElementById('searchInput').addEventListener('input', debounceSearch);
