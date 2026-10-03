export const JOKES = [
  'Còn {ngay} ngày nữa là được lì xì, ráng ngoan nha!',
  'Còn {ngay} ngày nữa là Tết, kế hoạch giảm cân xin phép hoãn sang năm sau.',
  '{ngay} ngày nữa thôi, bánh chưng đang trên đường đến với bạn.',
  'Còn {ngay} ngày để tập trả lời câu "Bao giờ lấy vợ/chồng?".',
  'Còn {ngay} ngày nữa là được ngủ nướng hợp pháp.',
  'Còn {ngay} ngày, ví tiền bắt đầu run rẩy vì sắm Tết.',
  '{ngay} ngày nữa là hạt dưa, mứt gừng tràn ngập khắp nhà.',
  'Còn {ngay} ngày để dọn nhà… hoặc để giả vờ là đã dọn.',
  'Còn {ngay} ngày nữa là được diện áo mới đi chúc Tết.',
  '{ngay} ngày nữa, họ hàng sẽ hỏi "Lương tháng bao nhiêu?".',
  'Còn {ngay} ngày, nồi thịt kho trứng đã sẵn sàng tinh thần.',
  'Còn {ngay} ngày nữa là nhạc Tết vang khắp mọi ngả đường.',
  '{ngay} ngày nữa là tới mùa "ăn rồi nằm, nằm rồi ăn".',
  'Còn {ngay} ngày để luyện câu "An khang thịnh vượng, vạn sự như ý".',
  'Còn {ngay} ngày nữa, tủ lạnh sẽ chật kín đồ ăn.',
  '{ngay} ngày nữa thôi, sếp ơi cho về quê sớm nha!',
  'Còn {ngay} ngày nữa là được đếm tiền lì xì đến mỏi tay (mong là vậy).',
  'Còn {ngay} ngày, dưa hành đang chờ cứu bạn khỏi đầy bụng.',
  '{ngay} ngày nữa là hoa mai, hoa đào nở rộ khắp phố.',
  'Còn {ngay} ngày nữa là năm mới, deadline cũ làm ơn biến mất giùm.',
];

export function pickJoke(days, { random = Math.random, exclude = -1 } = {}) {
  const candidates = JOKES.map((_, i) => i).filter((i) => i !== exclude);
  const index = candidates[Math.floor(random() * candidates.length)];
  // Ngày cuối: "Còn 0 ngày" nghe kỳ, nói "chưa đầy 1 ngày" (viết hoa nếu đứng đầu câu).
  const text = JOKES[index].replaceAll('{ngay}', days === 0 ? 'chưa đầy 1' : String(days));
  return { index, text: text[0].toUpperCase() + text.slice(1) };
}
