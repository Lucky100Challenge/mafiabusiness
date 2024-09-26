export type Business = {
  id: number;
  name: string;
  type: string;
  level: number;
  legalIncome: number;
  illegalIncome: number;
  risk: number;
  staff: number;
  security: number;
};

export type RivalFamily = {
  name: string;
  power: number;
  relationship: number;
};

export const businessTypes = [
  { type: 'casino', legalIncome: 1000, illegalIncome: 2000, risk: 20, cost: 15000 },
  { type: 'laundromat', legalIncome: 500, illegalIncome: 1000, risk: 10, cost: 8000 },
  { type: 'restaurant', legalIncome: 800, illegalIncome: 1500, risk: 15, cost: 10000 },
  { type: 'nightclub', legalIncome: 1200, illegalIncome: 2500, risk: 25, cost: 20000 },
  { type: 'hotel', legalIncome: 1500, illegalIncome: 3000, risk: 30, cost: 25000 },
];

export function startGame(playerName: string): void {
  // ... (your startGame logic)
}

export function generateNewBusiness(playerName: string, existingBusinesses: Business[]): Business | null {
  const availableTypes = businessTypes.filter(type => !existingBusinesses.some(b => b.type === type.type));
  
  if (availableTypes.length === 0) {
    return null;
  }

  const newType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
  return {
    id: existingBusinesses.length + 1,
    name: `${playerName}'s ${newType.type.charAt(0).toUpperCase() + newType.type.slice(1)}`,
    type: newType.type,
    level: 1,
    legalIncome: newType.legalIncome,
    illegalIncome: newType.illegalIncome,
    risk: newType.risk,
    staff: 3,
    security: 1
  };
}

// Add other game logic functions here as needed