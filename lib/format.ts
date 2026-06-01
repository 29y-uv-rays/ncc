export function formatPlatoonLabel(platoon: string) {
  switch (platoon) {
    case "P1":
      return "Platoon 1";
    case "P2":
      return "Platoon 2";
    case "P3":
      return "Platoon 3";
    case "SPEC":
      return "Specialists";
    default:
      return platoon;
  }
}
