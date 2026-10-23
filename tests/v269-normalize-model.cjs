/* Reconstruct v268 source by removing only v269's display-only summary additions. */
const baseline=require('./v269-model-display-baseline.json');module.exports=source=>source.replace(/^  const pickupBelowMinimum=.*\n/m,'').replace(/^  const pickupSummary=.*$/m,baseline.pickupSummaryLine);
