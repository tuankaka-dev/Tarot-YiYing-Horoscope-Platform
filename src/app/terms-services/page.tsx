import Link from 'next/link';

export default function TermsServicesPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-mystic-gold">Terms & Services</h1>
          <Link
            href="/"
            className="text-sm font-medium text-mystic-gold hover:text-mystic-gold/80 transition-colors"
          >
            Quay lại trang chủ
          </Link>
        </div>

        <p className="text-sm md:text-base text-muted-foreground">
          Điều khoản và thoả thuận sử dụng dịch vụ của Gieo Quẻ Online. Vui lòng đọc kỹ trước khi sử dụng các dịch vụ của chúng tôi. Bằng việc tiếp tục sử dụng, bạn đồng ý với các điều khoản này.
        </p>

        <section className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-5 md:p-6 space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Điều khoản sử dụng</h2>

          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              [1] Mô tả dịch vụ

                Website GieoQue.App - Ứng dụng tuvi.vn cung cấp các dịch vụ liên quan đến tử vi và phong thủy, bao gồm:
                Gieo quẻ kinh dịch
                Trải bài Tarot
                Xem tử vi
                Luận giải lá số Tử Vi - Kinh Dịch - Tarot
                Các dịch vụ này được cung cấp dưới dạng miễn phí và có tính phí.
            </p>
            <p>
              [2] Quyền và trách nhiệm của website - ứng dụng

            Website - ứng dụng có quyền thay đổi, bổ sung hoặc xóa bỏ bất kỳ phần nào của Thỏa thuận này mà không cần thông báo trước.
            Website - ứng dụng có quyền từ chối cung cấp dịch vụ cho bất kỳ người dùng nào vi phạm Thỏa thuận này.
            Website - ứng dụng nỗ lực để đảm bảo tính chính xác và cập nhật của thông tin trên website, tuy nhiên không đảm bảo tính tuyệt đối về độ chính xác của thông tin.
            Website - ứng dụng không chịu trách nhiệm về các thông tin, dịch vụ và nội dung của những website được kết nối. Bạn là người chịu hoàn toàn trách nhiệm trong việc sử dụng, khai thác, cung cấp thông tin cá nhân, v.v... cho các website này.
            </p>
            <p>
              [3] Bảo mật thông tin

Website không thu thập thông tin cá nhân của người dùng nhưng có quyền quản lí và sử dụng lịch sử gieo quẻ, trải bài tarot, lá số tử vi của người dùng cũng như xóa bỏ nếu cần thiết mà không báo trước.




            </p>
            <p>
              [4]Miễn trừ trách nhiệm

Website không chịu trách nhiệm về bất kỳ thiệt hại nào phát sinh từ việc sử dụng website hoặc thông tin trên website.
            </p>
            <p>
              [5] Chấm dứt dịch vụ

Website có quyền chấm dứt dịch vụ bất cứ lúc nào mà không cần thông báo trước.
            </p>
            <p>
            
            </p>

          </div>
        </section>
      </div>
    </div>
  );
}
