// Firebase hosting predeploy guard (Claude 1). The user's rule: The Hollow Crown ships only when all 24 campaigns
// are done; until then the live site keeps the old game. Deploying hosting therefore needs an explicit flag:
//   HOLLOW_CROWN_RELEASE=1 firebase deploy --only hosting
if (process.env.HOLLOW_CROWN_RELEASE !== '1') {
  console.error('\n✋ Hosting deploy blocked: The Hollow Crown is not released yet (docs/RELEASE.md).');
  console.error('   Deploying rules only?  firebase deploy --only firestore:rules');
  console.error('   This IS the launch?    HOLLOW_CROWN_RELEASE=1 firebase deploy --only hosting\n');
  process.exit(1);
}
console.log('Release flag set: deploying The Hollow Crown.');
