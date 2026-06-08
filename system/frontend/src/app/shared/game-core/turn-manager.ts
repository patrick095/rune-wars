export class TurnManager {
  isPlayerTurn: boolean = true;
  turnNumber: number = 1;

  nextTurn(): void {
    this.isPlayerTurn = !this.isPlayerTurn;
    this.turnNumber++;
  }

  reset(): void {
    this.isPlayerTurn = true;
    this.turnNumber = 1;
  }
}
