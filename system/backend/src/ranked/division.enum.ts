export enum Division {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
  CHAMPION = 'champion',
}

export function getDivision(rating: number): Division {
  if (rating >= 5000) return Division.CHAMPION;
  if (rating >= 4000) return Division.DIAMOND;
  if (rating >= 3000) return Division.PLATINUM;
  if (rating >= 2000) return Division.GOLD;
  if (rating >= 1000) return Division.SILVER;
  return Division.BRONZE;
}
