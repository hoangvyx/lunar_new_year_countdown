const CAN = ['Giáp', 'Ất', 'Bính', 'Đinh', 'Mậu', 'Kỷ', 'Canh', 'Tân', 'Nhâm', 'Quý'];
const CHI = ['Tý', 'Sửu', 'Dần', 'Mão', 'Thìn', 'Tỵ', 'Ngọ', 'Mùi', 'Thân', 'Dậu', 'Tuất', 'Hợi'];
// Con giáp kiểu Việt: Mão là Mèo.
const CON_GIAP = [
  ['Chuột', '🐭'], ['Trâu', '🐃'], ['Hổ', '🐯'], ['Mèo', '🐱'],
  ['Rồng', '🐲'], ['Rắn', '🐍'], ['Ngựa', '🐴'], ['Dê', '🐐'],
  ['Khỉ', '🐵'], ['Gà', '🐓'], ['Chó', '🐶'], ['Lợn', '🐷'],
];

export function getCanChi(year) {
  const can = CAN[(year + 6) % 10];
  const chiIndex = (year + 8) % 12;
  const chi = CHI[chiIndex];
  const [conGiap, emoji] = CON_GIAP[chiIndex];
  return { can, chi, conGiap, emoji, ten: `${can} ${chi}` };
}
