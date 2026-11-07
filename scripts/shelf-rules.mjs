// First failed preference decides when a product leaves the shelf.
// Facts are the default. The illustrated scenario can opt into explicit,
// product-specific assumptions without changing the underlying process data.
export function firstFailure(p, rules, {includeAssumptions=false}={}) {
 if (p.protein < rules.proteinMin) return 1;
 if (p.sodium >= rules.sodiumUnder) return 2;
 if (p.fibre < rules.fibreMin) return 3;
 if (p.nonfried === false) return 4;
 if (includeAssumptions && p.nonfried == null && p.demoAssumedDeepFried === true) return 4;
 return 0;
}
