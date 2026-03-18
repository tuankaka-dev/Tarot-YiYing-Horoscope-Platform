import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const hexagrams = [
    { id: 1, name: 'Quẻ Càn', chinese_name: '乾 (Qián)', meaning: 'Sức mạnh sáng tạo, trời, chủ động', trigram_above: 'Trời', trigram_below: 'Trời', description: 'Quẻ Càn tượng trưng cho sức mạnh thuần dương. Biểu thị sự mạnh mẽ, kiên trì và năng lượng sáng tạo. Trời trên trời dưới, thuần dương tối thượng.' },
    { id: 2, name: 'Quẻ Khôn', chinese_name: '坤 (Kūn)', meaning: 'Thuận theo, đất, tận tụy', trigram_above: 'Đất', trigram_below: 'Đất', description: 'Quẻ Khôn tượng trưng cho sức mạnh thuần âm. Biểu thị sự tận tụy, tiếp nhận và nuôi dưỡng. Đất trên đất dưới, thuần âm bao la.' },
    { id: 3, name: 'Quẻ Truân', chinese_name: '屯 (Zhūn)', meaning: 'Khó khăn ban đầu, nảy mầm', trigram_above: 'Nước', trigram_below: 'Sấm', description: 'Quẻ này chỉ những khó khăn và hỗn loạn xảy ra khi bắt đầu bất kỳ việc gì mới. Như hạt mầm đội đất, kiên trì sẽ dẫn đến thành công.' },
    { id: 4, name: 'Quẻ Mông', chinese_name: '蒙 (Méng)', meaning: 'Non nớt, học hỏi, ngây thơ', trigram_above: 'Núi', trigram_below: 'Nước', description: 'Quẻ này nói về sự non nớt và cần được hướng dẫn. Người học trò phải tìm thầy với lòng chân thành.' },
    { id: 5, name: 'Quẻ Nhu', chinese_name: '需 (Xū)', meaning: 'Chờ đợi, nuôi dưỡng, kiên nhẫn', trigram_above: 'Nước', trigram_below: 'Trời', description: 'Chờ đợi với sự tự tin và kiên định bên trong. Dinh dưỡng đến với người kiên nhẫn và tin tưởng vào thời cơ.' },
    { id: 6, name: 'Quẻ Tụng', chinese_name: '訟 (Sòng)', meaning: 'Tranh chấp, kiện tụng, xung đột', trigram_above: 'Trời', trigram_below: 'Nước', description: 'Xung đột nảy sinh khi sức mạnh gặp mưu mẹo. Hãy tìm người trung gian khôn ngoan, tránh đẩy mọi việc đến cực đoan.' },
    { id: 7, name: 'Quẻ Sư', chinese_name: '師 (Shī)', meaning: 'Quân đội, kỷ luật, lãnh đạo', trigram_above: 'Đất', trigram_below: 'Nước', description: 'Quẻ Sư biểu thị kỷ luật có tổ chức và nhu cầu lãnh đạo mạnh mẽ, giàu kinh nghiệm. Thành công đến từ sự đoàn kết.' },
    { id: 8, name: 'Quẻ Tỉ', chinese_name: '比 (Bǐ)', meaning: 'Đoàn kết, liên minh, tìm sự hợp nhất', trigram_above: 'Nước', trigram_below: 'Đất', description: 'Quẻ Tỉ biểu thị sức mạnh của sự đoàn kết và liên minh. Hãy tìm trung tâm ảnh hưởng và kết hợp với người cùng chí hướng.' },
    { id: 9, name: 'Quẻ Tiểu Súc', chinese_name: '小畜 (Xiǎo Chù)', meaning: 'Kiềm chế nhẹ, tích lũy nhỏ', trigram_above: 'Gió', trigram_below: 'Trời', description: 'Sức mạnh của cái nhỏ kiềm chế cái lớn bằng sự kiên trì nhẹ nhàng. Thành công đến từ nỗ lực nhỏ, đều đặn.' },
    { id: 10, name: 'Quẻ Lý', chinese_name: '履 (Lǚ)', meaning: 'Cẩn thận bước đi, lễ nghĩa', trigram_above: 'Trời', trigram_below: 'Đầm', description: 'Bước lên đuôi hổ mà nó không cắn. Nhờ cư xử đúng đắn và lạc quan bên trong, nguy hiểm được vượt qua an toàn.' },
    { id: 11, name: 'Quẻ Thái', chinese_name: '泰 (Tài)', meaning: 'Thái bình, thịnh vượng, trời đất giao hòa', trigram_above: 'Đất', trigram_below: 'Trời', description: 'Trời đất giao hòa, tạo nên thời kỳ thái bình thịnh vượng. Cái xấu ra đi, cái tốt đến — thời kỳ phúc lành.' },
    { id: 12, name: 'Quẻ Bĩ', chinese_name: '否 (Pǐ)', meaning: 'Bế tắc, trì trệ, suy thoái', trigram_above: 'Trời', trigram_below: 'Đất', description: 'Trời đất không giao hòa. Thời kỳ trì trệ và suy thoái. Cái tốt ra đi, cái xấu tiến đến.' },
    { id: 13, name: 'Quẻ Đồng Nhân', chinese_name: '同人 (Tóng Rén)', meaning: 'Cộng đồng, huynh đệ, người cùng chí hướng', trigram_above: 'Trời', trigram_below: 'Lửa', description: 'Đồng hành cùng người khác trong sự cởi mở. Tình bằng hữu phải dựa trên nguyên tắc chung, không phải lợi ích cá nhân.' },
    { id: 14, name: 'Quẻ Đại Hữu', chinese_name: '大有 (Dà Yǒu)', meaning: 'Dồi dào, đại phong thu, thành công lớn', trigram_above: 'Lửa', trigram_below: 'Trời', description: 'Lửa trên trời chiếu sáng vạn vật. Thời kỳ dồi dào và thành công lớn nhờ sự sáng suốt và mạnh mẽ.' },
    { id: 15, name: 'Quẻ Khiêm', chinese_name: '謙 (Qiān)', meaning: 'Khiêm tốn, điều độ, giản dị', trigram_above: 'Đất', trigram_below: 'Núi', description: 'Núi trong lòng đất — sự vĩ đại ẩn trong khiêm tốn. Đạo trời là làm đầy kẻ khiêm tốn, bớt đi kẻ kiêu ngạo.' },
    { id: 16, name: 'Quẻ Dự', chinese_name: '豫 (Yù)', meaning: 'Hào hứng, vui vẻ, hành động hài hòa', trigram_above: 'Sấm', trigram_below: 'Đất', description: 'Sấm vang từ đất với sức mạnh lớn. Sự hào hứng truyền cảm hứng cho người khác và đưa mọi thứ vào hoạt động.' },
    { id: 17, name: 'Quẻ Tùy', chinese_name: '隨 (Suí)', meaning: 'Thích ứng, theo, phục vụ vui vẻ', trigram_above: 'Đầm', trigram_below: 'Sấm', description: 'Muốn lãnh đạo, trước tiên phải biết theo. Khả năng thích ứng và sẵn lòng phục vụ mang lại thành công lớn.' },
    { id: 18, name: 'Quẻ Cổ', chinese_name: '蠱 (Gǔ)', meaning: 'Sửa chữa, hư hại, canh tân', trigram_above: 'Núi', trigram_below: 'Gió', description: 'Những gì đã hư hỏng do xao nhãng phải được chỉnh đốn. Công việc sửa chữa này mang lại thành công lớn khi tiếp cận với quyết tâm.' },
    { id: 19, name: 'Quẻ Lâm', chinese_name: '臨 (Lín)', meaning: 'Đến gần, tiến bước, trở nên lớn lao', trigram_above: 'Đất', trigram_below: 'Đầm', description: 'Thời kỳ tiến gần và mở rộng. Hai hào dương ở dưới đang tăng trưởng, biểu thị ảnh hưởng và sức mạnh ngày càng lớn.' },
    { id: 20, name: 'Quẻ Quán', chinese_name: '觀 (Guān)', meaning: 'Quan sát, suy ngẫm, nhìn vào bên trong', trigram_above: 'Gió', trigram_below: 'Đất', description: 'Gió thổi trên mặt đất, đến mọi nơi. Qua việc chiêm nghiệm ý nghĩa sâu xa của vũ trụ, ta đạt được sự hiểu biết.' },
    { id: 21, name: 'Quẻ Phệ Hạp', chinese_name: '噬嗑 (Shì Kè)', meaning: 'Công lý, quyết đoán, vượt chướng ngại', trigram_above: 'Lửa', trigram_below: 'Sấm', description: 'Chướng ngại giữa hai hàm răng phải được cắn qua. Quẻ này chỉ sự cần thiết của quyết định mạnh mẽ và thực thi công lý.' },
    { id: 22, name: 'Quẻ Bí', chinese_name: '賁 (Bì)', meaning: 'Trang hoàng, vẻ đẹp, thanh lịch', trigram_above: 'Núi', trigram_below: 'Lửa', description: 'Lửa dưới chân núi chiếu sáng và tô đẹp. Vẻ đẹp bên ngoài cần nội dung bên trong làm nền tảng.' },
    { id: 23, name: 'Quẻ Bác', chinese_name: '剝 (Bō)', meaning: 'Suy tàn, mục nát, bóc tách', trigram_above: 'Núi', trigram_below: 'Đất', description: 'Thế lực tối đang trỗi dậy. Không nên tiến hành bất cứ việc gì lúc này — phải chờ chu kỳ tự nhiên xoay chuyển.' },
    { id: 24, name: 'Quẻ Phục', chinese_name: '復 (Fù)', meaning: 'Trở lại, đổi mới, ánh sáng quay về', trigram_above: 'Đất', trigram_below: 'Sấm', description: 'Sau thời kỳ suy tàn là bước ngoặt. Sấm trong lòng đất báo hiệu ánh sáng trở lại. Cái cũ ra đi, cái mới bắt đầu.' },
    { id: 25, name: 'Quẻ Vô Vọng', chinese_name: '無妄 (Wú Wàng)', meaning: 'Ngây thơ, tự nhiên, bất ngờ', trigram_above: 'Trời', trigram_below: 'Sấm', description: 'Hành động với sự ngây thơ và tự nhiên, không có động cơ ẩn. Khi rời xa sự ngây thơ, tai họa sẽ đến.' },
    { id: 26, name: 'Quẻ Đại Súc', chinese_name: '大畜 (Dà Chù)', meaning: 'Tích lũy lớn, kiềm chế cái lớn', trigram_above: 'Núi', trigram_below: 'Trời', description: 'Sức sáng tạo của trời bị núi kiềm chế. Biểu thị sự tích lũy trí tuệ, đức hạnh và nguồn lực.' },
    { id: 27, name: 'Quẻ Di', chinese_name: '頤 (Yí)', meaning: 'Nuôi dưỡng, cung cấp, miệng', trigram_above: 'Núi', trigram_below: 'Sấm', description: 'Hãy quan sát cách nuôi dưỡng và người ta tìm gì để đưa vào miệng. Chú ý cả dinh dưỡng vật chất lẫn tinh thần.' },
    { id: 28, name: 'Quẻ Đại Quá', chinese_name: '大過 (Dà Guò)', meaning: 'Vượt quá mức, thời điểm đặc biệt', trigram_above: 'Đầm', trigram_below: 'Gió', description: 'Đòn dông đang cong xuống sắp gãy. Thời kỳ đặc biệt đòi hỏi biện pháp đặc biệt — hành động độc lập và dũng cảm.' },
    { id: 29, name: 'Quẻ Khảm', chinese_name: '坎 (Kǎn)', meaning: 'Hiểm nguy, nước, vực thẳm', trigram_above: 'Nước', trigram_below: 'Nước', description: 'Hiểm nguy chồng hiểm nguy — vực thẳm kép. Trong thời kỳ nguy hiểm liên tiếp, giữ lòng chân thành và chảy như nước qua chướng ngại.' },
    { id: 30, name: 'Quẻ Ly', chinese_name: '離 (Lí)', meaning: 'Sáng sủa, lửa, rực rỡ, phụ thuộc', trigram_above: 'Lửa', trigram_below: 'Lửa', description: 'Lửa chồng lửa — sáng ngời trên sáng ngời. Như lửa phải bám vào vật gì đó mới cháy, hãy nuôi dưỡng ánh sáng bên trong.' },
    { id: 31, name: 'Quẻ Hàm', chinese_name: '咸 (Xián)', meaning: 'Thu hút, ảnh hưởng lẫn nhau, tương tác', trigram_above: 'Đầm', trigram_below: 'Núi', description: 'Đầm trên núi — ảnh hưởng thông qua sự tiếp nhận. Sự thu hút và ảnh hưởng lẫn nhau dẫn đến thành công khi tâm mở rộng và chân thành.' },
    { id: 32, name: 'Quẻ Hằng', chinese_name: '恆 (Héng)', meaning: 'Kiên trì, bền bỉ, hằng tâm', trigram_above: 'Sấm', trigram_below: 'Gió', description: 'Sấm và gió tăng cường lẫn nhau không ngừng. Sự bền bỉ không phải cứng nhắc mà là vận động tự đổi mới không kiệt sức.' },
    { id: 33, name: 'Quẻ Độn', chinese_name: '遯 (Dùn)', meaning: 'Rút lui chiến lược, nhường bước', trigram_above: 'Trời', trigram_below: 'Núi', description: 'Núi dưới trời — cái nhỏ tiến lên, cái lớn rút lui. Rút lui chiến lược không phải thất bại mà là trí tuệ trước nghịch cảnh.' },
    { id: 34, name: 'Quẻ Đại Tráng', chinese_name: '大壯 (Dà Zhuàng)', meaning: 'Sức mạnh lớn, quyền lực, khí thế', trigram_above: 'Sấm', trigram_below: 'Trời', description: 'Sấm trên trời — sức mạnh lớn. Nhưng sức mạnh phải được thực hành với chính nghĩa, nếu không trở thành bạo lực dẫn đến tai họa.' },
    { id: 35, name: 'Quẻ Tấn', chinese_name: '晉 (Jìn)', meaning: 'Tiến bộ, thăng tiến, mặt trời mọc', trigram_above: 'Lửa', trigram_below: 'Đất', description: 'Mặt trời mọc trên mặt đất — tiến bộ và mở rộng. Thời kỳ thăng tiến dễ dàng khi một người được nhận ra và tưởng thưởng.' },
    { id: 36, name: 'Quẻ Minh Di', chinese_name: '明夷 (Míng Yí)', meaning: 'Ánh sáng bị che, nghịch cảnh, ẩn tài', trigram_above: 'Đất', trigram_below: 'Lửa', description: 'Ánh sáng đã chìm vào lòng đất — trí tuệ phải được che giấu. Trong thời tối tăm, hãy giấu ánh sáng và giữ sức mạnh bên trong.' },
    { id: 37, name: 'Quẻ Gia Nhân', chinese_name: '家人 (Jiā Rén)', meaning: 'Gia đình, gia tộc', trigram_above: 'Gió', trigram_below: 'Lửa', description: 'Gió từ lửa — hơi ấm tỏa ra bên ngoài. Gia đình là nền tảng của xã hội. Khi mọi người rõ vai trò và hòa thuận, mọi thứ đều hưng thịnh.' },
    { id: 38, name: 'Quẻ Khuê', chinese_name: '睽 (Kuí)', meaning: 'Đối lập, phân kỳ, hiểu lầm', trigram_above: 'Lửa', trigram_below: 'Đầm', description: 'Lửa trên, đầm dưới — chúng đi ngược chiều nhau. Trong thời kỳ đối lập, tìm điểm chung trong chuyện nhỏ thay vì ép buộc sự thống nhất.' },
    { id: 39, name: 'Quẻ Kiển', chinese_name: '蹇 (Jiǎn)', meaning: 'Gian khó, trở ngại, khập khiễng', trigram_above: 'Nước', trigram_below: 'Núi', description: 'Nước trên núi — nguy hiểm phía trước, tĩnh lặng bên trong. Khi gặp trở ngại, hãy nhìn vào bên trong tìm sức mạnh và tìm đồng minh.' },
    { id: 40, name: 'Quẻ Giải', chinese_name: '解 (Xiè)', meaning: 'Giải thoát, giải phóng, hóa giải', trigram_above: 'Sấm', trigram_below: 'Nước', description: 'Sấm và mưa đến — giải thoát. Căng thẳng được phá vỡ. Hãy tha thứ lỗi lầm và nhanh chóng trở lại bình thường.' },
    { id: 41, name: 'Quẻ Tổn', chinese_name: '損 (Sǔn)', meaning: 'Giảm bớt, hy sinh, đơn giản hóa', trigram_above: 'Núi', trigram_below: 'Đầm', description: 'Đầm dưới chân núi bốc hơi lên trên. Giảm dưới để tăng trên — sự hy sinh chân thành mang lại phúc lành.' },
    { id: 42, name: 'Quẻ Ích', chinese_name: '益 (Yì)', meaning: 'Tăng trưởng, lợi ích, phát triển', trigram_above: 'Gió', trigram_below: 'Sấm', description: 'Gió và sấm — tăng trưởng qua hoạt động. Khi người trên bớt đi cho người dưới, niềm vui tràn ngập khắp nơi.' },
    { id: 43, name: 'Quẻ Quải', chinese_name: '夬 (Guài)', meaning: 'Đột phá, quyết tâm, loại bỏ hư hỏng', trigram_above: 'Đầm', trigram_below: 'Trời', description: 'Đầm dâng lên trời — con đập sắp vỡ. Quyết tâm phơi bày và loại bỏ những gì có hại. Tiến hành cẩn thận và chính trực.' },
    { id: 44, name: 'Quẻ Cấu', chinese_name: '姤 (Gòu)', meaning: 'Gặp gỡ, cám dỗ, cuộc gặp bất ngờ', trigram_above: 'Trời', trigram_below: 'Gió', description: 'Gió thổi dưới trời, lan tỏa mọi hướng. Cuộc gặp bất ngờ — hãy cẩn thận với ảnh hưởng tiêu cực tuy có vẻ hấp dẫn.' },
    { id: 45, name: 'Quẻ Tụy', chinese_name: '萃 (Cuì)', meaning: 'Tụ họp, tập hợp, hội tụ', trigram_above: 'Đầm', trigram_below: 'Đất', description: 'Đầm trên đất tụ nước. Thời kỳ tụ họp — đoàn kết mọi người quanh mục tiêu xứng đáng với sự chuẩn bị kỹ lưỡng.' },
    { id: 46, name: 'Quẻ Thăng', chinese_name: '升 (Shēng)', meaning: 'Đi lên, phát triển, thăng tiến dần', trigram_above: 'Đất', trigram_below: 'Gió', description: 'Cây mọc trong lòng đất — vươn lên bằng nỗ lực. Nỗ lực kiên định và quyết tâm dẫn đến thăng tiến. Tìm người lãnh đạo giỏi để hướng dẫn.' },
    { id: 47, name: 'Quẻ Khốn', chinese_name: '困 (Kùn)', meaning: 'Kiệt sức, bị giam, nghịch cảnh', trigram_above: 'Đầm', trigram_below: 'Nước', description: 'Đầm cạn nước — kiệt sức. Dù bị áp bức, người quân tử vẫn đặt cược tính mệnh theo ý chí mình. Lời nói không được tin trong thời khốn khó.' },
    { id: 48, name: 'Quẻ Tỉnh', chinese_name: '井 (Jǐng)', meaning: 'Nguồn, chiều sâu, tài nguyên bất tận', trigram_above: 'Nước', trigram_below: 'Gió', description: 'Nước trên gỗ — giếng kéo nước lên. Giếng là nguồn bất tận. Phải đi sâu vào nguồn nước bên trong để nuôi dưỡng người khác.' },
    { id: 49, name: 'Quẻ Cách', chinese_name: '革 (Gé)', meaning: 'Cải cách, chuyển đổi, lột xác', trigram_above: 'Đầm', trigram_below: 'Lửa', description: 'Lửa trong đầm — cách mạng. Khi thay đổi là cần thiết, phải thực hiện đúng thời, giao tiếp rõ ràng và chân thành bên trong.' },
    { id: 50, name: 'Quẻ Đỉnh', chinese_name: '鼎 (Dǐng)', meaning: 'Nuôi dưỡng, chuyển hóa, tinh hoa văn hóa', trigram_above: 'Lửa', trigram_below: 'Gió', description: 'Lửa trên gỗ — cái đỉnh. Hình ảnh của tinh hoa văn hóa và dinh dưỡng tinh thần tối thượng. Chuyển hóa qua sự phục vụ tận tụy.' },
    { id: 51, name: 'Quẻ Chấn', chinese_name: '震 (Zhèn)', meaning: 'Chấn động, sấm sét, thức tỉnh', trigram_above: 'Sấm', trigram_below: 'Sấm', description: 'Sấm chồng sấm — chấn động đến. Chấn động ban đầu gây sợ hãi, nhưng sau đó là tiếng cười và niềm vui. Dùng chấn động làm chất xúc tác tự nhìn nhận bản thân.' },
    { id: 52, name: 'Quẻ Cấn', chinese_name: '艮 (Gèn)', meaning: 'Tĩnh lặng, thiền định, nghỉ ngơi', trigram_above: 'Núi', trigram_below: 'Núi', description: 'Núi chồng núi — giữ yên. Sự tĩnh lặng đạt được khi biết khi nào nên dừng. Qua thiền định và bình thản, ta đạt được sự sáng suốt.' },
    { id: 53, name: 'Quẻ Tiệm', chinese_name: '漸 (Jiàn)', meaning: 'Tiến triển dần dần, phát triển đều đặn', trigram_above: 'Gió', trigram_below: 'Núi', description: 'Cây trên núi phát triển chậm nhưng chắc chắn. Tiến triển dần dần — mỗi bước phải hoàn thành trước khi bước tiếp. Kiên nhẫn mang lại vận tốt.' },
    { id: 54, name: 'Quẻ Quy Muội', chinese_name: '歸妹 (Guī Mèi)', meaning: 'Duyên phận, vai phụ, thích nghi', trigram_above: 'Sấm', trigram_below: 'Đầm', description: 'Sấm trên đầm — tương tác. Hành động đem lại bất lợi. Hiểu vị trí của mình và tận dụng tình huống bằng sự duyên dáng và khéo léo.' },
    { id: 55, name: 'Quẻ Phong', chinese_name: '豐 (Fēng)', meaning: 'Phong phú, đỉnh cao, thịnh vượng nhất', trigram_above: 'Sấm', trigram_below: 'Lửa', description: 'Sấm và chớp cùng đến — phong phú và sáng chói ở đỉnh cao. Đừng buồn — hãy trân trọng sự đầy đủ của khoảnh khắc, vì thời kỳ này rồi sẽ qua.' },
    { id: 56, name: 'Quẻ Lữ', chinese_name: '旅 (Lǚ)', meaning: 'Du hành, quá cảnh, người lạ', trigram_above: 'Lửa', trigram_below: 'Núi', description: 'Lửa trên núi cháy nhanh rồi di chuyển. Người lữ hành phải cẩn thận, khiêm tốn, và không nán lại quá lâu ở bất kỳ nơi nào.' },
    { id: 57, name: 'Quẻ Tốn', chinese_name: '巽 (Xùn)', meaning: 'Thấm nhuần, gió, ảnh hưởng nhẹ nhàng', trigram_above: 'Gió', trigram_below: 'Gió', description: 'Gió chồng gió — nhẹ nhàng nhưng thấm nhuần. Như gió, ảnh hưởng nhẹ đạt được điều mà sức mạnh không thể. Kiên trì trong việc nhỏ mang lại thành công lớn.' },
    { id: 58, name: 'Quẻ Đoài', chinese_name: '兌 (Duì)', meaning: 'Vui vẻ, hoan hỉ, cởi mở, đầm', trigram_above: 'Đầm', trigram_below: 'Đầm', description: 'Đầm chồng đầm — niềm vui đích thực. Niềm vui không dựa trên sự chân thành bên trong thì nông cạn và sẽ thất bại. Niềm vui thật sự tăng sức mạnh cho thử thách phía trước.' },
    { id: 59, name: 'Quẻ Hoán', chinese_name: '渙 (Huàn)', meaning: 'Tiêu tan, phân tán, vượt qua bản ngã', trigram_above: 'Gió', trigram_below: 'Nước', description: 'Gió trên nước — tiêu tan. Hòa tan sự cứng nhắc và bản ngã. Qua nghi lễ và mục tiêu chung, năng lượng phân tán được tập hợp lại.' },
    { id: 60, name: 'Quẻ Tiết', chinese_name: '節 (Jié)', meaning: 'Tiết chế, kiềm chế, đặt ranh giới', trigram_above: 'Nước', trigram_below: 'Đầm', description: 'Nước trên đầm — giới hạn. Như đầm có bờ, giới hạn hợp lý là cần thiết cho trật tự. Nhưng giới hạn không được quá khắt khe.' },
    { id: 61, name: 'Quẻ Trung Phu', chinese_name: '中孚 (Zhōng Fú)', meaning: 'Chân thành, tự tin, chân thật bên trong', trigram_above: 'Gió', trigram_below: 'Đầm', description: 'Gió trên đầm — sự chân thành bên trong lay chuyển thế giới bên ngoài. Khi tràn đầy sự chân thành, ngay cả heo và cá cũng bị ảnh hưởng.' },
    { id: 62, name: 'Quẻ Tiểu Quá', chinese_name: '小過 (Xiǎo Guò)', meaning: 'Vượt quá nhỏ, chú ý chi tiết', trigram_above: 'Sấm', trigram_below: 'Núi', description: 'Sấm trên núi — cái nhỏ vượt quá. Trong việc nhỏ có thể đi xa, nhưng trong việc lớn không được vượt quá. Chú ý chi tiết với sự khiêm tốn.' },
    { id: 63, name: 'Quẻ Ký Tế', chinese_name: '既濟 (Jì Jì)', meaning: 'Đã hoàn thành, trật tự, chuyển giao xong', trigram_above: 'Nước', trigram_below: 'Lửa', description: 'Nước trên lửa — mọi thứ đúng vị trí. Ngay cả sau khi hoàn thành, vẫn phải cảnh giác. Trật tự có thể dễ dàng tan rã nếu lơ là.' },
    { id: 64, name: 'Quẻ Vị Tế', chinese_name: '未濟 (Wèi Jì)', meaning: 'Chưa hoàn thành, chuyển giao, gần đến', trigram_above: 'Lửa', trigram_below: 'Nước', description: 'Lửa trên nước — mọi thứ chưa đúng chỗ. Giai đoạn chuyển giao cuối cùng đòi hỏi sự cẩn thận và phân biệt. Kết thúc chứa mầm khởi đầu mới.' },
];

async function main() {
    console.log('🌿 Đang seed dữ liệu...');

    // Seed hexagrams
    for (const hex of hexagrams) {
        await prisma.hexagram.upsert({
            where: { id: hex.id },
            update: hex,
            create: hex,
        });
    }
    console.log(`✅ Đã seed ${hexagrams.length} quẻ dịch`);

    // Seed default API config
    const existingConfig = await prisma.apiConfig.findFirst({
        where: { provider: 'gemini' },
    });

    if (!existingConfig) {
        await prisma.apiConfig.create({
            data: {
                name: 'Gemini 2.0 Flash (Mặc định)',
                provider: 'gemini',
                base_url: 'https://generativelanguage.googleapis.com/v1beta',
                api_key: process.env.GEMINI_API_KEY || 'your-gemini-api-key',
                status: 'active',
            },
        });
        console.log('✅ Đã seed cấu hình API Gemini mặc định');
    }

    console.log('🎋 Seed hoàn tất!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
