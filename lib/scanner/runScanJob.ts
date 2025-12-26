import { executeScan } from "@/services/scanService";

export async function runScanJob(scanJobId: string) {
  return executeScan(scanJobId);
}
