import { NextResponse } from 'next/server';

// Hàm chuyển đổi dương lịch sang âm lịch (đơn giản hóa)
function solarToLunar(solarDate: Date) {
    // Đây là thuật toán đơn giản, trong thực tế nên dùng thư viện chuyên dụng
    const year = solarDate.getFullYear();
    const month = solarDate.getMonth() + 1;
    const day = solarDate.getDate();
    
    // Tính toán gần đúng (cần thư viện chính xác hơn cho production)
    const lunarMonth = month;
    const lunarDay = day;
    
    return { year, month: lunarMonth, day: lunarDay };
}

// Hàm tính Can Chi
function getCanChi(date: Date) {
    const can = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
    const chi = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
    
    const year = date.getFullYear();
    const canIndex = (year - 4) % 10;
    const chiIndex = (year - 4) % 12;
    
    return `${can[canIndex]} ${chi[chiIndex]}`;
}

// Hàm lấy giờ hoàng đạo
function getGoodHours(date: Date) {
    const dayOfWeek = date.getDay();
    
    // Giờ hoàng đạo theo ngày trong tuần
    const goodHoursByDay = [
        ['Tý (23-1h)', 'Dần (3-5h)', 'Mão (5-7h)', 'Ngọ (11-13h)', 'Dậu (17-19h)'], // Chủ nhật
        ['Sửu (1-3h)', 'Mão (5-7h)', 'Tỵ (9-11h)', 'Mùi (13-15h)', 'Dậu (17-19h)'], // Thứ 2
        ['Tý (23-1h)', 'Dần (3-5h)', 'Thìn (7-9h)', 'Ngọ (11-13h)', 'Thân (15-17h)'], // Thứ 3
        ['Sửu (1-3h)', 'Mão (5-7h)', 'Tỵ (9-11h)', 'Mùi (13-15h)', 'Tuất (19-21h)'], // Thứ 4
        ['Tý (23-1h)', 'Dần (3-5h)', 'Thìn (7-9h)', 'Ngọ (11-13h)', 'Thân (15-17h)'], // Thứ 5
        ['Sửu (1-3h)', 'Mão (5-7h)', 'Tỵ (9-11h)', 'Mùi (13-15h)', 'Dậu (17-19h)'], // Thứ 6
        ['Tý (23-1h)', 'Dần (3-5h)', 'Thìn (7-9h)', 'Ngọ (11-13h)', 'Thân (15-17h)'], // Thứ 7
    ];
    
    return goodHoursByDay[dayOfWeek];
}

// Hàm lấy giờ xấu
function getBadHours(date: Date) {
    const dayOfWeek = date.getDay();
    
    const badHoursByDay = [
        ['Thìn (7-9h)', 'Tỵ (9-11h)', 'Mùi (13-15h)'], // Chủ nhật
        ['Tý (23-1h)', 'Dần (3-5h)', 'Thân (15-17h)'], // Thứ 2
        ['Sửu (1-3h)', 'Mão (5-7h)', 'Tuất (19-21h)'], // Thứ 3
        ['Tý (23-1h)', 'Dần (3-5h)', 'Thân (15-17h)'], // Thứ 4
        ['Sửu (1-3h)', 'Mão (5-7h)', 'Dậu (17-19h)'], // Thứ 5
        ['Tý (23-1h)', 'Dần (3-5h)', 'Thân (15-17h)'], // Thứ 6
        ['Sửu (1-3h)', 'Mão (5-7h)', 'Tuất (19-21h)'], // Thứ 7
    ];
    
    return badHoursByDay[dayOfWeek];
}

// Hàm lấy việc nên làm
function getGoodActivities(date: Date) {
    const dayOfWeek = date.getDay();
    
    const activities = [
        ['Cầu tài', 'Khai trương', 'Ký hợp đồng', 'Xuất hành'], // Chủ nhật
        ['Cưới hỏi', 'Động thổ', 'Nhập trạch', 'An táng'], // Thứ 2
        ['Cầu phúc', 'Dâng sớ', 'Cúng tế', 'Tu tạo'], // Thứ 3
        ['Giao dịch', 'Mua bán', 'Khai trương', 'Xuất hành'], // Thứ 4
        ['Cưới hỏi', 'Ăn hỏi', 'Lễ thành', 'Nhập trạch'], // Thứ 5
        ['Cầu tài', 'Khai trương', 'Ký hợp đồng', 'Giao dịch'], // Thứ 6
        ['Tu tạo', 'Sửa chữa', 'Động thổ', 'Tạo tác'], // Thứ 7
    ];
    
    return activities[dayOfWeek];
}

// Hàm lấy việc nên tránh
function getBadActivities(date: Date) {
    const dayOfWeek = date.getDay();
    
    const activities = [
        ['Động thổ', 'Phá thổ', 'Khai trương'], // Chủ nhật
        ['Xuất hành xa', 'Di chuyển', 'Đi biển'], // Thứ 2
        ['Cưới hỏi', 'Ăn hỏi', 'Lễ thành'], // Thứ 3
        ['Động thổ', 'Phá thổ', 'Tu tạo'], // Thứ 4
        ['Kiện tụng', 'Tranh chấp', 'Giao dịch lớn'], // Thứ 5
        ['Cưới hỏi', 'Ăn hỏi', 'Nhập trạch'], // Thứ 6
        ['Xuất hành xa', 'Khai trương', 'Ký hợp đồng'], // Thứ 7
    ];
    
    return activities[dayOfWeek];
}

// Hàm đánh giá ngày
function getDayRating(date: Date) {
    const dayOfWeek = date.getDay();
    const day = date.getDate();
    
    // Logic đơn giản để đánh giá ngày
    const score = (dayOfWeek + day) % 5;
    
    const ratings = [
        { level: 'Đại Cát', description: 'Ngày rất tốt, mọi việc đều hanh thông', color: 'text-green-600' },
        { level: 'Cát', description: 'Ngày tốt, thuận lợi cho các việc quan trọng', color: 'text-green-500' },
        { level: 'Bình', description: 'Ngày bình thường, nên thận trọng', color: 'text-blue-500' },
        { level: 'Hung', description: 'Ngày xấu, nên tránh các việc lớn', color: 'text-orange-500' },
        { level: 'Đại Hung', description: 'Ngày rất xấu, nên ở nhà nghỉ ngơi', color: 'text-red-500' },
    ];
    
    return ratings[score];
}

export async function GET() {
    try {
        const now = new Date();
        const lunar = solarToLunar(now);
        const canChi = getCanChi(now);
        const goodHours = getGoodHours(now);
        const badHours = getBadHours(now);
        const goodActivities = getGoodActivities(now);
        const badActivities = getBadActivities(now);
        const dayRating = getDayRating(now);
        
        const data = {
            solar: {
                year: now.getFullYear(),
                month: now.getMonth() + 1,
                day: now.getDate(),
                dayOfWeek: now.getDay(),
                dayName: now.toLocaleDateString('vi-VN', { weekday: 'long' }),
                fullDate: now.toLocaleDateString('vi-VN', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }),
            },
            lunar: {
                year: lunar.year,
                month: lunar.month,
                day: lunar.day,
                canChi,
            },
            dayRating,
            goodHours,
            badHours,
            goodActivities,
            badActivities,
        };
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Lunar calendar API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch lunar calendar data' },
            { status: 500 }
        );
    }
}
